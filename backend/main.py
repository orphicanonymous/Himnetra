"""HIMNETRA API - serves the outputs of the Colab pipeline (backend/data/*.json) in the shapes the React app expects.
Run:  uvicorn main:app --reload --port 8000        Docs: http://localhost:8000/docs"""
import datetime, json, os, threading
import re
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, model_validator
import flood, notify, reports as rpt

BACKEND_DIR = Path(__file__).parent
DATA = Path(os.environ.get("HIMNETRA_DATA", BACKEND_DIR / "data"))
REPORTS = DATA / "reports"; REPORTS.mkdir(parents=True, exist_ok=True)
REGION = "Himachal Pradesh, India"
app = FastAPI(title="HIMNETRA API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── data access (re-reads a file automatically when you replace it) ─────────────
_cache, _lock = {}, threading.Lock()
def load(name, default=None, directory=DATA):
    p = directory / name
    if not p.exists():
        if default is not None: return default
        raise HTTPException(503, f"{name} is missing in backend/data/ - copy the Colab outputs there")
    m = p.stat().st_mtime
    with _lock:
        if name not in _cache or _cache[name][0] != m: _cache[name] = (m, json.loads(p.read_text()))
        return _cache[name][1]

def save_state(s): (DATA / "state.json").write_text(json.dumps(s, indent=1))
def state(): return load("state.json", {"acked": [], "last_sim": {}, "subscribers": [], "reports": []})

def lakes(): return load("lakes.json")
def lake_or_404(i):
    for l in lakes():
        if l["id"] == i: return l
    raise HTTPException(404, f"lake {i} not found")
def now(): return datetime.datetime.now().isoformat(timespec="seconds")

# ── lakes ───────────────────────────────────────────────────────────────────────
@app.get("/health")
def health(): return {"ok": True, "lakes": len(lakes()), "time": now()}

@app.get("/lakes")
def get_lakes(): return lakes()

@app.get("/lakes/{lid}")
def get_lake(lid: str): return lake_or_404(lid)

@app.get("/lakes/{lid}/history")
def history(lid: str):
    ts = load("timeseries.json").get(lid)
    if ts is None: raise HTTPException(404, "no time series")
    return [{"date": p["date"], "area": p["area"]} for p in ts]

@app.get("/lakes/{lid}/risk")
def risk(lid: str):
    for r in load("risk.json"):
        if r["lakeId"] == lid: return r
    raise HTTPException(404, "no risk assessment")

@app.get("/lakes/{lid}/segmentation")
def segmentation(lid: str):
    lake_or_404(lid)
    for s in load("segmentation.json"):
        if s["lakeId"] == lid: return s
    raise HTTPException(404, "no segmentation result for this lake")

@app.get("/lakes/{lid}/polygon")
def polygon(lid: str):
    fs = [f for f in load("polygons.geojson")["features"] if f["properties"]["lakeId"] == lid]
    return {"type": "FeatureCollection", "features": fs}

@app.get("/polygons")
def polygons(): return load("polygons.geojson")

@app.get("/backtest")
def backtest():
    return {"yearly": load("backtest.json", []), "beforeAfter": load("backtest_before_after.json", {}),
            "note": "South Lhonak (Sikkim) - outside Himachal, used only to validate event detection."}

# ── flood scenarios ─────────────────────────────────────────────────────────────
class RunReq(BaseModel):
    lakeId: str
    scenario: str = "MAJOR"

@app.post("/analysis/run")
def run(req: RunReq):
    try:
        sim = flood.simulate(lake_or_404(req.lakeId), req.scenario, DATA)
    except flood.SimulationUnavailableError as error:
        raise HTTPException(404, str(error)) from error
    except flood.InvalidScenarioError as error:
        raise HTTPException(422, str(error)) from error
    s = state(); s["last_sim"][req.lakeId] = sim; save_state(s); return sim

@app.get("/lakes/{lid}/flood-map")
def flood_map(lid: str):
    lake_or_404(lid)
    return state()["last_sim"].get(lid)

@app.get("/lakes/{lid}/flood-polygon")
def flood_polygon(lid: str, scenario: str = "MAJOR"):
    lake_or_404(lid)
    if scenario not in flood.SCENARIOS:
        raise HTTPException(422, "scenario must be MINOR, MODERATE, MAJOR, or EXTREME")
    if not (BACKEND_DIR / "flood_polygons.geojson").exists():
        raise HTTPException(503, "flood_polygons.geojson is missing in backend/")
    features = load("flood_polygons.geojson", directory=BACKEND_DIR)["features"]
    return {
        "type": "FeatureCollection",
        "features": [
            feature for feature in features
            if feature["properties"]["lakeId"] == lid and feature["properties"]["scenario"] == scenario
        ],
    }

@app.get("/simulations")
def simulations():
    results = []
    for lake in lakes():
        if not lake.get("priority"):
            continue
        try:
            results.append(flood.simulate(lake, "MAJOR", DATA))
        except flood.SimulationUnavailableError:
            continue
    return results

# ── alerts (computed from the real lake data) ───────────────────────────────────
def build_alerts():
    out, ack, n = [], set(state()["acked"]), 0
    ts, risks = load("timeseries.json"), {r["lakeId"]: r for r in load("risk.json")}
    def add(kind, title, l, level, status, desc, when):
        nonlocal n; n += 1; aid = f"ALT-{kind[:3]}-{l['id'] if l else 'SYS'}"
        out.append(dict(id=aid, type=kind, title=title, lakeId=l and l["id"], lakeName=l and l["name"], riskLevel=level,
                        status="ACKNOWLEDGED" if aid in ack else status, detectedAt=when, updatedAt=when, description=desc,
                        acknowledged=aid in ack))
    for l in lakes():
        when = l["lastUpdated"] + "T00:00:00Z"; r = risks.get(l["id"])
        if l["riskLevel"] in ("CRITICAL", "HIGH"):
            top = sorted(r["factors"], key=lambda f: -f["contribution"])[:2] if r else []
            add("GLOF_RISK", f"GLOF risk {l['riskLevel'].title()} - {l['name']}", l, l["riskLevel"], "ACTIVE",
                f"Relative risk score {l['riskScore']}/100" + (f"; main drivers: {', '.join(f['name'] for f in top)}." if top else "."), when)
        if l.get("growthReliable", True) and l["areaChangePct"] > 25 and l["currentArea"] >= 0.1:
            add("RAPID_EXPANSION", f"Area increase +{l['areaChangePct']:.0f}% - {l['name']}", l, "HIGH", "ACTIVE",
                f"Area grew from {l['previousArea']:.2f} to {l['currentArea']:.2f} km2 since the first observation.", when)
        s = ts.get(l["id"], [])
        if len(s) >= 3 and l["currentArea"] >= 0.1:
            prev = sum(p["area"] for p in s[:-1]) / (len(s) - 1)
            if s[-1]["area"] > 1.25 * prev:
                add("ANOMALY", f"Latest area above its history - {l['name']}", l, "MEDIUM", "MONITORING",
                    f"Latest area {s[-1]['area']:.2f} km2 vs earlier mean {prev:.2f} km2 (composites vary about 10-15%, so verify).", when)
    return out

@app.get("/alerts")
def alerts(): return build_alerts()

@app.post("/alerts/{aid}/acknowledge")
def ack(aid: str):
    s = state()
    if aid not in s["acked"]: s["acked"].append(aid); save_state(s)
    return {"ok": True}

class SubReq(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=32)
    email: str | None = Field(default=None, max_length=254)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)

    @model_validator(mode="after")
    def validate_contact(self):
        self.name = self.name.strip()
        if not self.name:
            raise ValueError("name must not be blank")

        self.email = self.email.strip() if self.email else None
        self.phone = self.phone.strip() if self.phone else None
        if not self.email and not self.phone:
            raise ValueError("provide at least one contact method: email or phone")
        if self.email and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", self.email):
            raise ValueError("email address is invalid")
        if self.phone and not re.fullmatch(r"\+?[0-9][0-9 ()-]{6,19}", self.phone):
            raise ValueError("phone number is invalid")
        return self

@app.post("/subscribers")
def subscribe(sub: SubReq):
    s = state(); s["subscribers"].append(sub.model_dump()); save_state(s); return {"ok": True, "count": len(s["subscribers"])}

@app.get("/subscribers")
def subscribers():
    mask = lambda p: ("*" * (len(p) - 4) + p[-4:]) if p else None
    return [{**x, "phone": mask(x.get("phone"))} for x in state()["subscribers"]]

@app.post("/alerts/notify/{lid}")
def notify_lake(lid: str, radius_km: float = Query(default=30.0, gt=0, le=500)):
    l = lake_or_404(lid); subs = notify.affected_subscribers(l, state()["subscribers"], radius_km)
    msg = f"HIMNETRA alert: {l['name']} ({l['district']}) risk {l['riskLevel']} ({l['riskScore']}/100). Follow instructions of the district disaster authority."
    res = [{"name": s["name"], "email": notify.send_email(s["email"], f"HIMNETRA alert - {l['name']}", msg) if s.get("email") else None,
            "sms": notify.send_sms(s["phone"], msg) if s.get("phone") else None} for s in subs]
    return {"lake": lid, "radiusKm": radius_km, "recipients": len(res), "results": res}

# ── satellite, reports, notifications, system, dashboard ───────────────────────
@app.get("/satellite/sources")
def sources():
    n = f"{len(lakes())} lakes in prepared outputs"
    mk = lambda i, nm, sn, t, res, rev: dict(id=i, name=nm, shortName=sn, type=t, resolution=res, coverage=n, revisitTime=rev)
    return [mk("S2-MSI", "Sentinel-2 MSI (surface reflectance)", "Sentinel-2", "OPTICAL", "10 m / 20 m", "5 days"),
            mk("S1-SAR", "Sentinel-1 SAR (C-band, VV)", "Sentinel-1", "SAR", "10 m (IW GRD)", "6-12 days"),
            mk("SRTM", "SRTM 30 m DEM", "SRTM", "DEM", "30 m", "static"),
            mk("ERA5", "ERA5-Land (temperature, precipitation)", "ERA5-Land", "METEO", "~9 km", "monthly aggregate")]

@app.get("/satellite/observations")
def observations(lakeId: str | None = None):
    records = load("observations.json", [])
    if not isinstance(records, list):
        raise HTTPException(503, "observations.json must contain a list of acquisition records")
    return [record for record in records if not lakeId or record["lakeId"] == lakeId]

class ReportReq(BaseModel):
    type: str
    lakeId: str | None = None

@app.get("/reports")
def list_reports(): return state()["reports"]

@app.post("/reports")
def make_report(req: ReportReq):
    ls = [lake_or_404(req.lakeId)] if req.lakeId else lakes()
    risks = {r["lakeId"]: r for r in load("risk.json")}; hist = load("timeseries.json")
    sim = None
    if len(ls) == 1 and req.type == "FLOOD_SIMULATION":
        try:
            sim = flood.simulate(ls[0], "MAJOR", DATA)
        except flood.SimulationUnavailableError as error:
            raise HTTPException(404, str(error)) from error
    rid = f"RPT-{datetime.datetime.now():%Y%m%d%H%M%S}"; path = REPORTS / f"{rid}.pdf"
    rpt.make_pdf(path, req.type, ls, risks, hist, sim, REGION)
    rec = dict(id=rid, title=f"{rpt.TITLES.get(req.type, req.type)} - {ls[0]['name'] if req.lakeId else 'All lakes'}", type=req.type,
               lakeId=req.lakeId, lakeName=ls[0]["name"] if req.lakeId else None, generatedAt=now(), status="READY",
               fileSize=f"{path.stat().st_size/1024:.0f} KB")
    s = state(); s["reports"].insert(0, rec); save_state(s); return rec

@app.get("/reports/{rid}/download")
def download(rid: str):
    p = REPORTS / f"{rid}.pdf"
    if not p.exists(): raise HTTPException(404, "report not found")
    return FileResponse(p, media_type="application/pdf", filename=f"{rid}.pdf")

@app.get("/notifications")
def notifications():
    return [dict(id=f"N-{i}", title=a["title"], message=a["description"], type="ALERT", read=a["acknowledged"], timestamp=a["detectedAt"],
                 lakeId=a["lakeId"]) for i, a in enumerate(build_alerts()[:6])]

@app.get("/system/status")
def system():
    files = ["lakes.json", "risk.json", "timeseries.json", "polygons.geojson", "segmentation.json", "metrics.json"]
    ok = all((DATA / f).exists() for f in files)
    mk = lambda n, good, bad="DEGRADED": dict(name=n, status="OPERATIONAL" if good else bad, lastChecked=now())
    return [mk("API server", True), mk("Lake data store", ok, "DOWN"), mk("Segmentation outputs", (DATA / "metrics.json").exists()),
            mk("Flood routing results", (DATA / "flood_results.json").exists() or (BACKEND_DIR / "flood_results.json").exists()), mk("E-mail alerts", notify.email_configured()),
            mk("SMS alerts", notify.sms_configured())]

@app.get("/data/status")
def data_status():
    outputs = [
        ("Lake records", DATA / "lakes.json"),
        ("Risk assessments", DATA / "risk.json"),
        ("Area time series", DATA / "timeseries.json"),
        ("Segmentation results", DATA / "segmentation.json"),
        ("Satellite observations", DATA / "observations.json"),
        ("Flood routing results", DATA / "flood_results.json"),
    ]
    if not outputs[-1][1].exists():
        outputs[-1] = ("Flood routing results", BACKEND_DIR / "flood_results.json")

    files = []
    for name, path in outputs:
        available = path.is_file()
        files.append({
            "name": name,
            "file": path.name,
            "available": available,
            "lastModified": (
                datetime.datetime.fromtimestamp(path.stat().st_mtime).astimezone().isoformat(timespec="seconds")
                if available else None
            ),
        })
    return {"checkedAt": now(), "files": files}

@app.get("/dashboard/stats")
def stats():
    ls = lakes(); cnt = lambda lv: sum(l["riskLevel"] == lv for l in ls); al = build_alerts()
    return dict(totalLakes=len(ls), highRiskLakes=cnt("HIGH"), mediumRiskLakes=cnt("MEDIUM"), lowRiskLakes=cnt("LOW"),
                criticalAlerts=sum(a["riskLevel"] == "CRITICAL" and a["status"] == "ACTIVE" for a in al),
                activeAlerts=sum(a["status"] == "ACTIVE" for a in al),
                latestDataDate=max(l["lastUpdated"] for l in ls), monitoringRegion=REGION)

@app.get("/dashboard/charts")
def charts():
    ls, ts = lakes(), load("timeseries.json")
    col = {"CRITICAL": "#ef4444", "HIGH": "#f97316", "MEDIUM": "#f59e0b", "LOW": "#22c55e"}
    dist = [dict(name=k.title(), value=sum(l["riskLevel"] == k for l in ls), color=c) for k, c in col.items()]
    years = sorted({p["year"] for lid, s in ts.items() if not lid.startswith("BT-") for p in s})
    exp = {y: dict(month=str(y), critical=0, high=0, medium=0) for y in years}
    for lid, s in ts.items():
        if lid.startswith("BT-"): continue
        for a, b in zip(s, s[1:]):
            if b["area"] >= 0.1 and a["area"] > 0:
                g = 100 * (b["area"] - a["area"]) / a["area"]
                k = "critical" if g > 40 else "high" if g > 25 else "medium" if g > 12 else None
                if k: exp[b["year"]][k] += 1
    return dict(riskDistribution=dist, expansionByYear=list(exp.values()))

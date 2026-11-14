"""HIMNETRA API - serves the outputs of the Colab pipeline (backend/data/*.json) in the shapes the React app expects.
Run:  uvicorn main:app --reload --port 8000        Docs: http://localhost:8000/docs"""
import datetime, json, os, threading
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import flood, notify, reports as rpt

DATA = Path(os.environ.get("HIMNETRA_DATA", Path(__file__).parent / "data"))
REPORTS = DATA / "reports"; REPORTS.mkdir(parents=True, exist_ok=True)
REGION = "Himachal Pradesh, India"
app = FastAPI(title="HIMNETRA API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── data access (re-reads a file automatically when you replace it) ─────────────
_cache, _lock = {}, threading.Lock()
def load(name, default=None):
    p = DATA / name
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
    for s in load("segmentation.json"):
        if s["lakeId"] == lid: return s
    best = max(load("metrics.json")["results"], key=lambda r: r["iou"])      # fall back to validation metrics
    return {"lakeId": lid, "model": best["model"], "iou": round(100 * best["iou"], 1), "diceScore": round(100 * best["dice"], 1),
            "confidence": 0, "timestamp": now()}

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
    breachSeverity: str | None = None

@app.post("/analysis/run")
def run(req: RunReq):
    sim = flood.simulate(lake_or_404(req.lakeId), req.scenario, req.breachSeverity, DATA)
    s = state(); s["last_sim"][req.lakeId] = sim; save_state(s); return sim

@app.get("/lakes/{lid}/flood-map")
def flood_map(lid: str):
    return state()["last_sim"].get(lid) or flood.simulate(lake_or_404(lid), "MAJOR", None, DATA)

@app.get("/simulations")
def simulations():
    return [flood.simulate(l, "MAJOR", None, DATA) for l in lakes() if l.get("priority")] or \
           [flood.simulate(l, "MAJOR", None, DATA) for l in lakes()[:5]]

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
    name: str
    phone: str | None = None
    email: str | None = None
    lat: float
    lng: float

@app.post("/subscribers")
def subscribe(sub: SubReq):
    s = state(); s["subscribers"].append(sub.model_dump()); save_state(s); return {"ok": True, "count": len(s["subscribers"])}

@app.get("/subscribers")
def subscribers():
    mask = lambda p: ("*" * (len(p) - 4) + p[-4:]) if p else None
    return [{**x, "phone": mask(x.get("phone"))} for x in state()["subscribers"]]

@app.post("/alerts/notify/{lid}")
def notify_lake(lid: str, radius_km: float = 30.0):
    l = lake_or_404(lid); subs = notify.affected_subscribers(l, state()["subscribers"], radius_km)
    msg = f"HIMNETRA alert: {l['name']} ({l['district']}) risk {l['riskLevel']} ({l['riskScore']}/100). Follow instructions of the district disaster authority."
    res = [{"name": s["name"], "email": notify.send_email(s["email"], f"HIMNETRA alert - {l['name']}", msg) if s.get("email") else None,
            "sms": notify.send_sms(s["phone"], msg) if s.get("phone") else None} for s in subs]
    return {"lake": lid, "radiusKm": radius_km, "recipients": len(res), "results": res}

# ── satellite, reports, notifications, system, dashboard ───────────────────────
@app.get("/satellite/sources")
def sources():
    last = max(l["lastUpdated"] for l in lakes()) + "T00:00:00Z"; n = f"{len(lakes())} monitored lakes"
    mk = lambda i, nm, sn, t, res, rev: dict(id=i, name=nm, shortName=sn, type=t, status="AVAILABLE", lastAcquisition=last,
                                            resolution=res, coverage=n, processingStatus="IDLE", revisitTime=rev)
    return [mk("S2-MSI", "Sentinel-2 MSI (surface reflectance)", "Sentinel-2", "OPTICAL", "10 m / 20 m", "5 days"),
            mk("S1-SAR", "Sentinel-1 SAR (C-band, VV)", "Sentinel-1", "SAR", "10 m (IW GRD)", "6-12 days"),
            mk("SRTM", "SRTM 30 m DEM", "SRTM", "DEM", "30 m", "static"),
            mk("ERA5", "ERA5-Land (temperature, precipitation)", "ERA5-Land", "METEO", "~9 km", "monthly aggregate")]

@app.get("/satellite/observations")
def observations(lakeId: str | None = None):
    ts, out = load("timeseries.json"), []
    for lid, s in ts.items():
        if lakeId and lid != lakeId: continue
        for p in (s if lakeId else s[-1:]):
            for src, res, bands in (("Sentinel-2", "10m", ["B2", "B3", "B4", "B8", "B11"]), ("Sentinel-1", "10m", None)):
                out.append(dict(id=f"OBS-{lid}-{p['year']}-{src[-1]}", lakeId=lid, source=src, acquisitionDate=p["date"], resolution=res,
                                processingStatus="COMPLETE", bands=bands))
    return out

class ReportReq(BaseModel):
    type: str
    lakeId: str | None = None

@app.get("/reports")
def list_reports(): return state()["reports"]

@app.post("/reports")
def make_report(req: ReportReq):
    ls = [lake_or_404(req.lakeId)] if req.lakeId else lakes()
    risks = {r["lakeId"]: r for r in load("risk.json")}; hist = load("timeseries.json")
    sim = flood.simulate(ls[0], "MAJOR", None, DATA) if len(ls) == 1 and req.type == "FLOOD_SIMULATION" else None
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
            mk("Flood routing results", (DATA / "flood_results.json").exists()), mk("E-mail alerts", notify.email_configured()),
            mk("SMS alerts", notify.sms_configured())]

@app.get("/dashboard/stats")
def stats():
    ls = lakes(); cnt = lambda lv: sum(l["riskLevel"] == lv for l in ls); al = build_alerts()
    return dict(totalLakes=len(ls), highRiskLakes=cnt("HIGH"), mediumRiskLakes=cnt("MEDIUM"), lowRiskLakes=cnt("LOW"),
                criticalAlerts=cnt("CRITICAL"), activeAlerts=sum(a["status"] == "ACTIVE" for a in al),
                lastSatelliteUpdate=max(l["lastUpdated"] for l in ls), monitoringRegion=REGION)

@app.get("/dashboard/charts")
def charts():
    ls, ts = lakes(), load("timeseries.json")
    col = {"CRITICAL": "#ef4444", "HIGH": "#f97316", "MEDIUM": "#f59e0b", "LOW": "#22c55e"}
    dist = [dict(name=k.title(), value=sum(l["riskLevel"] == k for l in ls), color=c) for k, c in col.items()]
    years = sorted({p["year"] for lid, s in ts.items() if not lid.startswith("BT-") for p in s})
    exp = {y: dict(month=str(y), critical=0, high=0, medium=0) for y in years}; freq = {y: 0 for y in years}
    for lid, s in ts.items():
        if lid.startswith("BT-"): continue
        for a, b in zip(s, s[1:]):
            freq[b["year"]] += 1
            if b["area"] >= 0.1 and a["area"] > 0:
                g = 100 * (b["area"] - a["area"]) / a["area"]
                k = "critical" if g > 40 else "high" if g > 25 else "medium" if g > 12 else None
                if k: exp[b["year"]][k] += 1
        freq[s[0]["year"]] += 1
    return dict(riskDistribution=dist, expansionByYear=list(exp.values()),
                observationFrequency=[dict(month=str(y), sentinel2=freq[y], sentinel1=freq[y]) for y in years])

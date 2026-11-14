"""Empirical GLOF scenario numbers (volume, release, peak discharge).
Downstream impact (extent / time-to-impact / settlements / roads) comes from data/flood_results.json,
written by the flood-routing notebook. Until that file exists those fields are returned as null."""
import datetime, json
from pathlib import Path

SCENARIO_FRACTION = {"MINOR": 0.10, "MODERATE": 0.30, "MAJOR": 0.60, "EXTREME": 1.00}   # share of lake volume released (assumption)
DEFAULT_SEVERITY = {"MINOR": "LOW", "MODERATE": "MEDIUM", "MAJOR": "HIGH", "EXTREME": "EXTREME"}

def lake_volume_mm3(area_km2: float) -> float:
    """Huggel et al. (2002) area-volume relation V[m3] = 0.104 * A[m2]^1.42 (note the units; verify against the paper).
    Returns million m3 for an area in km2."""
    return 0.104 * (max(area_km2, 0.0) * 1e6) ** 1.42 / 1e6

def peak_discharge_m3s(release_mm3: float) -> float:
    """Evans (1986) empirical peak discharge for moraine-dam failure, Qp = 0.72 * V[m3]^0.53 (verify against the paper)."""
    return 0.72 * (release_mm3 * 1e6) ** 0.53

def simulate(lake: dict, scenario: str, severity: str | None, data_dir: Path) -> dict:
    scenario = scenario if scenario in SCENARIO_FRACTION else "MAJOR"
    vol = lake_volume_mm3(lake["currentArea"])
    rel = vol * SCENARIO_FRACTION[scenario]
    down = {}
    f = data_dir / "flood_results.json"
    if f.exists():
        down = json.loads(f.read_text()).get(lake["id"], {}).get(scenario, {})
    return {
        "id": f"SIM-{lake['id']}-{scenario}",
        "lakeId": lake["id"], "lakeName": lake["name"], "scenario": scenario,
        "waterVolume": round(vol, 3), "estimatedRelease": round(rel, 3),
        "peakDischarge": round(peak_discharge_m3s(rel)),
        "breachSeverity": severity or DEFAULT_SEVERITY[scenario],
        "floodExtent": down.get("floodExtent"), "timeToImpact": down.get("timeToImpact"),
        "affectedSettlements": down.get("affectedSettlements"), "affectedRoads": down.get("affectedRoads"),
        "downstreamAvailable": bool(down),
        "riskZone": lake["riskLevel"], "simulationDuration": 6, "status": "COMPLETE",
        "timestamp": datetime.datetime.now().isoformat(timespec="seconds"),
    }

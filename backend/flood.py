"""Serve prepared per-lake flood-routing results without generating estimates."""
import datetime, json
from pathlib import Path

SCENARIOS = {"MINOR", "MODERATE", "MAJOR", "EXTREME"}


class SimulationUnavailableError(Exception):
    """Raised when no prepared routing output exists for a lake and scenario."""


class InvalidScenarioError(Exception):
    """Raised when the requested scenario is not supported."""


def simulate(lake: dict, scenario: str, data_dir: Path) -> dict:
    if scenario not in SCENARIOS:
        raise InvalidScenarioError(f"scenario must be one of {', '.join(sorted(SCENARIOS))}")

    down = {}
    f = data_dir / "flood_results.json"
    if not f.exists():
        f = Path(__file__).parent / "flood_results.json"
    if f.exists():
        down = json.loads(f.read_text()).get(lake["id"], {}).get(scenario, {})
    if not down:
        raise SimulationUnavailableError(
            f"No prepared flood-routing result exists for lake {lake['id']} and scenario {scenario}."
        )
    if down.get("releaseMm3") is None or down.get("peakDischarge") is None:
        raise SimulationUnavailableError(
            f"Prepared flood-routing output for lake {lake['id']} and scenario {scenario} is incomplete."
        )

    return {
        "id": f"SIM-{lake['id']}-{scenario}",
        "lakeId": lake["id"], "lakeName": lake["name"], "scenario": scenario,
        "estimatedRelease": down["releaseMm3"], "peakDischarge": down["peakDischarge"],
        "floodExtent": down.get("floodExtent"), "timeToImpact": down.get("timeToImpact"),
        "affectedSettlements": down.get("affectedSettlements"), "affectedRoads": down.get("affectedRoads"),
        "riskZone": lake["riskLevel"], "status": "COMPLETE",
        "timestamp": datetime.datetime.now().isoformat(timespec="seconds"),
    }

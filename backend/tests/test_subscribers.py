import json
import os
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


class BackendApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.data_dir = Path(self.temp_dir.name)
        shutil.copy(main.DATA / "lakes.json", self.data_dir / "lakes.json")
        shutil.copy(main.DATA / "segmentation.json", self.data_dir / "segmentation.json")
        original_data = main.DATA
        original_load = main.load

        def load_from_test_directory(name, default=None, directory=original_data):
            target = self.data_dir if directory == original_data else directory
            return original_load(name, default, target)

        self.data_patch = patch.object(main, "DATA", self.data_dir)
        self.cache_patch = patch.object(main, "_cache", {})
        self.load_patch = patch.object(main, "load", side_effect=load_from_test_directory)
        self.data_patch.start()
        self.cache_patch.start()
        self.load_patch.start()
        self.client = TestClient(main.app)

    def tearDown(self):
        self.load_patch.stop()
        self.cache_patch.stop()
        self.data_patch.stop()
        self.temp_dir.cleanup()

    def test_subscriber_requires_a_contact_method_and_valid_coordinates(self):
        payload = {"name": "Test User", "lat": 32.5, "lng": 77.2}
        self.assertEqual(self.client.post("/subscribers", json=payload).status_code, 422)

        payload.update(email="user@example.com", lat=91)
        self.assertEqual(self.client.post("/subscribers", json=payload).status_code, 422)

    def test_subscriber_is_saved_and_manual_notification_is_geofenced(self):
        lake = self.client.get("/lakes").json()[0]
        payload = {
            "name": "Test User",
            "email": "user@example.com",
            "lat": lake["coordinates"]["lat"],
            "lng": lake["coordinates"]["lng"],
        }
        response = self.client.post("/subscribers", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

        with patch.object(main.notify, "send_email", return_value="sent") as send_email:
            delivery = self.client.post(f"/alerts/notify/{lake['id']}?radius_km=5")

        self.assertEqual(delivery.status_code, 200)
        self.assertEqual(delivery.json()["recipients"], 1)
        self.assertEqual(delivery.json()["results"][0]["email"], "sent")
        send_email.assert_called_once()

        saved = json.loads((self.data_dir / "state.json").read_text(encoding="utf-8"))
        self.assertEqual(saved["subscribers"][0]["email"], "user@example.com")

    def test_notification_radius_must_be_positive_and_bounded(self):
        lake_id = self.client.get("/lakes").json()[0]["id"]
        self.assertEqual(self.client.post(f"/alerts/notify/{lake_id}?radius_km=0").status_code, 422)
        self.assertEqual(self.client.post(f"/alerts/notify/{lake_id}?radius_km=501").status_code, 422)

    def test_sms_delivery_reports_twilio_error_code_without_provider_message(self):
        response = httpx.Response(400, json={
            "code": 21608,
            "message": "The destination +15557654321 is not verified from +15551234567",
        })
        with patch.dict(os.environ, {
            "TWILIO_SID": "ACtest",
            "TWILIO_TOKEN": "test-token",
            "TWILIO_FROM": "+15551234567",
        }), patch("httpx.post", return_value=response):
            result = main.notify.send_sms("+15557654321", "test message")

        self.assertEqual(
            result,
            "failed HTTP 400 (Twilio 21608): The destination [phone redacted] is not verified "
            "from [phone redacted]",
        )
        self.assertNotIn("+15557654321", result)
        self.assertNotIn("+15551234567", result)

    def test_sms_delivery_does_not_report_zero_as_a_twilio_error_code(self):
        response = httpx.Response(
            400,
            json={"code": 0, "message": "The destination +15557654321 is invalid"},
            headers={"content-type": "application/json", "Twilio-Request-Id": "RQtest123"},
        )
        with patch.dict(os.environ, {
            "TWILIO_SID": "ACtest",
            "TWILIO_TOKEN": "test-token",
            "TWILIO_FROM": "+15551234567",
        }), patch("httpx.post", return_value=response):
            result = main.notify.send_sms("+15557654321", "test message")

        self.assertEqual(
            result,
            "failed HTTP 400 (Twilio error code unavailable; response type application/json; "
            "request ID RQtest123): The destination [phone redacted] is invalid",
        )

    def test_missing_lake_segmentation_is_not_replaced_with_global_metrics(self):
        lake_id = self.client.get("/lakes").json()[0]["id"]
        original_loader = main.load.side_effect
        loaded_files = []

        def load_without_segmentation(name, default=None, directory=main.DATA):
            loaded_files.append(name)
            if name == "segmentation.json":
                return []
            return original_loader(name, default, directory)

        with patch.object(main, "load", side_effect=load_without_segmentation):
            response = self.client.get(f"/lakes/{lake_id}/segmentation")

        self.assertEqual(response.status_code, 404)
        self.assertNotIn("metrics.json", loaded_files)

    def test_satellite_observations_are_empty_when_no_records_are_exported(self):
        response = self.client.get("/satellite/observations")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_satellite_source_metadata_does_not_claim_acquisition_status(self):
        response = self.client.get("/satellite/sources")

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("status", response.json()[0])
        self.assertNotIn("lastAcquisition", response.json()[0])

    def test_data_status_reports_file_timestamps_and_missing_outputs(self):
        response = self.client.get("/data/status")

        self.assertEqual(response.status_code, 200)
        status = {item["file"]: item for item in response.json()["files"]}
        self.assertTrue(status["lakes.json"]["available"])
        self.assertIsNotNone(status["lakes.json"]["lastModified"])
        self.assertFalse(status["risk.json"]["available"])
        self.assertIsNone(status["risk.json"]["lastModified"])
        self.assertNotIn(str(self.data_dir), response.text)

    def test_flood_map_does_not_create_a_default_simulation(self):
        lake_id = self.client.get("/lakes").json()[0]["id"]

        response = self.client.get(f"/lakes/{lake_id}/flood-map")

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json())

    def test_flood_simulation_returns_404_without_prepared_routing_output(self):
        (self.data_dir / "flood_results.json").write_text("{}", encoding="utf-8")
        lake_id = self.client.get("/lakes").json()[0]["id"]

        response = self.client.post("/analysis/run", json={"lakeId": lake_id, "scenario": "MAJOR"})

        self.assertEqual(response.status_code, 404)
        self.assertIn("No prepared flood-routing result", response.json()["detail"])
        self.assertFalse((self.data_dir / "state.json").exists())
        self.assertEqual(self.client.get("/simulations").json(), [])

    def test_flood_simulation_returns_only_prepared_routing_metrics(self):
        source = json.loads((Path(main.__file__).parent / "flood_results.json").read_text(encoding="utf-8"))
        lake = next(
            lake for lake in self.client.get("/lakes").json()
            if lake["id"] in source
            and source[lake["id"]].get("MAJOR", {}).get("releaseMm3") is not None
            and source[lake["id"]].get("MAJOR", {}).get("peakDischarge") is not None
        )
        expected = source[lake["id"]]["MAJOR"]

        response = self.client.post("/analysis/run", json={"lakeId": lake["id"], "scenario": "MAJOR"})

        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["estimatedRelease"], expected["releaseMm3"])
        self.assertEqual(result["peakDischarge"], expected["peakDischarge"])
        self.assertNotIn("waterVolume", result)

    def test_invalid_flood_scenario_does_not_fall_back_to_major(self):
        lake_id = self.client.get("/lakes").json()[0]["id"]

        response = self.client.post("/analysis/run", json={"lakeId": lake_id, "scenario": "UNKNOWN"})

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()

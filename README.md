# HIMNETRA

HIMNETRA is a React dashboard for glacial-lake monitoring, backed by a FastAPI
service that reads the prepared datasets in `backend/data/`.

## Requirements

- Node.js and npm
- Python 3.10 or later

## Run the frontend

From the repository root:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

The UI reads data from the backend API only; it has no built-in demo-data
fallback. If the backend is unavailable, the UI shows an error or unavailable
state. The example `.env` points to the local API at `http://localhost:8000`.
The dashboard checks the API every minute while its tab is visible and when
you return to the tab. This refreshes displayed snapshots; it does not acquire
new satellite or sensor data.
The dashboard's “Prepared file freshness” panel shows when backend output
files were last modified. This is separate from the satellite acquisition
date.
The workspace sidebar replaces the old **Overview** entry with **Future
Scope**, which documents the proposed IoT, telemetry, data-ingestion, and
validation work needed for a future real-time service. The monitoring
dashboard remains available from the landing page and at `/dashboard`.

## Run the backend

Install Python 3.10 or later first (and enable **Add python.exe to PATH** in the
Windows installer). Reopen the VS Code terminal after installation, then check
that `python --version` reports the installed version.

In a second PowerShell terminal from the repository root, create the virtual
environment and use its Python directly; this avoids PowerShell script
activation-policy issues:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
backend\.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --reload --port 8000
```

The API health check is available at `http://localhost:8000/health`; interactive
API documentation is at `http://localhost:8000/docs`. The API reads JSON data
from `backend/data/` and writes generated reports and mutable state there. To
use a different data directory, set `HIMNETRA_DATA` before starting the API.

## Local community alerts

The Alerts page can register test contacts and manually send a risk notice to
subscribers within a selected radius of a lake. Email requires the `SMTP_*`
variables and SMS requires the `TWILIO_*` variables described in the API code.
To register, the user can choose **Use current device location** (and grant
browser permission) or **Enter a location manually** with latitude and
longitude. Manual coordinates can represent a consenting contact's location
near a monitored lake when the operator's device is elsewhere. Coordinates are
submitted only with registration. Device location requires HTTPS or localhost.
Without provider credentials the backend reports a dry run. Sending requires
a separate confirmation in the UI.

This prototype has no authentication or production-grade protection for
subscriber data. Contact details and coordinates are stored in
`backend/data/state.json`; use test contacts only and do not expose the API
publicly. Satellite acquisition remains a manually run Colab workflow, not a
live or scheduled feed.

### Configure email for a local test

1. Use a mail provider that permits SMTP sending. For Gmail, enable 2-step
   verification and create an **App Password**; do not use your normal account
   password.
2. Set these variables in Windows User Environment Variables (or in the
   PowerShell session that will start the backend):

   ```text
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your-sender@gmail.com
   SMTP_PASS=your-provider-app-password
   MAIL_FROM=your-sender@gmail.com
   ```

3. Restart the backend so it receives the variables. Open
   `http://localhost:8000/system/status` and confirm **E-mail alerts** is
   `OPERATIONAL`. This status only confirms that the variables are present;
   verify actual delivery with a test email.
4. Register your own consenting test email, choose a lake and radius that
   includes the contact, then use **Review and send notice**. Confirm the
   send in the UI and check the inbox and spam folder.

### Configure SMS with Twilio

1. Create a Twilio account and obtain an Account SID, Auth Token, and SMS-capable
   sender number. Complete any trial-account recipient verification and enable
   SMS for the destination country.
2. Set these backend environment variables:

   ```text
   TWILIO_SID=your-account-sid
   TWILIO_TOKEN=your-auth-token
   TWILIO_FROM=+15551234567
   ```

3. Restart the backend and confirm **SMS alerts** is `OPERATIONAL` at
   `http://localhost:8000/system/status`. This confirms configured variables,
   not provider authentication or delivery.
4. Register your own consenting test phone in international E.164 format
   (for example, `+15551234567`), dispatch to a radius that includes it, and
   verify the message arrives.
5. If delivery fails, the dispatch result includes the HTTP status and Twilio
   error code and a redacted provider message. For rejected API requests, check
   Twilio Console **Monitor > Debugger** (or **Monitor > Logs > Errors** in the
   legacy Console); a request rejected before a Message is created may not
   appear in Messaging logs. Common causes include invalid credentials, an
   unverified trial recipient, a sender number without SMS capability, or
   destination-country permissions.

Keep credentials out of source control, the frontend `.env`, screenshots, and
chat messages. The frontend is public code; provider secrets belong only in the
backend environment. Provider configuration only enables manual dispatch here;
it does not create automatic or safety-certified warnings.

## Backend tests

With the backend virtual environment installed:

```powershell
backend\.venv\Scripts\python.exe -m unittest discover -s backend\tests
```

## Production build

```powershell
npm run build
npm run preview
```

The Vite app is built from the root `src/` directory. The supplied frontend
implementation is merged into that build source so the project’s existing
root-level development and build commands remain usable.

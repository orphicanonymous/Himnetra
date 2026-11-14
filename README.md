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

The UI uses its built-in demo data unless `VITE_API_URL` is configured. The
example `.env` points to the local API at `http://localhost:8000`.

## Run the backend

In a second PowerShell terminal from the repository root:

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn main:app --app-dir backend --reload --port 8000
```

The API health check is available at `http://localhost:8000/health`; interactive
API documentation is at `http://localhost:8000/docs`. The API reads JSON data
from `backend/data/` and writes generated reports and mutable state there. To
use a different data directory, set `HIMNETRA_DATA` before starting the API.

## Production build

```powershell
npm run build
npm run preview
```

The Vite app is built from the root `src/` directory. The supplied frontend
implementation is merged into that build source so the project’s existing
root-level development and build commands remain usable.

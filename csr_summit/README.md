# 🌿 CSR Summit 2025 — CRM System

Complete attendee management system for the June 5 CSR Summit.  
Built with: **React** (frontend) + **FastAPI** (backend) + **Google Sheets** + **Excel export**

---

## 📁 Project Structure

```
csr_summit/
├── backend/
│   ├── main.py          ← FastAPI app (all API routes)
│   ├── requirements.txt ← Python dependencies
│   └── data.json        ← Auto-created: persistent data store
└── frontend/
    └── index.html       ← React app (open directly in browser)
```

---

## 🚀 Setup & Run

### Step 1 — Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2 — Start the backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3 — Open the frontend

Just open `frontend/index.html` in your browser — no build step needed.

The sidebar will show **"Backend connected"** in green when running.

---

## 📋 Modules

| Module | Description |
|---|---|
| **Dashboard** | Live stats, quick guide, export buttons |
| **Pre-Registered** | View/add the ~150 pre-registered attendees |
| **Walk-in Registration** | Register on-spot attendees on June 5 (auto check-in) |
| **Attendance** | Mark attendees present/absent, filter by status |
| **Speakers** | Add/manage speaker profiles, topics, sessions |
| **Google Sheets** | Configure live sync to Google Sheets |

---

## 💾 Data Export

### Excel (.xlsx)
Click **"Export Excel"** on the Dashboard → downloads a formatted `.xlsx` with 5 sheets:
- All Attendees
- Pre-Registered
- Walk-Ins
- Attendance
- Speakers

### Google Sheets (Live Sync)
1. Create a Google Cloud Project → enable Sheets API + Drive API
2. Create a Service Account → download the JSON key
3. Create a Google Sheet → share it (Editor) with the service account email
4. Go to **Google Sheets** tab in the app
5. Paste the Spreadsheet ID and JSON credentials → click Sync

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | Dashboard counts |
| GET | `/api/pre-registered` | List all pre-registered |
| POST | `/api/pre-registered` | Add pre-registration |
| PATCH | `/api/pre-registered/{id}` | Update check-in status |
| GET | `/api/walk-ins` | List walk-ins |
| POST | `/api/walk-ins` | Add walk-in (auto check-in) |
| PATCH | `/api/walk-ins/{id}` | Update check-in status |
| GET | `/api/speakers` | List speakers |
| POST | `/api/speakers` | Add speaker |
| DELETE | `/api/speakers/{id}` | Remove speaker |
| GET | `/api/export/excel` | Download Excel file |
| POST | `/api/sync/google-sheets` | Sync to Google Sheets |
| POST | `/api/pre-registered/bulk` | Bulk import from CSV/JSON |

---

## 📦 Bulk Import Pre-Registrations

If you have a list of 150 people in a spreadsheet, convert to JSON and POST:

```bash
curl -X POST http://localhost:8000/api/pre-registered/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {"name":"Rahul Sharma","email":"rahul@example.com","organization":"Tata","designation":"Manager","phone":"9876543210"},
    ...
  ]'
```

---

## 🛠 Requirements

- Python 3.9+
- Modern browser (Chrome/Edge/Firefox)
- Internet connection (for React CDN scripts to load)

---

## 📅 Event Day Workflow — June 5

1. Start backend: `uvicorn main:app --port 8000`
2. Open `frontend/index.html` on a laptop at the registration desk
3. Pre-registered attendees → use **Attendance** tab to mark them present
4. New arrivals → use **Walk-in Registration** tab (auto-marked present)
5. Export Excel at end of day for records
6. Sync to Google Sheets for team access

---

*CSR Summit CRM v1.0 — Built for June 5, 2025*

# CSR Summit 2026 — CRM System
**Event Date: June 5, 2026**

## Quick Start
```bash
cd csr_summit/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Then open frontend/index.html in your browser
```
## 🔍 ID Lookup Tab
- Type `PRE-0005` → shows that specific person
- Type `GRP-001` → shows ALL members of group 001
- Type `WGP-003` → shows ALL members of walk-in group 003
- Type a name or org → name/org search

---

## 📋 Modules

### 1. Dashboard
- Live stats (pre-reg, walk-ins, checked-in, pending, speakers)
- ID format reference guide
- Event day quick guide
- Export button

### 2. ID Lookup
- Search any attendee by their unique ID
- Group prefix search returns all group members
- Shows full profile + check-in status

### 3. Pre-Registration (~150 people)
- Individual or group registration
- Groups auto-assigned: GRP-XXX-01, GRP-XXX-02…
- Toggle check-in per person
- Search by name, ID, group ID, org

### 4. Walk-In Registration (~50 new)
- Individual or group walk-in
- Auto check-in on registration
- Groups auto-assigned: WGP-XXX-01, WGP-XXX-02…

### 5. Attendance Check-In
- Combined view of pre-reg + walk-ins
- Filter: All / Present / Pending
- One-click check-in / undo
- Live counter at top

### 6. Speaker Management
- Speaker cards with avatar, topic, session time
- Add/remove speakers (ID: SPK-001, SPK-002…)

### 7. Excel Export
- **Full Export** — all 5 sheets in one file
- Individual: Attendees, Pre-Reg, Walk-Ins, Attendance, Speakers
- Styled headers (dark navy + white bold text)
- Filename format: `CSR_Summit_[type]_20250605_1430.xlsx`

---

## 🌐 API Reference
```
GET  /api/stats                          → dashboard counts
GET  /api/search?q=GRP-001               → search by ID / name
GET  /api/pre-registered                 → list all pre-reg
POST /api/pre-registered                 → add (individual or group)
POST /api/pre-registered/bulk            → bulk import array
PATCH /api/pre-registered/{id}           → toggle check-in
DELETE /api/pre-registered/{id}          → remove

GET  /api/walk-ins                       → list all walk-ins
POST /api/walk-ins                       → add (individual or group)
PATCH /api/walk-ins/{id}                 → toggle check-in
DELETE /api/walk-ins/{id}                → remove

GET  /api/speakers                       → list speakers
POST /api/speakers                       → add speaker
DELETE /api/speakers/{id}                → remove

GET  /api/export/excel?type=all          → download .xlsx
     type options: all, attendees, preregistered, walkins, attendance, speakers
```

---

## 📅 Event Day Workflow (June 5)
1. Start backend: `uvicorn main:app --reload --port 8000`
2. Open `frontend/index.html` in browser
3. Pre-reg arrivals → **Attendance tab** → click "Check In"
4. New walk-ins → **Walk-In tab** → fill form → auto check-in
5. Group arrives → **ID Lookup tab** → search `GRP-001` → see all members → go to Attendance to check each in
6. End of day → **Excel Export tab** → Full Export or individual sheets

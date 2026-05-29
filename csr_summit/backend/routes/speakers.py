# ── Speakers ─────────────────────────────────────────────────────────────────
from datetime import datetime
from streamlit import App
from csr_summit.backend.database import load_data, save_data
from csr_summit.backend.schemas import Speaker


@App.get("/api/speakers")
def get_speakers(): return load_data()["speakers"]

@App.post("/api/speakers")
def add_speaker(s: Speaker):
    d = load_data()
    r = {"id": f"SPK-{len(d['speakers'])+1:03d}", **s.dict(), "added_at": datetime.now().isoformat()}
    d["speakers"].append(r); save_data(d); return r

@App.delete("/api/speakers/{sid}")
def del_speaker(sid: str):
    d = load_data()
    d["speakers"] = [s for s in d["speakers"] if s["id"] != sid]
    save_data(d); return {"ok": True}

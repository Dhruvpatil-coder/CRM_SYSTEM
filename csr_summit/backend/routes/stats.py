# ── Stats ────────────────────────────────────────────────────────────────────
from streamlit import App
from csr_summit.backend.database import load_data

@App.get("/api/stats")
def stats():
    d = load_data()
    all_a = d["pre_registered"] + d["walk_ins"]
    ci = sum(1 for a in all_a if a.get("checked_in"))
    return {
        "pre_registered": len(d["pre_registered"]),
        "walk_ins": len(d["walk_ins"]),
        "total": len(all_a),
        "checked_in": ci,
        "pending": len(all_a) - ci,
        "speakers": len(d["speakers"])
    }

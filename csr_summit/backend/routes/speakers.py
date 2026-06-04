# ── Speakers ─────────────────────────────────────────────────────────────────
from supabase_client import supabase
from schemas import Speaker
from fastapi import APIRouter
from datetime import datetime
from zoneinfo import ZoneInfo

router = APIRouter()

@router.get("/api/speakers")
def get_speakers():
    return supabase.table("speakers").select("*").execute().data

@router.post("/api/speakers")
def add_speaker(s: Speaker):
    record = {
        "name": s.name,
        "organization": s.organization,
        "topic": s.topic,
        "session_time": s.session_time,
        "bio": s.bio,
        "checked_in": False,
        "checked_in_time": None,
    }
    result = supabase.table("speakers").insert(record).execute()
    return result.data

@router.patch("/api/speakers/{name}/checkin")
def toggle_speaker_checkin(name: str):
    """Toggle check-in status for a speaker."""
    # Get current state
    existing = (
        supabase.table("speakers")
        .select("checked_in")
        .eq("name", name)
        .execute()
        .data
    )
    if not existing:
        return {"error": "Speaker not found"}

    current = existing[0].get("checked_in", False)
    new_state = not current

    result = (
        supabase.table("speakers")
        .update({
            "checked_in": new_state,
            "checked_in_time": (datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()if new_state else None),
        })
        .eq("name", name)
        .execute()
    )
    return result.data

@router.delete("/api/speakers/{name}")
def del_speaker(name: str):
    supabase.table("speakers").delete().eq("name", name).execute()
    return {"ok": True}

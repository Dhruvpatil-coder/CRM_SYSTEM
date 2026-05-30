# ── Speakers ─────────────────────────────────────────────────────────────────
from datetime import datetime
from supabase_client import supabase
from schemas import Speaker
from fastapi import APIRouter
router = APIRouter()

@router.get("/api/speakers")
def get_speakers():
    return supabase.table("speakers").select("*").execute().data

@router.post("/api/speakers")
def add_speaker(s: Speaker):

    record = {
        "id": None,
        "name": s.name,
        "designation": s.designation,
        "organization": s.organization,
        "topic": s.topic,
        "session_time": s.session_time,
        "bio": s.bio
    }

    return supabase.table("speakers").insert(record).execute().data

@router.delete("/api/speakers/{sid}")
def del_speaker(sid: str):
    result = (
        supabase
        .table("speakers")
        .delete()
        .eq("id", sid)
        .execute()
    )

    return {"ok": True}

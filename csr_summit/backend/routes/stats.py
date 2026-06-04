from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter()

@router.get("/api/stats")
def get_stats():
    attendees = supabase.table("attendees").select("*").execute().data
    speakers  = supabase.table("speakers").select("*").execute().data

    pre      = [a for a in attendees if a.get("type") == "pre-registered"]
    walk_ins = [a for a in attendees if a.get("type") == "walk-in"]
    checked  = [a for a in attendees if a.get("checked_in")]

    return {
        # used by sidebar badges
        "pre_registered": len(pre),
        "walk_ins":       len(walk_ins),
        "total":          len(attendees),
        "checked_in":     len(checked),
        "pending":        len(attendees) - len(checked),
        "speakers":       len(speakers),
        # legacy key kept for dashboard card
        "attendees":      len(attendees),
    }

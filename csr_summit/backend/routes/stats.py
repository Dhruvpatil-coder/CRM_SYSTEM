from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter()

@router.get("/api/stats")
def get_stats():

    attendees = supabase.table("attendees").select("*").execute().data
    speakers = supabase.table("speakers").select("*").execute().data

    return {
        "attendees": len(attendees),
        "speakers": len(speakers),
        "checked_in": len([a for a in attendees if a.get("checked_in")])
    }
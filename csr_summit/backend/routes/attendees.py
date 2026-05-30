# ── Search by ID ─────────────────────────────────────────────────────────────
from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime
router = APIRouter()
from supabase_client import supabase
from schemas import Registration
from utils import pre_grp_id, pre_ind_id, win_grp_id, win_ind_id


@router.get("/api/search")
def search(q: str = Query(...)):

    response = (
        supabase
        .table("attendees")
        .select("*")
        .execute()
    )

    all_p = response.data
    q = q.strip().upper()
    # 1. Exact ID match
    exact = [p for p in all_p if p.get("id", "").upper() == q]
    if exact:
        return {"match_type": "individual", "query": q, "count": len(exact), "results": exact}
    # 2. Group-prefix match: GRP-001 matches GRP-001-01, GRP-001-02 …
    group_hits = [p for p in all_p if p.get("group_id", "").upper() == q]
    if group_hits:
        return {"match_type": "group", "query": q, "count": len(group_hits), "results": group_hits}
    # 3. Partial name / org search
    name_hits = [p for p in all_p if q in p.get("name", "").upper() or q in p.get("organization", "").upper()]
    if name_hits:
        return {"match_type": "name_search", "query": q, "count": len(name_hits), "results": name_hits}
    return {"match_type": "none", "query": q, "count": 0, "results": []}

# ── Pre-Registration ─────────────────────────────────────────────────────────
@router.get("/api/pre-registered")
def get_pre():

    response = (
        supabase
        .table("attendees")
        .select("*")
        .execute()
    )

    return response.data

@router.post("/api/pre-registered")
def add_pre(reg: Registration):

    now = datetime.now().isoformat()

    record = {
        "id": None,
        "group_id": None,
        "type": "pre-registered",
        "is_group": False,
        "name": reg.name,
        "email": reg.email,
        "phone": reg.phone,
        "organization": reg.organization,
        "designation": reg.designation,
        "checked_in": False,
        "checked_in_time": None,
    }

    result = (
        supabase
        .table("attendees")
        .insert(record)
        .execute()
    )

    return result.data

@router.patch("/api/pre-registered/{pid}")
def toggle_pre(pid: str):

    result = (
        supabase
        .table("attendees")
        .update({
            "checked_in": True,
            "checked_in_time": datetime.now().isoformat()
        })
        .eq("id", pid)
        .execute()
    )

    return result.data

@router.delete("/api/pre-registered/{pid}")
def del_pre(pid: str):

    result = (
        supabase
        .table("attendees")
        .delete()
        .eq("id", pid)
        .execute()
    )

    return {"ok": True}

@router.post("/api/pre-registered/bulk")
def bulk_import(records: List[dict]):
    return {"message": "Not needed now"}

# ── Walk-ins ─────────────────────────────────────────────────────────────────
@router.get("/api/walk-ins")
def get_walkins():

    response = (
        supabase
        .table("attendees")
        .select("*")
        .eq("type", "walk-in")
        .execute()
    )

    return response.data

@router.post("/api/walk-ins")
def add_walkin(reg: Registration):

    now = datetime.now().isoformat()

    record = {
        "id": None,
        "group_id": None,
        "type": "walk-in",
        "is_group": False,
        "name": reg.name,
        "email": reg.email,
        "phone": reg.phone,
        "organization": reg.organization,
        "designation": reg.designation,
        "checked_in": True,
        "checked_in_time": now,
    }

    result = (
        supabase
        .table("attendees")
        .insert(record)
        .execute()
    )

    return result.data

@router.patch("/api/walk-ins/{wid}")
def toggle_walkin(wid: str):

    result = (
        supabase
        .table("attendees")
        .update({
            "checked_in": True,
            "checked_in_time": datetime.now().isoformat()
        })
        .eq("id", wid)
        .execute()
    )

    return result.data

@router.delete("/api/walk-ins/{wid}")
def del_walkin(wid: str):

    result = (
        supabase
        .table("attendees")
        .delete()
        .eq("id", wid)
        .execute()
    )

    return {"ok": True}
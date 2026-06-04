# ── Attendees (Pre-Registration + Walk-ins) ──────────────────────────────────
from fastapi import APIRouter, Query
from typing import List
from datetime import datetime
from zoneinfo import ZoneInfo

router = APIRouter()
from supabase_client import supabase
from schemas import Registration


@router.get("/api/search")
def search(q: str = Query(...)):
    response = supabase.table("attendees").select("*").execute()
    all_p = response.data
    q_upper = q.strip().upper()

    # 1. Exact phone match
    exact = [p for p in all_p if str(p.get("phone") or "").upper() == q_upper]
    if exact:
        return {"match_type": "individual", "query": q, "count": len(exact), "results": exact}

    # 2. Partial name / org / email search
    hits = [p for p in all_p if
            q_upper in str(p.get("name", "")).upper() or
            q_upper in str(p.get("organization", "")).upper() or
            q_upper in str(p.get("email", "")).upper() or
            q_upper in str(p.get("phone", "")).upper() or
            q_upper in str(p.get("designation", "")).upper()]
    if hits:
        return {"match_type": "name_search", "query": q, "count": len(hits), "results": hits}

    return {"match_type": "none", "query": q, "count": 0, "results": []}


# ── Pre-Registration ──────────────────────────────────────────────────────────
@router.get("/api/pre-registered")
def get_pre():
    return supabase.table("attendees").select("*").eq("type", "pre-registered").execute().data

@router.post("/api/pre-registered")
def add_pre(reg: Registration):
    now = datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()

    if reg.is_group and reg.group_members:
        # Insert each group member as a separate row
        records = []
        for m in reg.group_members:
            records.append({
                "type": "pre-registered",
                "is_group": True,
                "group_organization": reg.group_organization,
                "group_member_count": len(reg.group_members),
                "name": m.name,
                "email": m.email,
                "phone": m.phone,
                "organization": m.organization or reg.group_organization,
                "designation": m.designation,
                "checked_in": False,
                "checked_in_time": None,
                "registered_at": now,
            })
        result = supabase.table("attendees").insert(records).execute()
        
        return result.data
    else:
        record = {
            "type": "pre-registered",
            "is_group": False,
            "group_organization": "",
            "group_member_count": 0,
            "name": reg.name,
            "email": reg.email,
            "phone": reg.phone,
            "organization": reg.organization,
            "designation": reg.designation,
            "checked_in": False,
            "checked_in_time": None,
            "registered_at": now,
        }
        result = supabase.table("attendees").insert(record).execute()
        
        return result.data

@router.patch("/api/pre-registered/{phone}")
def toggle_pre(phone: str):
    """Toggle check-in: if checked in → undo; if not → check in."""
    existing = (
        supabase.table("attendees")
        .select("checked_in")
        .eq("phone", phone)
        .execute()
        .data
    )
    if not existing:
        return {"error": "Not found"}

    current = existing[0].get("checked_in", False)
    new_state = not current

    result = (
        supabase.table("attendees")
        .update({
            "checked_in": new_state,
          "checked_in_time": (datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()if new_state else None),
        })
        .eq("phone", phone)
        .execute()
    )
    return result.data

@router.delete("/api/pre-registered/{phone}")
def del_pre(phone: str):
    supabase.table("attendees").delete().eq("phone", phone).execute()
    return {"ok": True}


# ── Walk-ins ──────────────────────────────────────────────────────────────────
@router.get("/api/walk-ins")
def get_walkins():
    return supabase.table("walkins").select("*").eq("type", "walk-in").execute().data

@router.post("/api/walk-ins")
def add_walkin(reg: Registration):
    now = datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()

    if reg.is_group and reg.group_members:
        records = []
        for m in reg.group_members:
            records.append({
                "type": "walk-in",
                "is_group": True,
                "group_organization": reg.group_organization,
                "group_member_count": len(reg.group_members),
                "name": m.name,
                "email": m.email,
                "phone": m.phone,
                "organization": m.organization or reg.group_organization,
                "designation": m.designation,
                "checked_in": True,
                "checked_in_time": now,
                "registered_at": now,
                "payment_mode": reg.payment_mode,
                "payment_status": reg.payment_status,
                "amount_paid": reg.amount_paid,
            })
        result = supabase.table("walkins").insert(records).execute()
        return result.data
    else:
        record = {
            "type": "walk-in",
            "is_group": False,
            "group_organization": "",
            "group_member_count": 0,
            "name": reg.name,
            "email": reg.email,
            "phone": reg.phone,
            "organization": reg.organization,
            "designation": reg.designation,
            "checked_in": True,
            "checked_in_time": now,
            "registered_at": now,
            "payment_mode": reg.payment_mode,
            "payment_status": reg.payment_status,
            "amount_paid": reg.amount_paid,
        }
        result = supabase.table("walkins").insert(record).execute()
        
        return result.data

@router.patch("/api/walk-ins/{wphone}")
def toggle_walkin(wphone: str):
    """Toggle check-in for walk-in."""
    existing = (
        supabase.table("walkins")
        .select("checked_in")
        .eq("phone", wphone)
        .execute()
        .data
    )
    if not existing:
        return {"error": "Not found"}

    current = existing[0].get("checked_in", False)
    new_state = not current

    result = (
        supabase.table("walkins")
        .update({
            "checked_in": new_state,
         "checked_in_time": (datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()if new_state else None),
        })
        .eq("phone", wphone)
        .execute()
    )
    return result.data

@router.delete("/api/walk-ins/{wphone}")
def del_walkin(wphone: str):
    supabase.table("walkins").delete().eq("phone", wphone).execute()
    return {"ok": True}

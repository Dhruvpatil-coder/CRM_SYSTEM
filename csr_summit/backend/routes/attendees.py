# ── Search by ID ─────────────────────────────────────────────────────────────
import datetime

from fastapi import HTTPException
from fastapi.params import Query
from git import List
from streamlit import App

from csr_summit.backend.database import load_data, save_data
from csr_summit.backend.schemas import Registration
from csr_summit.backend.utils import pre_grp_id, pre_ind_id, win_grp_id, win_ind_id
from csr_summit.backend.utils import pre_grp_id


@App.get("/api/search")
def search(q: str = Query(...)):
    d = load_data()
    all_p = d["pre_registered"] + d["walk_ins"]
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
@App.get("/api/pre-registered")
def get_pre(): return load_data()["pre_registered"]

@App.post("/api/pre-registered")
def add_pre(reg: Registration):
    d = load_data(); now = datetime.now().isoformat()
    if reg.is_group and reg.group_members:
        d["counters"]["pre_group"] += 1
        gn = d["counters"]["pre_group"]
        gid = f"GRP-{gn:03d}"
        records = []
        for i, m in enumerate(reg.group_members, 1):
            r = {"id": pre_grp_id(gn, i), "group_id": gid, "type": "pre-registered", "is_group": True,
                 "name": m.name, "email": m.email, "phone": m.phone,
                 "organization": m.organization or reg.group_organization,
                 "designation": m.designation,
                 "checked_in": False, "check_in_time": None, "registered_at": now}
            d["pre_registered"].append(r); records.append(r)
        save_data(d)
        return {"group_id": gid, "count": len(records), "records": records}
    else:
        d["counters"]["pre_individual"] += 1
        r = {"id": pre_ind_id(d["counters"]["pre_individual"]), "group_id": None, "type": "pre-registered",
             "is_group": False, "name": reg.name, "email": reg.email, "phone": reg.phone,
             "organization": reg.organization, "designation": reg.designation,
             "checked_in": False, "check_in_time": None, "registered_at": now}
        d["pre_registered"].append(r); save_data(d)
        return r

@App.patch("/api/pre-registered/{pid}")
def toggle_pre(pid: str):
    d = load_data()
    for p in d["pre_registered"]:
        if p["id"] == pid:
            p["checked_in"] = not p["checked_in"]
            p["check_in_time"] = datetime.now().isoformat() if p["checked_in"] else None
            save_data(d); return p
    raise HTTPException(404, "Not found")

@App.delete("/api/pre-registered/{pid}")
def del_pre(pid: str):
    d = load_data()
    d["pre_registered"] = [p for p in d["pre_registered"] if p["id"] != pid]
    save_data(d); return {"ok": True}

@App.post("/api/pre-registered/bulk")
def bulk_import(records: List[dict]):
    d = load_data(); now = datetime.now().isoformat(); added = []
    for rec in records:
        d["counters"]["pre_individual"] += 1
        r = {"id": pre_ind_id(d["counters"]["pre_individual"]), "group_id": None, "type": "pre-registered",
             "is_group": False, "name": rec.get("name",""), "email": rec.get("email",""),
             "phone": rec.get("phone",""), "organization": rec.get("organization",""),
             "designation": rec.get("designation",""),
             "checked_in": False, "check_in_time": None, "registered_at": now}
        d["pre_registered"].append(r); added.append(r)
    save_data(d); return {"added": len(added), "records": added}

# ── Walk-ins ─────────────────────────────────────────────────────────────────
@App.get("/api/walk-ins")
def get_walkins(): return load_data()["walk_ins"]

@App.post("/api/walk-ins")
def add_walkin(reg: Registration):
    d = load_data(); now = datetime.now().isoformat()
    if reg.is_group and reg.group_members:
        d["counters"]["walkin_group"] += 1
        gn = d["counters"]["walkin_group"]
        gid = f"WGP-{gn:03d}"
        records = []
        for i, m in enumerate(reg.group_members, 1):
            r = {"id": win_grp_id(gn, i), "group_id": gid, "type": "walk-in", "is_group": True,
                 "name": m.name, "email": m.email, "phone": m.phone,
                 "organization": m.organization or reg.group_organization,
                 "designation": m.designation,
                 "checked_in": True, "check_in_time": now, "registered_at": now}
            d["walk_ins"].append(r); records.append(r)
        save_data(d)
        return {"group_id": gid, "count": len(records), "records": records}
    else:
        d["counters"]["walkin_individual"] += 1
        r = {"id": win_ind_id(d["counters"]["walkin_individual"]), "group_id": None, "type": "walk-in",
             "is_group": False, "name": reg.name, "email": reg.email, "phone": reg.phone,
             "organization": reg.organization, "designation": reg.designation,
             "checked_in": True, "check_in_time": now, "registered_at": now}
        d["walk_ins"].append(r); save_data(d)
        return r

@App.patch("/api/walk-ins/{wid}")
def toggle_walkin(wid: str):
    d = load_data()
    for p in d["walk_ins"]:
        if p["id"] == wid:
            p["checked_in"] = not p["checked_in"]
            p["check_in_time"] = datetime.now().isoformat() if p["checked_in"] else None
            save_data(d); return p
    raise HTTPException(404, "Not found")

@App.delete("/api/walk-ins/{wid}")
def del_walkin(wid: str):
    d = load_data()
    d["walk_ins"] = [p for p in d["walk_ins"] if p["id"] != wid]
    save_data(d); return {"ok": True}
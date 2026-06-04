# ── Pydantic models ──────────────────────────────────────────────────────────
from typing import List, Optional
from pydantic import BaseModel 


class GroupMember(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    organization: Optional[str] = ""
    designation: Optional[str] = ""


class Registration(BaseModel):
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    organization: Optional[str] = ""
    designation: Optional[str] = ""
    is_group: Optional[bool] = False
    group_organization: Optional[str] = ""
    group_members: Optional[List[GroupMember]] = []
    
    # ← these 3 were missing
    payment_mode: Optional[str] = ""
    payment_status: Optional[str] = ""
    amount_paid: Optional[str] = ""

class Speaker(BaseModel):
     name: str
     organization: Optional[str] = ""
     topic: str
     session_time: Optional[str] = ""
     bio: Optional[str] = ""

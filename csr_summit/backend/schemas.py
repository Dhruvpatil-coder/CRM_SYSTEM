# ── Pydantic models ──────────────────────────────────────────────────────────
from git import List, Optional
from pydantic import BaseModel

class Person(BaseModel):
    name: str; email: str = ""; phone: str = ""; organization: str = ""; designation: str = ""

class Registration(BaseModel):
    is_group: bool = False
    # individual fields (used when is_group=False)
    name: str = ""; email: str = ""; phone: str = ""; organization: str = ""; designation: str = ""
    # group fields (used when is_group=True)
    group_organization: str = ""
    group_members: Optional[List[Person]] = None

class Speaker(BaseModel):
    name: str; designation: str; organization: str; topic: str; session_time: str; bio: str = ""

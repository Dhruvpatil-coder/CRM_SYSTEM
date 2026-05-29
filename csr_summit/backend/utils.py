# ── ID helpers ──────────────────────────────────────────────────────────────
# Individual pre-reg  : PRE-0001, PRE-0002 …
# Group pre-reg       : GRP-001-01, GRP-001-02 … (same group prefix GRP-001)
# Individual walk-in  : WIN-0001, WIN-0002 …
# Group walk-in       : WGP-001-01, WGP-001-02 … (same group prefix WGP-001)

def pre_ind_id(n):  return f"PRE-{n:04d}"
def pre_grp_id(g, m): return f"GRP-{g:03d}-{m:02d}"
def win_ind_id(n):  return f"WIN-{n:04d}"
def win_grp_id(g, m): return f"WGP-{g:03d}-{m:02d}"
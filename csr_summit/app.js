/* global React, ReactDOM */
const { useState, useEffect, useCallback } = React;
const API = "http://localhost:8000";

// ── Helpers ──────────────────────────────────────────────────────────────────

const api = async (path, opts = {}) => {
  try {
    const r = await fetch(API + path, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
};

const AVATAR_COLORS = ["#06b6d4", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6", "#ec4899"];
const avatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (n = "") => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const fmtTime = (s) => s ? new Date(s).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—";
const idClass = (id = "") =>
  id.startsWith("GRP") || id.startsWith("WGP") ? "id-grp" :
    id.startsWith("PRE") ? "id-pre" :
      id.startsWith("WIN") ? "id-win" :
        id.startsWith("SPK") ? "id-spk" : "id-pre";

// ── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ stats, setTab }) {
  const STAT_CARDS = [
    { label: "Pre-Registered", value: stats.pre_registered, cls: "v-cyan", icon: "📋", tab: "pre" },
    { label: "Walk-Ins", value: stats.walk_ins, cls: "v-amber", icon: "🚶", tab: "walkin" },
    { label: "Total Attendees", value: stats.total, cls: "v-text", icon: "👥", tab: "attendance" },
    { label: "Checked In", value: stats.checked_in, cls: "v-green", icon: "✅", tab: "attendance" },
    { label: "Pending", value: stats.pending, cls: "v-red", icon: "⏳", tab: "attendance" },
    { label: "Speakers", value: stats.speakers, cls: "v-purple", icon: "🎤", tab: "speakers" },
  ];

  const ID_EXAMPLES = [
    { id: "PRE-0001", cls: "id-pre", desc: "Individual pre-registration" },
    { id: "GRP-001-01", cls: "id-grp", desc: "Group pre-reg (group 001, member 01)" },
    { id: "GRP-001-02", cls: "id-grp", desc: "Group pre-reg (group 001, member 02)" },
    { id: "WIN-0001", cls: "id-win", desc: "Individual walk-in" },
    { id: "WGP-001-01", cls: "id-grp", desc: "Group walk-in (group 001, member 01)" },
  ];

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>CSR Summit 2025</h2>
          <div className="sub">June 5, 2025 · Event Command Center</div>
        </div>
        <button className="btn btn-outline" onClick={() => window.open(API + "/api/export/excel?type=all")}>
          ⬇ Export Excel
        </button>
      </div>

      <div className="stat-grid">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="stat-card" onClick={() => setTab(s.tab)}>
            <div className="label">{s.icon} {s.label}</div>
            <div className={`value ${s.cls}`}>{s.value ?? "—"}</div>
            <div className="sub-val">click to view →</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ID Format Guide */}
        <div className="card">
          <div className="card-title">🆔 ID Format Guide</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            {ID_EXAMPLES.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`id-badge ${r.cls}`}>{r.id}</span>
                <span style={{ color: "var(--text3)" }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event Day Guide */}
        <div className="card">
          <div className="card-title">📅 Event Day Guide</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text2)", lineHeight: 1.8 }}>
            <div>1. Pre-registered attendees → <span style={{ color: "var(--cyan)" }}>Attendance tab</span> to check in</div>
            <div>2. New walk-ins → <span style={{ color: "var(--amber)" }}>Walk-in tab</span> to register (auto check-in)</div>
            <div>3. Search any ID in <span style={{ color: "var(--green)" }}>ID Lookup tab</span> for instant info</div>
            <div>4. Group arrivals: search <span style={{ color: "var(--purple)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>GRP-001</span> → see all members</div>
            <div>5. Export Excel at end of day from Dashboard</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ID Lookup ─────────────────────────────────────────────────────────────────

function IDLookup() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const r = await api(`/api/search?q=${encodeURIComponent(q.trim())}`);
    setResult(r);
    setLoading(false);
  };

  const clear = () => { setResult(null); setQ(""); };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>🔍 ID Lookup</h2>
          <div className="sub">Search any attendee by their unique ID</div>
        </div>
      </div>

      <div className="info-box" style={{ marginBottom: 20 }}>
        <strong>How to search:</strong>&nbsp;
        Type a full ID like <code style={{ fontFamily: "'DM Mono'", background: "rgba(255,255,255,.06)", padding: "1px 5px", borderRadius: 4 }}>PRE-0001</code> for an individual &nbsp;·&nbsp;
        Type a group prefix like <code style={{ fontFamily: "'DM Mono'", background: "rgba(255,255,255,.06)", padding: "1px 5px", borderRadius: 4 }}>GRP-001</code> to see all group members &nbsp;·&nbsp;
        Or type a name / organization for a name search
      </div>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="e.g. PRE-0001 · GRP-001 · WIN-0004 · Company Name…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{ fontFamily: "'DM Mono',monospace", fontSize: 14 }}
        />
        <button className="btn btn-primary" onClick={search}>Search</button>
        {result && <button className="btn btn-outline" onClick={clear}>Clear</button>}
      </div>

      {loading && <div className="loading pulse">Searching…</div>}

      {result && !loading && (
        <div className="lookup-result">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              {result.match_type === "group" && <span className="badge b-purple">👥 Group — {result.count} members</span>}
              {result.match_type === "individual" && <span className="badge b-cyan">👤 Individual match</span>}
              {result.match_type === "name_search" && <span className="badge b-amber">🔎 {result.count} name/org result(s)</span>}
              {result.match_type === "none" && <span className="badge b-red">❌ No results found</span>}
            </div>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>
              Query: <span style={{ fontFamily: "'DM Mono'", color: "var(--cyan)" }}>{result.query}</span>
            </span>
          </div>

          {result.results && result.results.map(p => (
            <div key={p.id} className="lookup-person">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div className="avatar" style={{ background: avatarColor(p.name) }}>{initials(p.name)}</div>
                <div>
                  <div className="lookup-name">{p.name}</div>
                  <div className="lookup-meta">{p.designation} · {p.organization}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span className={`id-badge ${idClass(p.id)}`}>{p.id}</span>
                  {p.group_id && <span className="badge b-purple" style={{ fontSize: 10 }}>👥 {p.group_id}</span>}
                </div>
              </div>
              <div className="lookup-grid">
                <div className="lookup-field"><div className="lf-key">Email</div><div className="lf-val">{p.email || "—"}</div></div>
                <div className="lookup-field"><div className="lf-key">Phone</div><div className="lf-val">{p.phone || "—"}</div></div>
                <div className="lookup-field"><div className="lf-key">Type</div><div className="lf-val">{p.type}</div></div>
                <div className="lookup-field">
                  <div className="lf-key">Status</div>
                  <div className="lf-val">
                    {p.checked_in
                      ? <span className="badge b-green">✅ Present · {fmtTime(p.check_in_time)}</span>
                      : <span className="badge b-red">⏳ Not Checked In</span>}
                  </div>
                </div>
                <div className="lookup-field"><div className="lf-key">Registered At</div><div className="lf-val">{fmtTime(p.registered_at)}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!result && !loading && (
        <div className="empty"><div className="ei">🔍</div><p>Enter an ID or name above to look up an attendee</p></div>
      )}
    </div>
  );
}

// ── Pre-Registration: Add Modal ───────────────────────────────────────────────

function AddPersonModal({ onClose, onAdded }) {
  const [isGroup, setIsGroup] = useState(false);
  const [org, setOrg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", designation: "" });
  const [members, setMembers] = useState([{ name: "", email: "", phone: "", designation: "" }]);
  const [loading, setLoading] = useState(false);

  const addMember = () => setMembers(m => [...m, { name: "", email: "", phone: "", designation: "" }]);
  const removeMember = (i) => setMembers(m => m.filter((_, j) => j !== i));
  const setMember = (i, k, v) => setMembers(m => m.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    const body = isGroup
      ? { is_group: true, group_organization: org, group_members: members.map(m => ({ ...m, organization: org })) }
      : { is_group: false, ...form };
    const r = await api("/api/pre-registered", { method: "POST", body: JSON.stringify(body) });
    setLoading(false);
    if (r) { onAdded(r); onClose(); }
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>➕ Add Pre-Registration</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Group toggle */}
        <div className="toggle-row">
          <span className="toggle-label">👥 Group Registration</span>
          <label className="toggle">
            <input type="checkbox" checked={isGroup} onChange={e => setIsGroup(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <span style={{ fontSize: 12, color: isGroup ? "var(--purple)" : "var(--cyan)" }}>
            {isGroup ? "IDs: GRP-XXX-01, GRP-XXX-02…" : "ID: PRE-XXXX"}
          </span>
        </div>

        {isGroup ? (
          <>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Organization (common for all)</label>
              <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Company / Organization" />
            </div>
            <div className="member-rows">
              {members.map((m, i) => (
                <div key={i} className="member-row">
                  <div className="member-row-header">
                    <span className="member-num">
                      MEMBER {String(i + 1).padStart(2, "0")} · ID will be GRP-XXX-{String(i + 1).padStart(2, "0")}
                    </span>
                    {i > 0 && <button className="btn btn-ghost btn-sm" onClick={() => removeMember(i)}>✕ Remove</button>}
                  </div>
                  <div className="form-grid">
                    <div className="form-group"><label>Name *</label><input value={m.name} onChange={e => setMember(i, "name", e.target.value)} placeholder="Full name" /></div>
                    <div className="form-group"><label>Designation</label><input value={m.designation} onChange={e => setMember(i, "designation", e.target.value)} placeholder="Job title" /></div>
                    <div className="form-group"><label>Email</label><input value={m.email} onChange={e => setMember(i, "email", e.target.value)} placeholder="email@example.com" /></div>
                    <div className="form-group"><label>Phone</label><input value={m.phone} onChange={e => setMember(i, "phone", e.target.value)} placeholder="+91 …" /></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline" style={{ width: "100%" }} onClick={addMember}>+ Add Member</button>
          </>
        ) : (
          <div className="form-grid">
            <div className="form-group"><label>Name *</label><input value={form.name} onChange={setField("name")} placeholder="Full name" /></div>
            <div className="form-group"><label>Email</label><input value={form.email} onChange={setField("email")} placeholder="email@example.com" /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={setField("phone")} placeholder="+91 …" /></div>
            <div className="form-group"><label>Organization</label><input value={form.organization} onChange={setField("organization")} placeholder="Company" /></div>
            <div className="form-group" style={{ gridColumn: "1/-1" }}><label>Designation</label><input value={form.designation} onChange={setField("designation")} placeholder="Job title" /></div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : isGroup ? `Register ${members.length} Members` : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pre-Registration Tab ──────────────────────────────────────────────────────

function PreRegistration({ onDataChange }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api("/api/pre-registered");
    if (r) setData(r);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    const r = await api(`/api/pre-registered/${id}`, { method: "PATCH" });
    if (r) { setData(d => d.map(p => p.id === id ? r : p)); onDataChange(); }
  };

  const del = async (id) => {
    if (!confirm("Delete this record?")) return;
    await api(`/api/pre-registered/${id}`, { method: "DELETE" });
    setData(d => d.filter(p => p.id !== id));
    onDataChange();
  };

  const filtered = data.filter(p =>
    [p.name, p.email, p.organization, p.id, p.group_id || "", p.designation]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const checked = data.filter(p => p.checked_in).length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>📋 Pre-Registration</h2>
          <div className="sub">{data.length} registered · {checked} checked in · {data.length - checked} pending</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Registration</button>
      </div>

      <div className="search-row">
        <input className="search-input" placeholder="Search by name, ID, org, email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <span style={{ fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>{filtered.length} shown</span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="tbl-wrap">
          {loading
            ? <div className="loading pulse">Loading…</div>
            : filtered.length === 0
              ? <div className="empty"><div className="ei">📋</div><p>No records match</p></div>
              : (
                <table>
                  <thead><tr>
                    <th>ID</th><th>Name</th><th>Organization</th><th>Designation</th><th>Contact</th><th>Status</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id}>
                        <td>
                          <span className={`id-badge ${idClass(p.id)}`}>{p.id}</span>
                          {p.group_id && <div style={{ marginTop: 3 }}><span className="badge b-purple" style={{ fontSize: 10 }}>👥 {p.group_id}</span></div>}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: avatarColor(p.name) }}>{initials(p.name)}</div>
                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text2)" }}>{p.organization || "—"}</td>
                        <td style={{ color: "var(--text3)", fontSize: 12 }}>{p.designation || "—"}</td>
                        <td style={{ fontSize: 12, color: "var(--text3)" }}>{p.email || "—"}<br />{p.phone || ""}</td>
                        <td>{p.checked_in ? <span className="badge b-green">✅ Present</span> : <span className="badge b-red">⏳ Pending</span>}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className={`btn btn-sm ${p.checked_in ? "btn-outline" : "btn-green"}`} onClick={() => toggle(p.id)}>
                              {p.checked_in ? "Undo" : "Check In"}
                            </button>
                            <button className="btn btn-sm btn-red" onClick={() => del(p.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </div>
      </div>

      {modal && <AddPersonModal onClose={() => setModal(false)} onAdded={() => { load(); onDataChange(); }} />}
    </div>
  );
}

// ── Walk-In Tab ───────────────────────────────────────────────────────────────

function WalkIn({ onDataChange }) {
  const [data, setData] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", designation: "" });
  const [org, setOrg] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "", phone: "", designation: "" }]);
  const [loading, setLoading] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  const load = async () => { const r = await api("/api/walk-ins"); if (r) setData(r); };
  useEffect(() => { load(); }, []);

  const addMember = () => setMembers(m => [...m, { name: "", email: "", phone: "", designation: "" }]);
  const removeMember = (i) => setMembers(m => m.filter((_, j) => j !== i));
  const setMember = (i, k, v) => setMembers(m => m.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    const body = isGroup
      ? { is_group: true, group_organization: org, group_members: members.map(m => ({ ...m, organization: org })) }
      : { is_group: false, ...form };
    const r = await api("/api/walk-ins", { method: "POST", body: JSON.stringify(body) });
    setLoading(false);
    if (r) {
      setLastAdded(r);
      setForm({ name: "", email: "", phone: "", organization: "", designation: "" });
      setOrg("");
      setMembers([{ name: "", email: "", phone: "", designation: "" }]);
      load();
      onDataChange();
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>🚶 Walk-In Registration</h2>
          <div className="sub">{data.length} walk-ins registered today</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20, alignItems: "start" }}>
        {/* Registration form */}
        <div className="card">
          <div className="card-title">New Walk-In</div>

          {lastAdded && (
            <div className="info-box" style={{ marginBottom: 14, background: "var(--green-glow)", borderColor: "rgba(16,185,129,.3)" }}>
              ✅ Registered! ID: <strong style={{ fontFamily: "'DM Mono'", color: "var(--green)" }}>
                {lastAdded.id || (lastAdded.group_id && lastAdded.group_id + "-01…")}
              </strong>
            </div>
          )}

          <div className="toggle-row" style={{ paddingTop: 0 }}>
            <span className="toggle-label">👥 Group Walk-In</span>
            <label className="toggle">
              <input type="checkbox" checked={isGroup} onChange={e => setIsGroup(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
            {isGroup && <span style={{ fontSize: 12, color: "var(--purple)" }}>IDs: WGP-XXX-01, WGP-XXX-02…</span>}
          </div>

          {isGroup ? (
            <>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Organization</label>
                <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Company / Organization" />
              </div>
              {members.map((m, i) => (
                <div key={i} className="member-row" style={{ marginBottom: 10 }}>
                  <div className="member-row-header">
                    <span className="member-num">MEMBER {String(i + 1).padStart(2, "0")}</span>
                    {i > 0 && <button className="btn btn-ghost btn-sm" onClick={() => removeMember(i)}>✕</button>}
                  </div>
                  <div className="form-grid">
                    <div className="form-group"><label>Name</label><input value={m.name} onChange={e => setMember(i, "name", e.target.value)} placeholder="Full name" /></div>
                    <div className="form-group"><label>Phone</label><input value={m.phone} onChange={e => setMember(i, "phone", e.target.value)} placeholder="+91 …" /></div>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline" style={{ width: "100%", marginBottom: 12 }} onClick={addMember}>+ Add Member</button>
            </>
          ) : (
            <div className="form-grid" style={{ marginBottom: 12 }}>
              <div className="form-group"><label>Name *</label><input value={form.name} onChange={setField("name")} placeholder="Full name" /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={setField("phone")} placeholder="+91 …" /></div>
              <div className="form-group"><label>Organization</label><input value={form.organization} onChange={setField("organization")} placeholder="Company" /></div>
              <div className="form-group"><label>Designation</label><input value={form.designation} onChange={setField("designation")} placeholder="Job title" /></div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}><label>Email</label><input value={form.email} onChange={setField("email")} placeholder="email@example.com" /></div>
            </div>
          )}

          <button className="btn btn-amber" style={{ width: "100%" }} onClick={submit} disabled={loading}>
            {loading ? "Registering…" : `⚡ Register & Check In${isGroup ? ` (${members.length} people)` : ""}`}
          </button>
        </div>

        {/* Today's walk-ins list */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 18px 0", fontFamily: "'Syne'", fontWeight: 700, fontSize: 14 }}>Today's Walk-Ins</div>
          <div className="tbl-wrap" style={{ maxHeight: 460, overflowY: "auto" }}>
            {data.length === 0
              ? <div className="empty" style={{ padding: 32 }}><div className="ei">🚶</div><p>No walk-ins yet</p></div>
              : (
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Org</th><th>Time</th></tr></thead>
                  <tbody>
                    {[...data].reverse().map(p => (
                      <tr key={p.id}>
                        <td><span className={`id-badge ${idClass(p.id)}`}>{p.id}</span></td>
                        <td>{p.name}</td>
                        <td style={{ fontSize: 12, color: "var(--text3)" }}>{p.organization || "—"}</td>
                        <td style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono'" }}>{fmtTime(p.registered_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attendance Tab ────────────────────────────────────────────────────────────

function Attendance({ onDataChange }) {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    const [pre, win] = await Promise.all([api("/api/pre-registered"), api("/api/walk-ins")]);
    setData([...(pre || []), ...(win || [])]);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (p) => {
    const ep = p.type === "walk-in" ? "walk-ins" : "pre-registered";
    const r = await api(`/api/${ep}/${p.id}`, { method: "PATCH" });
    if (r) { setData(d => d.map(x => x.id === p.id ? r : x)); onDataChange(); }
  };

  const present = data.filter(p => p.checked_in).length;
  const filtered = data.filter(p => {
    const matchFilter = filter === "all"
      || (filter === "present" && p.checked_in)
      || (filter === "pending" && !p.checked_in);
    const matchSearch = !search || [p.name, p.organization, p.id, p.group_id || ""]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>✅ Attendance</h2>
          <div className="sub">{present}/{data.length} checked in · {data.length - present} pending</div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="stat-card"><div className="label">Total</div><div className="value v-cyan">{data.length}</div></div>
        <div className="stat-card"><div className="label">✅ Present</div><div className="value v-green">{present}</div></div>
        <div className="stat-card"><div className="label">⏳ Pending</div><div className="value v-red">{data.length - present}</div></div>
      </div>

      <div className="search-row">
        <input className="search-input" placeholder="Search by name, ID, group ID, org…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="filter-tabs">
        {[["all", "All"], ["present", "✅ Present"], ["pending", "⏳ Pending"]].map(([val, label]) => (
          <button key={val} className={`ftab ${filter === val ? "active" : ""}`} onClick={() => setFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="tbl-wrap">
          {filtered.length === 0
            ? <div className="empty"><div className="ei">✅</div><p>No attendees match</p></div>
            : (
              <table>
                <thead><tr>
                  <th>ID</th><th>Name</th><th>Org</th><th>Type</th><th>Status</th><th>Check-in Time</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span className={`id-badge ${idClass(p.id)}`}>{p.id}</span>
                        {p.group_id && <div style={{ marginTop: 3 }}><span className="badge b-purple" style={{ fontSize: 10 }}>👥 {p.group_id}</span></div>}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, background: avatarColor(p.name) }}>{initials(p.name)}</div>
                          {p.name}
                        </div>
                      </td>
                      <td style={{ color: "var(--text3)", fontSize: 12 }}>{p.organization || "—"}</td>
                      <td><span className={`badge ${p.type === "walk-in" ? "b-amber" : "b-cyan"}`}>{p.type}</span></td>
                      <td>{p.checked_in ? <span className="badge b-green">✅ Present</span> : <span className="badge b-red">⏳ Pending</span>}</td>
                      <td style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono'" }}>{fmtTime(p.check_in_time)}</td>
                      <td>
                        <button className={`btn btn-sm ${p.checked_in ? "btn-outline" : "btn-green"}`} onClick={() => toggle(p)}>
                          {p.checked_in ? "Undo" : "Check In"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

// ── Speakers Tab ──────────────────────────────────────────────────────────────

const EMPTY_SPEAKER = { name: "", designation: "", organization: "", topic: "", session_time: "", bio: "" };

function Speakers({ onDataChange }) {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_SPEAKER });

  const load = async () => { const r = await api("/api/speakers"); if (r) setData(r); };
  useEffect(() => { load(); }, []);

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const r = await api("/api/speakers", { method: "POST", body: JSON.stringify(form) });
    if (r) { setModal(false); setForm({ ...EMPTY_SPEAKER }); load(); onDataChange(); }
  };

  const del = async (id) => {
    if (!confirm("Remove speaker?")) return;
    await api(`/api/speakers/${id}`, { method: "DELETE" });
    setData(d => d.filter(s => s.id !== id));
    onDataChange();
  };

  const FIELDS = [
    ["name", "Name *"], ["designation", "Designation"], ["organization", "Organization"],
    ["topic", "Talk Topic"], ["session_time", "Session Time"],
  ];

  return (
    <div>
      <div className="topbar">
        <div><h2>🎤 Speakers</h2><div className="sub">{data.length} speakers added</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Speaker</button>
      </div>

      {data.length === 0
        ? <div className="empty"><div className="ei">🎤</div><p>No speakers added yet</p></div>
        : (
          <div className="spk-grid">
            {data.map(s => (
              <div key={s.id} className="spk-card">
                <div className="spk-head">
                  <div className="avatar" style={{ background: avatarColor(s.name), width: 44, height: 44, fontSize: 16 }}>{initials(s.name)}</div>
                  <div className="spk-info">
                    <h4>{s.name}</h4>
                    <p>{s.designation}</p>
                    <p style={{ color: "var(--text3)" }}>{s.organization}</p>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span className="id-badge id-spk">{s.id}</span>
                    <button className="btn btn-sm btn-red" onClick={() => del(s.id)}>✕</button>
                  </div>
                </div>
                <div className="spk-tag">🎯 {s.topic}</div>
                <div style={{ fontSize: 12, color: "var(--cyan)", marginBottom: 6 }}>🕐 {s.session_time}</div>
                {s.bio && <div className="spk-bio">{s.bio}</div>}
              </div>
            ))}
          </div>
        )}

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>🎤 Add Speaker</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              {FIELDS.map(([k, l]) => (
                <div key={k} className="form-group">
                  <label>{l}</label>
                  <input value={form[k]} onChange={setField(k)} placeholder={l} />
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label>Bio</label>
                <textarea value={form.bio} onChange={setField("bio")} placeholder="Short bio…" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Add Speaker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Excel Export Tab ──────────────────────────────────────────────────────────

const EXPORT_OPTIONS = [
  { type: "all", icon: "📊", label: "Full Export", sub: "All 5 sheets in one file" },
  { type: "attendees", icon: "👥", label: "All Attendees", sub: "Pre-reg + Walk-ins combined" },
  { type: "preregistered", icon: "📋", label: "Pre-Registered", sub: "150 pre-reg attendees" },
  { type: "walkins", icon: "🚶", label: "Walk-Ins", sub: "On-spot registrations" },
  { type: "attendance", icon: "✅", label: "Attendance Sheet", sub: "Check-in status + time" },
  { type: "speakers", icon: "🎤", label: "Speakers", sub: "Speaker profiles & sessions" },
];

function ExcelExport() {
  return (
    <div>
      <div className="topbar">
        <div><h2>⬇ Excel Export</h2><div className="sub">Download data as formatted .xlsx files</div></div>
      </div>
      <div className="info-box" style={{ marginBottom: 22 }}>
        All exports include <strong>column headers with dark navy styling</strong>, all fields, and timestamps.
        Files are named <strong>CSR_Summit_[type]_[datetime].xlsx</strong>
      </div>
      <div className="export-grid">
        {EXPORT_OPTIONS.map(e => (
          <div key={e.type} className="export-card" onClick={() => window.open(`${API}/api/export/excel?type=${e.type}`)}>
            <div className="export-icon">{e.icon}</div>
            <div className="export-label">{e.label}</div>
            <div className="export-sub">{e.sub}</div>
            <button className="btn btn-outline btn-sm" style={{ pointerEvents: "none" }}>⬇ Download .xlsx</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────

const NAV_TABS = [
  { id: "dash", icon: "🏠", label: "Dashboard" },
  { id: "lookup", icon: "🔍", label: "ID Lookup" },
  { id: "pre", icon: "📋", label: "Pre-Registration" },
  { id: "walkin", icon: "🚶", label: "Walk-In" },
  { id: "attendance", icon: "✅", label: "Attendance" },
  { id: "speakers", icon: "🎤", label: "Speakers" },
  { id: "export", icon: "⬇", label: "Excel Export" },
];

function App() {
  const [tab, setTab] = useState("dash");
  const [stats, setStats] = useState({});
  const [online, setOnline] = useState(null);

  const loadStats = useCallback(async () => {
    const r = await api("/api/stats");
    if (r) { setStats(r); setOnline(true); }
    else setOnline(false);
  }, []);

  useEffect(() => { loadStats(); }, []);

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>CSR Summit 2025</h1>
          <p>Event CRM · June 5</p>
        </div>

        <div className="sidebar-status">
          <div className={`status-dot ${online === null ? "" : online ? "ok" : "err"}`} />
          <span className="status-text">
            {online === null ? "Connecting…" : online ? "Backend connected" : "Backend offline"}
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Navigation</div>
          {NAV_TABS.map(t => (
            <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="icon">{t.icon}</span>
              <span>{t.label}</span>
              {t.id === "pre" && stats.pre_registered > 0 && <span className="badge">{stats.pre_registered}</span>}
              {t.id === "walkin" && stats.walk_ins > 0 && <span className="badge" style={{ background: "var(--amber)" }}>{stats.walk_ins}</span>}
              {t.id === "attendance" && stats.pending > 0 && <span className="badge" style={{ background: "var(--red)" }}>{stats.pending}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text3)" }}>
          🌐 Backend: <span style={{ fontFamily: "'DM Mono'", color: "var(--cyan)" }}>localhost:8000</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        {tab === "dash" && <Dashboard stats={stats} setTab={setTab} />}
        {tab === "lookup" && <IDLookup />}
        {tab === "pre" && <PreRegistration onDataChange={loadStats} />}
        {tab === "walkin" && <WalkIn onDataChange={loadStats} />}
        {tab === "attendance" && <Attendance onDataChange={loadStats} />}
        {tab === "speakers" && <Speakers onDataChange={loadStats} />}
        {tab === "export" && <ExcelExport />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
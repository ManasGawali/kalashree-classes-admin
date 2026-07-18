import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = { name: "", phone: "", email: "", password: "", batchId: "" };

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]); // full list, fetched once
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const [batches, setBatches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const loadStudents = () => {
    setLoading(true);
    api
      .get("/admin/students")
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
    api.get("/batches").then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  // Client-side filter - the full list is already in memory, so search is instant
  const filteredStudents = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const viewStudent = (id) => {
    api.get(`/admin/students/${id}`).then((res) => setSelected(res.data));
  };

  const rejectPayment = async (paymentId) => {
    const reason = prompt("Reason for rejecting this payment?");
    if (reason == null) return;
    await api.put(`/admin/payments/${paymentId}/reject`, { reason });
    viewStudent(selected.user.id);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSaving(true);
    try {
      await api.post("/admin/students", form);
      setFormSuccess(`Account created for ${form.name}. Login: ${form.phone}`);
      setForm(emptyForm);
      loadStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not create student");
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (id, name) => {
    const newPassword = prompt(`Set a new password for ${name} (min 6 characters):`);
    if (!newPassword) return;
    try {
      await api.put(`/admin/students/${id}/reset-password`, { newPassword });
      alert("Password reset successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="container" style={{ padding: "24px 16px 48px" }}>
      <div className="flex-between mb-16">
        <div>
          <h1 className="section-title">Students</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>Search, add, and manage student accounts.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm((s) => !s)}>
          {showAddForm ? "Close" : "+ Add Student"}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-16">
          <h3 style={{ marginTop: 0, fontSize: 16 }}>New Student Account</h3>
          {formError && <div className="alert alert-error">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
          <form onSubmit={handleAddStudent}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number (login ID)</label>
                <input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email (optional — for receipts)</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Batch</label>
                <select className="form-select" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} required>
                  <option value="">Select batch</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} — Rs.{b.monthlyFee}/mo</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input className="form-input" type="text" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : "Create Account"}
            </button>
          </form>
        </div>
      )}

      <input
        className="form-input mb-16"
        placeholder="Search by name, phone, or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-muted" style={{ fontSize: 12.5, marginTop: -10, marginBottom: 10 }}>
        {loading ? "Loading…" : `${filteredStudents.length} of ${students.length} student(s)`}
      </p>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Phone</th><th>Batch</th><th>Paid Till</th><th>Due</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.batch}</td>
                <td>{s.paidTill}</td>
                <td>{s.dueDate}</td>
                <td>
                  <span className={`badge ${s.isUpToDate ? "badge-success" : "badge-danger"}`}>
                    {s.isUpToDate ? "Up to date" : `${s.monthsOverdue} due`}
                  </span>
                </td>
                <td><button className="btn btn-outline btn-sm" onClick={() => viewStudent(s.id)}>View</button></td>
              </tr>
            ))}
            {!loading && filteredStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="text-muted">
                  {students.length === 0 ? "No students found." : "No students match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card mt-24">
          <div className="flex-between">
            <div>
              <h3 style={{ margin: 0 }}>{selected.user.name}</h3>
              <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 13.5 }}>
                {selected.user.phone}{selected.user.email ? ` • ${selected.user.email}` : ""} • {selected.user.batch}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => resetPassword(selected.user.id, selected.user.name)}>
                Reset Password
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>

          <div className="grid-3 mt-24">
            <div className="stat-card"><span className="stat-label">Paid Till</span><span className="stat-value" style={{ fontSize: 18 }}>{selected.paidTill}</span></div>
            <div className="stat-card"><span className="stat-label">Due Date</span><span className="stat-value" style={{ fontSize: 18 }}>{selected.dueDate}</span></div>
            <div className="stat-card"><span className="stat-label">Joined</span><span className="stat-value" style={{ fontSize: 18 }}>{selected.user.joined}</span></div>
          </div>

          <h4 style={{ marginTop: 24, marginBottom: 8 }}>Payment History</h4>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Months</th><th>Amount</th><th>Txn ID</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {selected.payments.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{p.months.length}</td>
                    <td>Rs. {p.amount}</td>
                    <td>{p.transactionId}</td>
                    <td>
                      <span className={`badge ${p.status === "completed" ? "badge-success" : p.status === "rejected" ? "badge-danger" : "badge-warning"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === "completed" && (
                        <button className="btn btn-danger btn-sm" onClick={() => rejectPayment(p._id)}>Reject</button>
                      )}
                    </td>
                  </tr>
                ))}
                {selected.payments.length === 0 && (
                  <tr><td colSpan={6} className="text-muted">No payments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

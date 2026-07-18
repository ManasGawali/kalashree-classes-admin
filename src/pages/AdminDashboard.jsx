import { useEffect, useState } from "react";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(() => {});
    api.get("/batches").then((res) => setBatches(res.data)).catch(() => {});
  };

  useEffect(load, []);

  const startEdit = (batch) => {
    setEditingId(batch._id);
    setEditValue(batch.monthlyFee);
    setMsg("");
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/batches/${id}`, { monthlyFee: Number(editValue) });
      setEditingId(null);
      setMsg("Fee updated successfully");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Update failed");
    }
  };

  if (!stats) return <div className="container" style={{ padding: 24 }}>Loading…</div>;

  return (
    <div className="container" style={{ padding: "24px 16px 48px" }}>
      <h1 className="section-title">Admin Dashboard</h1>
      <p className="section-sub">Overview of students, collections, and batch fees.</p>

      <div className="grid-3">
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label={`Collected — ${stats.currentMonthLabel}`} value={`Rs. ${stats.collectedThisMonth}`} />
        <StatCard label="Students Overdue" value={stats.overdueCount} accent={stats.overdueCount > 0 ? "var(--danger)" : undefined} />
      </div>

      <h2 className="section-title mt-24" style={{ fontSize: 18 }}>Students per Batch</h2>
      <div className="grid-3">
        {stats.batchBreakdown.map((b) => (
          <div className="stat-card" key={b.name}>
            <span className="stat-label">{b.name}</span>
            <span className="stat-value" style={{ fontSize: 20 }}>{b.count} students</span>
          </div>
        ))}
      </div>

      <h2 className="section-title mt-24" style={{ fontSize: 18 }}>Manage Batch Fees</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Batch</th><th>Monthly Fee (Rs.)</th><th></th></tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>
                  {editingId === b._id ? (
                    <input
                      className="form-input"
                      style={{ width: 110, padding: "6px 10px" }}
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    `Rs. ${b.monthlyFee}`
                  )}
                </td>
                <td>
                  {editingId === b._id ? (
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(b._id)}>Save</button>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(b)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

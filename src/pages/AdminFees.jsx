import { useEffect, useState } from "react";
import api from "../api/axios.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AdminFees() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [batchId, setBatchId] = useState("");
  const [batches, setBatches] = useState([]);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/batches").then((res) => setBatches(res.data));
  }, []);

  const load = () => {
    api.get("/admin/fees", { params: { month, year, batch: batchId || undefined } }).then((res) => setData(res.data));
  };

  useEffect(load, [month, year, batchId]);

  // Reset the search box whenever the underlying filter set changes (new month/year/batch)
  useEffect(() => setSearch(""), [month, year, batchId]);

  const filteredRows = data
    ? data.rows.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
    : [];

  return (
    <div className="container" style={{ padding: "24px 16px 48px" }}>
      <h1 className="section-title">Batch-wise Fee Collection</h1>
      <p className="section-sub">View who has paid and who is pending for a given month.</p>

      <div className="card mb-16">
        <div className="grid-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Month</label>
            <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Year</label>
            <input className="form-input" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Batch</label>
            <select className="form-select" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
              <option value="">All Batches</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {data && (
        <>
          <div className="grid-3 mb-16">
            <div className="stat-card"><span className="stat-label">Collected</span><span className="stat-value">Rs. {data.totalCollected}</span></div>
            <div className="stat-card"><span className="stat-label">Pending</span><span className="stat-value" style={{ color: "var(--danger)" }}>Rs. {data.totalPending}</span></div>
            <div className="stat-card"><span className="stat-label">Paid / Total</span><span className="stat-value">{data.paidCount}/{data.paidCount + data.pendingCount}</span></div>
          </div>

          <input
            className="form-input mb-16"
            placeholder="Search student by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="card table-wrap">
            <table className="data-table">
              <thead><tr><th>Student</th><th>Batch</th><th>Fee</th><th>Status</th></tr></thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.batch}</td>
                    <td>Rs. {r.monthlyFee}</td>
                    <td>
                      <span className={`badge ${r.paid ? "badge-success" : "badge-danger"}`}>
                        {r.paid ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr><td colSpan={4} className="text-muted">No students in this batch.</td></tr>
                )}
                {data.rows.length > 0 && filteredRows.length === 0 && (
                  <tr><td colSpan={4} className="text-muted">No students match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

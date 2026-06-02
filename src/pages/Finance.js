import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import Swal from "sweetalert2";

export default function Finance() {

  const API = "http://localhost:8080";

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // ✅ NEW
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "Income",
    date: "",
    businessId: ""
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    fetchSummary();
    fetchBusinessesAndTransactions();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API}/api/dashboard/global-summary`);
      setSummary(res.data);
      renderChart(res.data);
    } catch (err) {
      console.error("Finance Error:", err);
    }
  };

  const fetchBusinessesAndTransactions = async () => {
    try {
      const res = await axios.get(`${API}/api/business`);
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];

      setBusinesses(data);

      const allTransactions = data.flatMap(b =>
        (b.transactions || []).map(t => ({
          ...t,
          business: { name: b.name }
        }))
      );

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);

    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  };

  /* ================= CHART ================= */

  const renderChart = (data) => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: ["Revenue", "Expense"],
        datasets: [
          {
            data: [
              data?.totalIncome || 0,
              data?.totalExpense || 0
            ],
            backgroundColor: ["#22c55e", "#ef4444"]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };

  /* ================= EDIT ================= */

  const handleEdit = (t) => {
    setFormData({
      title: t.title,
      amount: t.amount,
      type: t.type,
      date: t.date,
      businessId: ""
    });

    setEditingId(t.id);
    setShowModal(true);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {

    if (!formData.title || !formData.amount) {
      Swal.fire("Missing Fields", "Fill all fields", "warning");
      return;
    }

    try {

      if (editingId) {
        // ✅ UPDATE
        await axios.put(`${API}/api/transactions/${editingId}`, {
          title: formData.title,
          amount: parseFloat(formData.amount),
          type: formData.type,
          date: formData.date
        });

        Swal.fire("Updated", "Transaction updated", "success");
        setEditingId(null);

      } else {
        // ✅ CREATE
        if (!formData.businessId) {
          Swal.fire("Missing Business", "Select business", "warning");
          return;
        }

        await axios.post(`${API}/api/transactions/${formData.businessId}`, {
          title: formData.title,
          amount: parseFloat(formData.amount),
          type: formData.type,
          date: formData.date
        });

        Swal.fire("Success", "Transaction Added", "success");
      }

      setShowModal(false);

      setFormData({
        title: "",
        amount: "",
        type: "Income",
        date: "",
        businessId: ""
      });

      fetchSummary();
      fetchBusinessesAndTransactions();

    } catch {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  /* ================= DELETE ================= */

  const deleteTransaction = async (id) => {

    const confirm = await Swal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API}/api/transactions/${id}`);

      fetchSummary();
      fetchBusinessesAndTransactions();

      Swal.fire({
        title: "Deleted!",
        text: "Transaction has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

    } catch {
      Swal.fire("Error", "Failed to delete transaction", "error");
    }
  };

  if (!summary) return <h4 className="text-center mt-5">Loading...</h4>;

  const profit = (summary.totalIncome || 0) - (summary.totalExpense || 0);

  /* ================= UI ================= */

  return (

    <div className="container-fluid p-4" style={{ minHeight:"100vh", background:"#f6f7fb" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <div>
          <h2 className="fw-bold">Finance Dashboard</h2>
          <p className="text-muted">Financial Overview & Transactions</p>
        </div>
        <button className="btn btn-dark" onClick={()=>setShowModal(true)}>
          + Add Transaction
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div style={{ borderRadius:"16px", padding:"20px", background:"linear-gradient(135deg,#dcfce7,#bbf7d0)" }}>
            <small>Total Revenue</small>
            <h2 className="fw-bold text-success">₹{summary.totalIncome?.toLocaleString() || 0}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div style={{ borderRadius:"16px", padding:"20px", background:"linear-gradient(135deg,#fee2e2,#fecaca)" }}>
            <small>Total Expense</small>
            <h2 className="fw-bold text-danger">₹{summary.totalExpense?.toLocaleString() || 0}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div style={{ borderRadius:"16px", padding:"20px", background:"linear-gradient(135deg,#dbeafe,#bfdbfe)" }}>
            <small>Net Profit</small>
            <h2 className="fw-bold">₹{profit.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ borderRadius:"16px", padding:"20px", background:"#fff" }}>
        <h5 className="mb-3">Transaction History</h5>

        <table className="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No Data</td></tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id}>
                  <td>{t.business?.name}</td>
                  <td>{t.title}</td>
                  <td>₹{t.amount}</td>
                  <td className={t.type === "Income" ? "text-success" : "text-danger"}>
                    {t.type}
                  </td>
                  <td>{t.date || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleEdit(t)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteTransaction(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>{editingId ? "Edit Transaction" : "Add Transaction"}</h5>
                <button className="btn-close" onClick={()=>setShowModal(false)} />
              </div>

              <div className="modal-body">

                <input className="form-control mb-2" placeholder="Title"
                  value={formData.title}
                  onChange={(e)=>setFormData({...formData,title:e.target.value})}
                />

                <input type="number" className="form-control mb-2" placeholder="Amount"
                  value={formData.amount}
                  onChange={(e)=>setFormData({...formData,amount:e.target.value})}
                />

                <select className="form-control mb-2"
                  value={formData.type}
                  onChange={(e)=>setFormData({...formData,type:e.target.value})}
                >
                  <option>Income</option>
                  <option>Expense</option>
                </select>

                <input type="date" className="form-control mb-2"
                  value={formData.date}
                  onChange={(e)=>setFormData({...formData,date:e.target.value})}
                />

                {!editingId && (
                  <select className="form-control"
                    value={formData.businessId}
                    onChange={(e)=>setFormData({...formData,businessId:e.target.value})}
                  >
                    <option value="">Select Business</option>
                    {businesses.map(b=>(
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={handleSave}>
                  {editingId ? "Update" : "Save"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
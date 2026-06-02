import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

export default function Dashboard() {

  const performanceRef = useRef(null);
  const employeeRef = useRef(null);

  const performanceChartInstance = useRef(null);
  const employeeChartInstance = useRef(null);

  const [summary, setSummary] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:8080/api/dashboard/global-summary"),
      axios.get("http://localhost:8080/api/dashboard/global-counts")
    ])
      .then(([summaryRes, countRes]) => {
        setSummary(summaryRes.data);
        setCounts(countRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard Error:", err);
        setLoading(false);
      });
  }, []);

  // Revenue vs Expense Chart
  useEffect(() => {
    if (!summary) return;

    if (performanceChartInstance.current) {
      performanceChartInstance.current.destroy();
    }

    performanceChartInstance.current = new Chart(performanceRef.current, {
      type: "bar",
      data: {
        labels: ["Revenue", "Expense"],
        datasets: [
          {
            data: [
              summary.totalIncome || 0,
              summary.totalExpense || 0
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

  }, [summary]);

  // Business vs Employees Chart
  useEffect(() => {
    if (!counts) return;

    if (employeeChartInstance.current) {
      employeeChartInstance.current.destroy();
    }

    employeeChartInstance.current = new Chart(employeeRef.current, {
      type: "doughnut",
      data: {
        labels: ["Businesses", "Employees"],
        datasets: [
          {
            data: [
              counts.totalBusinesses || 0,
              counts.totalEmployees || 0
            ],
            backgroundColor: ["#6366f1", "#14b8a6"]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }, [counts]);

  if (loading) {
    return <h4 className="text-center mt-5">Loading Dashboard...</h4>;
  }

  const expenseRatio = summary?.totalIncome
    ? ((summary.totalExpense / summary.totalIncome) * 100).toFixed(2)
    : 0;

  const employeePerBusiness = counts?.totalBusinesses
    ? (counts.totalEmployees / counts.totalBusinesses).toFixed(2)
    : 0;

  return (

    <div className="container-fluid p-4" style={{ minHeight: "100vh", background: "#f6f7fb" }}>

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">Global Business Dashboard</h2>
        <p className="text-muted">Multi Business Management System Overview</p>
      </div>

      {/* KPI CARDS */}
      <div className="row g-4 mb-4">

        <div className="col-xl-3 col-md-6">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}>
            <small>Total Businesses</small>
            <h2 className="fw-bold">{counts?.totalBusinesses || 0}</h2>
            <span className="badge bg-dark">Active</span>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "linear-gradient(135deg,#ccfbf1,#99f6e4)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}>
            <small>Total Employees</small>
            <h2 className="fw-bold">{counts?.totalEmployees || 0}</h2>
            <span className="badge bg-dark">Workforce</span>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}>
            <small>Total Revenue</small>
            <h2 className="fw-bold text-success">
              ₹{summary?.totalIncome?.toLocaleString() || 0}
            </h2>
            <span className="badge bg-success">Income</span>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "linear-gradient(135deg,#fee2e2,#fecaca)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}>
            <small>Total Expense</small>
            <h2 className="fw-bold text-danger">
              ₹{summary?.totalExpense?.toLocaleString() || 0}
            </h2>
            <span className="badge bg-danger">Outflow</span>
          </div>
        </div>

      </div>

      {/* SECOND ROW */}
      <div className="row g-4 mb-4">

        {/* PROFIT */}
        <div className="col-lg-4">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}>
            <h6>Overall Profit</h6>
            <h2 className="fw-bold">
              ₹{summary?.profit?.toLocaleString() || 0}
            </h2>

            <p>Profit: {summary?.profitPercentage?.toFixed(2) || 0}%</p>

            <div className="progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${summary?.profitPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* REVENUE VS EXPENSE */}
        <div className="col-lg-4">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "#fff",
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
          }}>
            <h6>Revenue vs Expense</h6>
            <div style={{ height: "300px" }}>
              <canvas ref={performanceRef}></canvas>
            </div>
          </div>
        </div>

        {/* BUSINESS VS EMPLOYEE */}
        <div className="col-lg-4">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "#fff",
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
          }}>
            <h6>Business vs Employees</h6>
            <div style={{ height: "300px" }}>
              <canvas ref={employeeRef}></canvas>
            </div>
          </div>
        </div>

      </div>

      {/* INSIGHTS */}
      <div className="row g-4">

        <div className="col-lg-6">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "linear-gradient(135deg,#fef9c3,#fde68a)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}>
            <h6>Expense Ratio</h6>
            <h2 className="fw-bold text-warning">{expenseRatio}%</h2>
            <span className="badge bg-warning text-dark">Efficiency</span>
          </div>
        </div>

        <div className="col-lg-6">
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}>
            <h6>Employees Per Business</h6>
            <h2 className="fw-bold text-primary">{employeePerBusiness}</h2>
            <span className="badge bg-primary">Workforce Density</span>
          </div>
        </div>

      </div>

    </div>
  );
}
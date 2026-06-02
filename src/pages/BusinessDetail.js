import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function BusinessDetail() {
  const { id } = useParams();
  const API = "http://localhost:8080";

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [business, setBusiness] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // ================= FINANCE =================
  const revenue = Number(business?.revenue || 0);

  const expense = (business?.employees || []).reduce(
    (sum, emp) => sum + Number(emp.salary || 0),
    0
  );

  const profit = revenue - expense;

  // ================= FETCH =================
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [businessRes, projectRes] = await Promise.all([
          axios.get(`${API}/api/business/${id}`),
          axios.get(`${API}/api/projects/business/${id}`)
        ]);

        setBusiness(businessRes.data);
        setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setProjects([]);
      }
    };

    fetchData();
  }, [id]);

  // ================= CHART =================
useEffect(() => {
  if (!business || !chartRef.current) return;

  if (chartInstance.current) {
    chartInstance.current.destroy();
  }

  const ctx = chartRef.current.getContext("2d");

  chartInstance.current = new Chart(ctx, {
type: "bar",
data: {
  labels: ["Revenue", "Expense", "Profit"],
  datasets: [{
    data: [revenue, expense, profit],
    backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"]
  }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return context.label + ": ₹" + context.raw.toLocaleString();
            }
          }
        }
      },
      cutout: "65%"
    }
  });

}, [business]);
  // ================= LOADING =================
  if (!business) {
    return <div className="text-center p-5"><h4>Loading...</h4></div>;
  }


  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh", padding: "25px" }}>

      {/* HEADER */}
      <div
        className="card border-0 p-4 mb-4"
        style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        <div className="d-flex align-items-center gap-3">

          {business.logo ? (
            <img
              src={business.logo}
              alt="logo"
              style={{ width: 75, height: 75, borderRadius: 14, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 75,
                height: 75,
                borderRadius: 14,
                background: "#6366f1",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: "bold"
              }}
            >
              {business.name?.charAt(0)}
            </div>
          )}

          <div>
            <h3 className="fw-bold mb-0">{business.name}</h3>
            <span className="text-muted">{business.industry}</span>
          </div>

        </div>
      </div>

      {/* TABS */}
      <div className="mb-4 d-flex gap-2">
        {["overview", "employees", "finance", "projects"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? "btn-dark" : "btn-light"}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <>
          <div className="row g-3 mb-4">

            <div className="col-md-4">
              <div className="card p-3 border-0 shadow-sm">
                <small>Employees</small>
                <h4>{business.employees?.length || 0}</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 border-0 shadow-sm">
                <small>Revenue</small>
                <h4>₹{revenue.toLocaleString()}</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 border-0 shadow-sm">
                <small>Projects</small>
                <h4>{projects.length}</h4>
              </div>
            </div>

          </div>

          <div className="card border-0 p-4">
            <h5>Revenue Trend</h5>
            <canvas ref={chartRef}></canvas>
          </div>
        </>
      )}

{/* EMPLOYEES */}
{activeTab === "employees" && (
  <div className="card p-4 border-0" style={{ background: "#f8fafc" }}>
    <h5 className="mb-4">
      Employees ({business.employees?.length || 0})
    </h5>

    {business.employees?.length > 0 ? (
      <div className="row g-4">
        {business.employees.map(emp => (
          <div key={emp.id} className="col-md-4">
            <div
              className="p-3 h-100"
              style={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #b4d6d3, #b4d6d3)",
                color: "#000",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "0.3s"
              }}
            >
              {/* TOP SECTION */}
              <div className="d-flex align-items-center gap-3">
                <img
                  src={
                    emp.gender === "female"
                      ? "/images/female.png"
                      : "/images/male.png"
                  }
                  alt="emp"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "2px solid white"
                  }}
                />

                <div>
                  <h6 className="fw-bold mb-0">{emp.name}</h6>
                  <small style={{ opacity: 0.7 }}>
                    {emp.position}
                  </small>
                </div>
              </div>

              {/* DIVIDER */}
              <hr style={{ opacity: 0.2 }} />

              {/* SALARY BADGE */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.3)",
                  display: "inline-block",
                  fontWeight: "bold"
                }}
              >
                ₹{Number(emp.salary || 0).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-muted">No employees found</p>
    )}
  </div>
)}
{/* FINANCE */}
{activeTab === "finance" && (
  <div className="card p-4 border-0" style={{ background: "#f8fafc" }}>
    <div className="row g-4">

      {/* REVENUE */}
      <div className="col-md-4">
        <div
          className="p-3 h-100"
          style={{
            borderRadius: "16px",
            background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >
          <small style={{ opacity: 0.7 }}>Total Revenue</small>

          <h4 className="fw-bold mt-2" style={{ color: "#15803d" }}>
            ₹{revenue.toLocaleString()}
          </h4>

          <div
            style={{
              marginTop: "10px",
              padding: "6px 10px",
              borderRadius: "10px",
              background: "rgba(0,0,0,0.05)",
              display: "inline-block",
              fontWeight: "bold",
              fontSize: "12px"
            }}
          >
            Income
          </div>
        </div>
      </div>

      {/* EXPENSE */}
      <div className="col-md-4">
        <div
          className="p-3 h-100"
          style={{
            borderRadius: "16px",
            background: "linear-gradient(135deg, #fee2e2, #fecaca)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >
          <small style={{ opacity: 0.7 }}>Total Expense</small>

          <h4 className="fw-bold mt-2" style={{ color: "#b91c1c" }}>
            ₹{expense.toLocaleString()}
          </h4>

          <div
            style={{
              marginTop: "10px",
              padding: "6px 10px",
              borderRadius: "10px",
              background: "rgba(0,0,0,0.05)",
              display: "inline-block",
              fontWeight: "bold",
              fontSize: "12px"
            }}
          >
            Outflow
          </div>
        </div>
      </div>

      {/* PROFIT */}
      <div className="col-md-4">
        <div
          className="p-3 h-100"
          style={{
            borderRadius: "16px",
            background:
              profit >= 0
                ? "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                : "linear-gradient(135deg, #fee2e2, #fecaca)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >
          <small style={{ opacity: 0.7 }}>Profit</small>

          <h4
            className="fw-bold mt-2"
            style={{
              color: profit >= 0 ? "#1d4ed8" : "#b91c1c"
            }}
          >
            ₹{profit.toLocaleString()}
          </h4>

          <div
            style={{
              marginTop: "10px",
              padding: "6px 10px",
              borderRadius: "10px",
              background: "rgba(0,0,0,0.05)",
              display: "inline-block",
              fontWeight: "bold",
              fontSize: "12px"
            }}
          >
            {profit >= 0 ? "Growth" : "Loss"}
          </div>
        </div>
      </div>

    </div>
  </div>
)}
      {/* Project */}
{activeTab === "projects" && (
  <div className="card p-4 border-0" style={{ background: "#f8fafc" }}>
    {projects.length > 0 ? (
      <div className="row g-4">
        {projects.map(p => (
          <div key={p.id} className="col-md-4">
            <div
              className="p-3 h-100"
              style={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #b4d6d3, #b4d6d3)",
                color: "Black",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "0.3s"
              }}
            >
              <h5 className="fw-bold mb-2">{p.name}</h5>

              <p style={{ fontSize: "13px", opacity: 0.85 }}>
                {p.description}
              </p>

              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.15)",
                  display: "inline-block",
                  fontWeight: "bold"
                }}
              >
                ₹{Number(p.budget).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-muted">No projects found</p>
    )}
  </div>
)}
    </div>
    
  );
}
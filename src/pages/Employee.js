import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Employee() {

  const API = "http://localhost:8080";

  const [employees, setEmployees] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: "",
    gender: "",
    businessId: ""
  });

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchEmployees();
    fetchBusinesses();
  }, []);

  const fetchEmployees = () => {
    axios.get(`${API}/api/employees`)
      .then(res => setEmployees(res.data))
      .catch(err => console.error("Fetch Employees Error:", err));
  };

  const fetchBusinesses = () => {
    axios.get(`${API}/api/business`)
      .then(res => setBusinesses(res.data))
      .catch(err => console.error("Fetch Business Error:", err));
  };

  // ================= SAVE =================

  const handleSave = async () => {

    if (!formData.name || !formData.businessId) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      name: formData.name,
      position: formData.position,
      salary: formData.salary ? Number(formData.salary) : null,
      gender: formData.gender,
      business: { id: Number(formData.businessId) }
    };

    try {

      if (editingEmployee) {
        await axios.put(`${API}/api/employees/${editingEmployee.id}`, payload);
      } else {
        await axios.post(`${API}/api/employees`, payload);
      }

      fetchEmployees();
      resetForm();

    } catch (error) {
      console.error("Save Error:", error.response?.data || error.message);
      alert("Error saving employee.");
    }
  };

  // ================= DELETE =================

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`${API}/api/employees/${id}`);
      await fetchEmployees();
      await fetchBusinesses();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // ================= EDIT =================

  const editEmployee = (emp) => {
    setFormData({
      name: emp.name,
      position: emp.position,
      salary: emp.salary ?? "",
      gender: emp.gender || "",
      businessId: emp.business?.id || ""
    });
    setEditingEmployee(emp);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      salary: "",
      gender: "",
      businessId: ""
    });
    setEditingEmployee(null);
    setShowModal(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background:"#f6f7fb", minHeight:"100vh", padding:"25px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Employee Management</h3>
        <button className="btn btn-dark" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>

      {/* SEARCH */}
      <div className="card border-0 p-3 mb-4"
        style={{ borderRadius:"14px", boxShadow:"0 3px 14px rgba(0,0,0,0.05)" }}>
        <input
          className="form-control"
          placeholder="Search employee..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div>

      {/* EMPLOYEE CARDS */}
      <div className="row g-4">

        {filteredEmployees.map(emp => (

          <div className="col-md-4" key={emp.id}>

            <div
              className="h-100 p-3"
              style={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #b4d6d3, #b4d6d3)",
                color: "black",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
              }}
            >

              {/* PROFILE */}
              <div className="d-flex align-items-center gap-3 mb-2">

                <img
                  src={
                    emp.gender === "female"
                      ? "/images/female.png"
                      : "/images/male.png"
                  }
                  alt="employee"
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />

                <div>
                  <h5 className="fw-bold mb-0">{emp.name}</h5>
                  <small style={{ opacity: 0.8 }}>{emp.position}</small>
                </div>

              </div>

              {/* COMPANY */}
              <p style={{ fontSize: "13px", marginBottom: "6px" }}>
                <strong>Company:</strong>{" "}
                <span style={{ fontWeight: "600" }}>
                  {emp.business?.name}
                </span>
              </p>

              {/* SALARY */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.2)",
                  display: "inline-block",
                  fontWeight: "bold"
                }}
              >
                ₹ {Number(emp.salary || 0).toLocaleString()}
              </div>

              {/* BUTTONS */}
              <div className="d-flex gap-2 mt-3">

                <button
                  className="btn btn-outline-dark btn-sm flex-fill"
                  onClick={() => editEmployee(emp)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-outline-danger btn-sm flex-fill"
                  onClick={() => deleteEmployee(emp.id)}
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content border-0" style={{borderRadius:"16px"}}>

              <div className="modal-header">
                <h5>
                  {editingEmployee ? "Update Employee" : "Add Employee"}
                </h5>
                <button className="btn-close" onClick={resetForm}/>
              </div>

              <div className="modal-body">

                <input
                  className="form-control mb-2"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e)=>setFormData({...formData, name:e.target.value})}
                />

                <input
                  className="form-control mb-2"
                  placeholder="Position"
                  value={formData.position}
                  onChange={(e)=>setFormData({...formData, position:e.target.value})}
                />

                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Salary"
                  value={formData.salary}
                  onChange={(e)=>setFormData({...formData, salary:e.target.value})}
                />

                <select
                  className="form-control mb-2"
                  value={formData.gender}
                  onChange={(e)=>setFormData({...formData, gender:e.target.value})}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <select
                  className="form-control"
                  value={formData.businessId}
                  onChange={(e)=>setFormData({...formData, businessId:e.target.value})}
                >
                  <option value="">Select Company</option>
                  {businesses.map(biz => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name}
                    </option>
                  ))}
                </select>

              </div>

              <div className="modal-footer">
                <button className="btn btn-light" onClick={resetForm}>
                  Cancel
                </button>

                <button className="btn btn-dark" onClick={handleSave}>
                  Save
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
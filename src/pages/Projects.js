import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Projects() {

  const API = "http://localhost:8080";

  const [projects, setProjects] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // ✅ NEW

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    businessId: ""
  });

  // ================= FETCH =================
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/api/projects`);
      setProjects(res.data);
    } catch (error) {
      console.error("Fetch Projects Error:", error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${API}/api/business`);
      setBusinesses(res.data);
    } catch (error) {
      console.error("Fetch Businesses Error:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchBusinesses();
  }, []);

  // ================= EDIT =================
  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      budget: project.budget,
      businessId: project.business?.id
    });

    setEditId(project.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This project will be deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it"
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API}/api/projects/${id}`);

        Swal.fire("Deleted!", "Project removed", "success");
        fetchProjects();
      } catch (error) {
        console.error("Delete Error:", error);
      }
    }
  };

  // ================= SAVE (CREATE + UPDATE) =================
  const handleSave = async () => {

    if (!formData.name || !formData.budget || !formData.businessId) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        budget: Number(formData.budget)
      };

      if (editId) {
        // UPDATE
        await axios.put(
          `${API}/api/projects/${editId}/business/${formData.businessId}`,
          payload
        );

        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Project Updated Successfully",
          timer: 1500,
          showConfirmButton: false
        });

      } else {
        // CREATE
        await axios.post(
          `${API}/api/projects/business/${formData.businessId}`,
          payload
        );

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Project Added Successfully",
          timer: 1500,
          showConfirmButton: false
        });
      }

      setShowModal(false);
      setEditId(null);

      setFormData({
        name: "",
        description: "",
        budget: "",
        businessId: ""
      });

      fetchProjects();

    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  return (

    <div style={{ background:"#f6f7fb", minHeight:"100vh", padding:"25px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Projects</h3>

        <button
          className="btn btn-dark"
          onClick={() => {
            setEditId(null); // reset
            setShowModal(true);
          }}
        >
          + Add Project
        </button>
      </div>

      {/* CARD VIEW */}
      <div className="row g-4 mb-4">
        {projects.length > 0 ? (
          projects.map((p) => (
            <div key={p.id} className="col-md-4">
              <div
                className="p-3 h-100"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #b4d6d3, #b4d6d3)",
                  color: "black",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                }}
              >
                <h5 className="fw-bold mb-2">{p.name}</h5>

                <p style={{ fontSize: "13px", opacity: 0.85 }}>
                  {p.description || "No description"}
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
                  ₹{Number(p.budget || 0).toLocaleString()}
                </div>

                <div className="mt-2 text-muted" style={{ fontSize: "12px" }}>
                  {p.business?.name}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No projects found</p>
        )}
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Project</th>
                <th>Description</th>
                <th>Budget</th>
                <th>Business</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {projects.length > 0 ? (

                projects.map((p) => (

                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td>₹{Number(p.budget || 0).toLocaleString()}</td>
                    <td>{p.business?.name}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No Projects Found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (

        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>{editId ? "Edit Project" : "Add Project"}</h5>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">

                <input
                  className="form-control mb-3"
                  placeholder="Project Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <textarea
                  className="form-control mb-3"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>

                <input
                  type="number"
                  className="form-control mb-3"
                  placeholder="Budget"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />

                <select
                  className="form-control"
                  value={formData.businessId}
                  onChange={(e) =>
                    setFormData({ ...formData, businessId: e.target.value })
                  }
                >
                  <option value="">Select Business</option>

                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-dark"
                  onClick={handleSave}
                >
                  {editId ? "Update Project" : "Save Project"}
                </button>

              </div>

            </div>
          </div>
        </div>

      )}

    </div>
  );
}
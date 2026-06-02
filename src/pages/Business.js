import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Business() {

  const navigate = useNavigate();
  const API = "http://localhost:8080/api/business";

  const [businesses, setBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  const [newBusiness, setNewBusiness] = useState({
    name: "",
    industry: "",
    revenue: "",
    logo: ""
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(API);
      setBusinesses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setBusinesses([]);
    }
  };

  const handleChange = (e) => {
    setNewBusiness({
      ...newBusiness,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBusiness(prev => ({
        ...prev,
        logo: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const addBusiness = async () => {

    if (!newBusiness.name || !newBusiness.industry) {
      Swal.fire("Missing Fields", "Please fill required fields", "warning");
      return;
    }

    try {
      if (editingBusiness) {
        await axios.put(`${API}/${editingBusiness.id}`, newBusiness);
        Swal.fire("Updated!", "Business updated", "success");
      } else {
        await axios.post(API, newBusiness);
        Swal.fire("Added!", "Business created", "success");
      }

      fetchBusinesses();

    } catch (err) {
      Swal.fire("Error", "Operation failed", "error");
    }

    setShowModal(false);
    setEditingBusiness(null);

    setNewBusiness({
      name: "",
      industry: "",
      revenue: "",
      logo: ""
    });
  };

  const deleteBusiness = (id) => {
    Swal.fire({
      title: "Delete Business?",
      icon: "warning",
      showCancelButton: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axios.delete(`${API}/${id}`);
          fetchBusinesses();
          Swal.fire("Deleted!", "", "success");
        } catch {
          Swal.fire("Error", "Delete failed", "error");
        }
      }
    });
  };

  const handleEdit = (biz) => {
    setEditingBusiness(biz);
    setNewBusiness({
      name: biz.name || "",
      industry: biz.industry || "",
      revenue: biz.revenue || "",
      logo: biz.logo || ""
    });
    setShowModal(true);
  };

  return (

    <div className="container-fluid p-4" style={{ background: "#f6f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Businesses</h2>
          <p className="text-muted mb-0">Manage all your organizations</p>
        </div>

        <button
          className="btn btn-dark px-4"
          onClick={() => {
            setEditingBusiness(null);
            setNewBusiness({
              name: "",
              industry: "",
              revenue: "",
              logo: ""
            });
            setShowModal(true);
          }}
          style={{ borderRadius: "10px" }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Business
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-4">

        {businesses.length > 0 ? businesses.map((biz) => (

          <div className="col-lg-4 col-md-6" key={biz.id}>

            <div className="h-100 p-3" style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #b4d6d3, #b4d6d3)",
              color: "black",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
            }}>

              <div className="d-flex align-items-center gap-3 mb-2">

                {biz.logo ? (
                  <img src={biz.logo} alt="logo" style={{
                    width: 50,
                    height: 50,
                    borderRadius: "12px",
                    objectFit: "cover"
                  }} />
                ) : (
                  <i className="bi bi-buildings fs-2"></i>
                )}

                <div>
                  <h5 className="fw-bold mb-0">{biz.name}</h5>
                  <small>{biz.industry}</small>
                </div>

              </div>

              <p style={{ fontSize: "13px" }}>
                <strong>Employees:</strong> {biz.employees?.length || 0}
              </p>

              <div style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.2)",
                display: "inline-block",
                fontWeight: "bold"
              }}>
                ₹{Number(biz.revenue || 0).toLocaleString()}
              </div>

              <div className="d-flex gap-2 mt-3">

                <button
                  className="btn btn-dark btn-sm flex-fill"
                  onClick={() => navigate(`/business-detail/${biz.id}`, { state: biz })}
                >
                  View
                </button>

                <button
                  className="btn btn-outline-dark btn-sm flex-fill"
                  onClick={() => handleEdit(biz)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-outline-danger btn-sm flex-fill"
                  onClick={() => deleteBusiness(biz.id)}
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        )) : (
          <div className="text-center mt-5">
            <h5>No Businesses Found</h5>
          </div>
        )}

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>{editingBusiness ? "Edit Business" : "Add Business"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body">

                <input className="form-control mb-3" name="name" placeholder="Business Name"
                  value={newBusiness.name} onChange={handleChange} />

                <input className="form-control mb-3" name="industry" placeholder="Industry"
                  value={newBusiness.industry} onChange={handleChange} />

                <input type="number" className="form-control mb-3" name="revenue" placeholder="Revenue"
                  value={newBusiness.revenue} onChange={handleChange} />

                <input type="file" className="form-control" onChange={handleLogoUpload} />

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={addBusiness}>
                  {editingBusiness ? "Update" : "Add"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
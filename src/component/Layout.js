import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <style>{`
        body{
          background:#f3f5f9;
          font-family: 'Inter', sans-serif;
        }

        /* Sidebar */
        .sidebar{
          width:${collapsed ? "80px" : "250px"};
          height:100vh;
          position:fixed;
          left:0;
          top:0;
          background:#1f2937;
          color:white;
          transition:0.3s;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
        }

        .logo{
          font-weight:600;
          font-size:18px;
          padding:20px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .toggle-btn{
          cursor:pointer;
          font-size:20px;
        }

        .nav-link{
          color:#cbd5e1;
          padding:12px 20px;
          border-radius:8px;
          margin:4px 10px;
          text-decoration:none;
          display:flex;
          align-items:center;
          gap:12px;
          transition:0.2s;
          white-space:nowrap;
        }

        .nav-link:hover{
          background:#374151;
          color:white;
        }

        .nav-link.active{
          background:#374151;
          color:white;
        }

        .link-text{
          display:${collapsed ? "none" : "inline"};
        }

        .section-title{
          font-size:12px;
          color:#9ca3af;
          margin:15px 15px 5px;
          text-transform:uppercase;
          letter-spacing:1px;
          display:${collapsed ? "none" : "block"};
        }

        /* Main Content */
        .main{
          margin-left:${collapsed ? "80px" : "250px"};
          padding:25px;
          min-height:100vh;
          transition:0.3s;
        }

      `}</style>

      {/* Sidebar */}
      <div className="sidebar">

        {/* Top */}
        <div>
          <div className="logo">
            {!collapsed && "Multi Business Management"}
            <i
              className={`bi ${collapsed ? "bi-list" : "bi-x-lg"} toggle-btn`}
              onClick={() => setCollapsed(!collapsed)}
            ></i>
          </div>

          <div className="section-title">Main</div>

          <nav className="nav flex-column">

            <NavLink to="/" end className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-house"></i>
              <span className="link-text">Dashboard</span>
            </NavLink>

            <NavLink to="/business" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-buildings"></i>
              <span className="link-text">Business</span>
            </NavLink>

            <NavLink to="/employee" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-people"></i>
              <span className="link-text">Employee</span>
            </NavLink>

            <NavLink to="/finance" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-cash-stack"></i>
              <span className="link-text">Finance</span>
            </NavLink>


            <NavLink to="/projects" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-list-check"></i>
              <span className="link-text">Projects</span>
            </NavLink>

            
            
          </nav>
        </div>

        {/* Bottom */}
        <div className="mb-3">

          <div className="section-title">System</div>

          <NavLink to="/settings" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <i className="bi bi-gear"></i>
            <span className="link-text">Settings</span>
          </NavLink>

        </div>

      </div>

      {/* Main */}
      <div className="main">
        <Outlet />
      </div>
    </>
  );
}

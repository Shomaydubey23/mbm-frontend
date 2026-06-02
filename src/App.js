import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./component/Layout";
import Dashboard from "./pages/Dashboard";
import Business from "./pages/Business";
import BusinessDetail from "./pages/BusinessDetail";
import Employee from "./pages/Employee";
import Finance from "./pages/Finance";
import Projects from "./pages/Projects";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>

          <Route index element={<Dashboard />} />

          {/* ✅ NO SLASH */}
          <Route path="business" element={<Business />} />

          {/* ✅ FIXED */}
          <Route path="business-detail/:id" element={<BusinessDetail />} />

          {/* ✅ FIX THESE TOO */}
          <Route path="projects" element={<Projects />} />
          <Route path="employee" element={<Employee />} />
          <Route path="finance" element={<Finance />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

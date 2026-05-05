import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function Dashboard() {
  const [meters, setMeters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/meters")
      .then(res => setMeters(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* 🔥 NAVBAR */}
      <div className="navbar">
        <h2 
          style={{ cursor: "pointer" }} 
          onClick={() => navigate("/dashboard")}
        >
          SmartGrid AI
        </h2>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          
          {/* REPORT */}
          <span 
            className="nav-item"
            onClick={() => navigate("/report")}
          >
            Report
          </span>

          {/* ANALYTICS */}
          <span 
            className="nav-item"
            onClick={() => navigate("/analytics")}
          >
            Analytics
          </span>

          {/* ✅ FIXED HELP */}
          <span 
            className="nav-item"
            onClick={() => navigate("/help")}
          >
            Help
          </span>

          <ThemeToggle />

          {/* LOGOUT */}
          <span
            onClick={handleLogout}
            className="nav-item"
            style={{ color: "#ef4444", fontWeight: "500" }}
          >
            Logout
          </span>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        <h2 style={{ marginTop: "10px" }}>All Meters</h2>

        {/* 🔥 GRID */}
        <div style={grid}>
          {meters.map((meter) => (
            <div
              key={meter.id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/report?meterId=${meter.meter_id}`)}
            >
              <h3>{meter.meter_id}</h3>

              <p><b>Type:</b> {meter.meter_type}</p>
              <p><b>Category:</b> {meter.meter_category}</p>
              <p><b>Status:</b> {meter.status || "N/A"}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* GRID */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px"
};

export default Dashboard;
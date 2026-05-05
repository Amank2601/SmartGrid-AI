import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import StatsCard from "../components/StatsCard";
import EventPieChart from "../components/Charts/EventPieChart";
import FaultBarChart from "../components/Charts/FaultBarChart";
import UsageLineChart from "../components/Charts/UsageLineChart";

function AnalyticsPage() {
  const [stats, setStats] = useState({});
  const [faults, setFaults] = useState([]);
  const [usage, setUsage] = useState([]);

  const navigate = useNavigate(); // 🔥 navigation

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/analytics/overview")
      .then(res => setStats(res.data));

    axios.get("http://127.0.0.1:8000/analytics/faults")
      .then(res => setFaults(res.data));

    axios.get("http://127.0.0.1:8000/analytics/usage")
      .then(res => setUsage(res.data));
  }, []);

  const pieData = [
    { name: "Active", value: stats.active || 0 },
    { name: "Inactive", value: stats.inactive || 0 },
    { name: "Expired", value: stats.expired || 0 },
  ];

  return (
    <div style={{ padding: "30px" }}>

      {/* 🔥 BACK BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "#38bdf8",
            color: "#020617",
            fontWeight: "600",
            padding: "8px 16px",
            borderRadius: "8px"
          }}
        >
          ⬅ Back to Dashboard
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        📊 Analytics Dashboard
      </h2>

      {/* 🔥 STATS */}
      <div style={statsGrid}>
        <StatsCard title="Total Meters" value={stats.total || 0} />
        <StatsCard title="Active" value={stats.active || 0} />
        <StatsCard title="Inactive" value={stats.inactive || 0} />
        <StatsCard title="Expired" value={stats.expired || 0} />
      </div>

      {/* 🔥 CHARTS */}
      <div style={chartGrid}>

        {/* PIE */}
        <div className="card">
          <h3>Status Distribution</h3>
          <EventPieChart data={pieData} />
        </div>

        {/* BAR */}
        <div className="card">
          <h3>Fault Frequency</h3>
          <FaultBarChart data={faults} />
        </div>

        {/* LINE (FULL WIDTH) */}
        <div className="card full-width">
          <h3>Usage Trend</h3>
          <UsageLineChart data={usage} />
        </div>

      </div>

    </div>
  );
}

/* 🔥 STATS GRID */
const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "20px"
};

/* 🔥 CHART GRID */
const chartGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  gap: "20px"
};

export default AnalyticsPage;
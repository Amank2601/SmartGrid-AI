import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ReportPage from "./pages/ReportPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import HelpPage from "./pages/HelpPage"; // ✅ NEW

import RoleSelect from "./pages/RoleSelect";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";

function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const isLogged = localStorage.getItem("loggedIn");
    if (isLogged === "true") {
      setLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Routes>

        {/* 🔹 ROLE SELECT */}
        <Route path="/" element={<RoleSelect />} />

        {/* 🔹 EMPLOYEE LOGIN */}
        <Route
          path="/employee-login"
          element={<Login setLoggedIn={setLoggedIn} />}
        />

        {/* 🔹 DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            loggedIn
              ? <Dashboard />
              : <Navigate to="/employee-login" replace />
          }
        />

        {/* 🔹 ANALYTICS */}
        <Route
          path="/analytics"
          element={
            loggedIn
              ? <AnalyticsPage />
              : <Navigate to="/employee-login" replace />
          }
        />

        {/* 🔹 REPORT */}
        <Route
          path="/report"
          element={
            loggedIn
              ? <ReportPage />
              : <Navigate to="/employee-login" replace />
          }
        />

        <Route
          path="/report/:meterId/:type"
          element={
            loggedIn
              ? <ReportPage />
              : <Navigate to="/employee-login" replace />
          }
        />

        {/* 🔹 HELP PAGE (NEW) */}
        <Route
          path="/help"
          element={
            loggedIn
              ? <HelpPage />
              : <Navigate to="/employee-login" replace />
          }
        />

        {/* 🔹 USER SIDE */}
        <Route path="/user-login" element={<UserLogin />} />

        <Route
          path="/user-dashboard/:meterId"
          element={<UserDashboard />}
        />

        {/* 🔹 FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
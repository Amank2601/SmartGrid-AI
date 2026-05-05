import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserLogin() {
  const [meterId, setMeterId] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!meterId) return alert("Enter Meter ID");

    // ✅ FIXED NAVIGATION (IMPORTANT)
    navigate(`/user-dashboard/${meterId}`);
  };

  return (
    <div style={container}>

      <div style={overlay}></div>

      <div style={card}>
        <h2 style={{ marginBottom: "20px" }}>User Access</h2>

        <input
          placeholder="Enter Meter ID"
          value={meterId}
          onChange={(e) => setMeterId(e.target.value)}
          style={input}
        />

        <button onClick={handleLogin} style={button}>
          View Usage
        </button>
      </div>

    </div>
  );
}

/* 🎨 STYLES */

const container = {
  height: "100vh",
  backgroundImage:
    "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1535223289827-42f1e9919769')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative"
};

const overlay = {
  position: "absolute",
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)"
};

const card = {
  position: "relative",
  backdropFilter: "blur(10px)",
  background: "rgba(255,255,255,0.1)",
  padding: "40px",
  borderRadius: "15px",
  width: "320px",
  color: "white",
  textAlign: "center",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "none"
};

const button = {
  width: "70%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#22c55e",
  color: "white",
  cursor: "pointer",
  margin: "0 auto",
  display: "block",
  fontWeight: "500"
};

export default UserLogin;
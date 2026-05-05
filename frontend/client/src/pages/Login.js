import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ✅ ADD THIS

function Login({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();   // ✅ ADD THIS

  const handleLogin = () => {
    axios.post("http://127.0.0.1:8000/login", null, {
      params: { username: "admin", password }
    })
    .then((res) => {
      console.log("LOGIN SUCCESS", res);

      localStorage.setItem("loggedIn", "true");
      setLoggedIn(true);

      navigate("/dashboard");   // 🔥 THIS WAS MISSING
    })
    .catch((err) => {
      console.log("LOGIN ERROR", err);
      alert("Invalid credentials");
    });
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1518770660439-4636190af475')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>

      <div style={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.1)",
        padding: "40px",
        borderRadius: "15px",
        width: "300px",
        color: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Employee Login
        </h2>

        <input
          type = "password"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "none"
};

const buttonStyle = {
  width: "60%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
  display: "block",
  margin: "10px auto",
  fontWeight: "500"
};

export default Login;
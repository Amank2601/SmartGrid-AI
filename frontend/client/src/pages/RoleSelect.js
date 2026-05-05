import { useNavigate } from "react-router-dom";

function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #f59e0b, #f97316)"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "white", marginBottom: "40px" }}>
          Everything You Need, All in One Place
        </h1>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          
          <button style={btn} onClick={() => navigate("/employee-login")}>
            EMPLOYEE LOGIN
          </button>

          <button style={btn} onClick={() => navigate("/user-login")}>
            USER LOGIN
          </button>

        </div>
      </div>
    </div>
  );
}

const btn = {
  padding: "15px 30px",
  fontSize: "18px",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

export default RoleSelect;
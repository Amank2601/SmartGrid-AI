function StatsCard({ title, value, color }) {
  return (
    <div style={card}>
      <h4>{title}</h4>
      <h2 style={{ color }}>{value}</h2>
    </div>
  );
}

const card = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
};

export default StatsCard;
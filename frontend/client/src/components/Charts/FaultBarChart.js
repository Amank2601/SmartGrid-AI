import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function FaultBarChart({ data }) {
  return (
    <BarChart width={400} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#38bdf8" />
    </BarChart>
  );
}

export default FaultBarChart;
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function UsageLineChart({ data }) {
  return (
    <LineChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="usage" stroke="#22c55e" />
    </LineChart>
  );
}

export default UsageLineChart;
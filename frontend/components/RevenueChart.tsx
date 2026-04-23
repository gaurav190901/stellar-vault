"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Split {
  address: string;
  basisPoints: number;
}

const COLORS = ["#5bb8d4", "#3a9ab8", "#34d399", "#fbbf24"];
const defaultSplits: Split[] = [
  { address: "Creator", basisPoints: 7000 },
  { address: "Platform", basisPoints: 2000 },
  { address: "Treasury", basisPoints: 1000 },
];

export default function RevenueChart({ splits = defaultSplits }: { splits?: Split[] }) {
  const data = splits.map((s) => ({
    name: s.address.length > 10 ? `${s.address.slice(0, 6)}...` : s.address,
    value: s.basisPoints / 100,
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold mb-4">Revenue Split</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{background: "#0c1420", border: "1px solid #1a2840", borderRadius: "8px", color: "#f0f4f8", fontSize: "12px"}}
            formatter={(value) => [`${value}%`, "Share"]} />
          <Legend iconType="circle" iconSize={8}
            formatter={(value) => <span style={{color: "#6b8299", fontSize: "12px"}}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

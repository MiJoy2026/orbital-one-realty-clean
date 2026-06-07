"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type RevenueChartProps = {
  data: {
    date: string;
    revenue: number;
  }[];
};

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="mt-12 w-fit rounded-2xl border border-white/20 bg-white/5 p-6">
      <h2 className="text-2xl font-black text-yellow-400">
        Revenue Trend
      </h2>

        <div className="mt-6 h-56 w-64">
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
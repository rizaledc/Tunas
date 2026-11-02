"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const PALETTE = ["#940000", "#e8b54d", "#333333", "#e60000", "#808080", "#5c1a33", "#c94848", "#b8a07a"];

export function ScreenTimeChart({ data, target }: { data: Array<{ label: string; digital: number; positif: number }>; target: number }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v} menit`]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="digital" name="Screen time" fill="#333333" radius={[6, 6, 0, 0]} />
          <Bar dataKey="positif" name="Aktivitas positif" fill="#940000" radius={[6, 6, 0, 0]} />
          <ReferenceLine y={target} stroke="#e8b54d" strokeDasharray="6 4" strokeWidth={2} label={{ value: `Target ${target}`, fill: "#cf9327", fontSize: 12, position: "insideTopRight" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data, unit = "menit" }: { data: Array<{ name: string; value: number }>; unit?: string }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (!total) return <p className="py-8 text-center text-sm text-ink-soft">Belum ada data.</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [`${v} ${unit} (${Math.round((Number(v) / total) * 100)}%)`, n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChart({ data, lines }: { data: Array<Record<string, string | number>>; lines: Array<{ key: string; name: string; color?: string }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {lines.map((l, i) => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color ?? PALETTE[i]} strokeWidth={3} dot={{ r: 3 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBars({ data, color = "#940000", unit = "" }: { data: Array<{ name: string; value: number }>; color?: string; unit?: string }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v}${unit}`]} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

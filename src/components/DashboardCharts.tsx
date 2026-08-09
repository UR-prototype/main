"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ScoreTrendChart({
  data,
}: {
  data: { month: string; score: number }[];
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            name="숙련도"
            stroke="#1f6feb"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LevelBarChart({
  data,
  compact = false,
}: {
  data: { name: string; value: number }[];
  compact?: boolean;
}) {
  return (
    <div className={`w-full ${compact ? "h-40" : "h-64"}`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Bar dataKey="value" name="인원" fill="#1f6feb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AiManualCompareChart({
  data,
  compact = false,
}: {
  data: { name: string; score: number; manual: number }[];
  compact?: boolean;
}) {
  return (
    <div className={`w-full ${compact ? "h-40" : "h-64"}`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="score" name="시스템" fill="#1f6feb" radius={[3, 3, 0, 0]} />
          <Bar dataKey="manual" name="평가자" fill="#94a3b8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TradeScoreLineChart({
  data,
  onSelectTrade,
}: {
  data: { trade: string; avg: number | null; max: number | null; count: number }[];
  activeTrade?: string;
  onSelectTrade?: (trade: string) => void;
}) {
  const chartData = data.map((d) => ({
    ...d,
    avg: d.avg ?? 0,
    max: d.max ?? 0,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          onClick={(state) => {
            const label = state?.activeLabel;
            if (typeof label === "string" && onSelectTrade) onSelectTrade(label);
          }}
          style={{ cursor: onSelectTrade ? "pointer" : undefined }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="trade" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, name) => [
              !value ? "—" : String(value),
              name === "avg" ? "평균" : name === "max" ? "최고" : String(name),
            ]}
            labelFormatter={(label) => `직종 · ${label}`}
          />
          <Legend
            formatter={(value) =>
              value === "avg" ? "평균 숙련도" : "최고 숙련도"
            }
          />
          <Line
            type="monotone"
            dataKey="avg"
            name="avg"
            stroke="#1f6feb"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "#1f6feb", strokeWidth: 0 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="max"
            name="max"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#94a3b8", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillRadar({
  metrics,
}: {
  metrics: {
    speed: number;
    repetition: number;
    stability: number;
    accuracy: number;
  };
}) {
  const data = [
    { key: "속도", value: metrics.speed },
    { key: "반복성", value: metrics.repetition },
    { key: "안정성", value: metrics.stability },
    { key: "정확도", value: metrics.accuracy },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="key" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="숙련도"
            dataKey="value"
            stroke="#1f6feb"
            fill="#1f6feb"
            fillOpacity={0.25}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

// Types
type Message = {
  id: string;
  contactName: string;
  phone: string;
  campaignId: string;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
};

type Stats = {
  total: number;
  queued: number;
  delivered: number;
  failed: number;
  rate_limited: number;
};

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  rate_limited: "bg-purple-100 text-purple-800",
};

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, queued: 0, delivered: 0, failed: 0, rate_limited: 0 });
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    const res = await fetch(`/api/messages?status=${filter}`);
    const data = await res.json();
    setMessages(data.messages);
    setStats(data.stats);
  };

  // Poll every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📨 Message Queue Dashboard</h1>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "bg-gray-100" },
          { label: "Queued", value: stats.queued, color: "bg-yellow-100" },
          { label: "Delivered", value: stats.delivered, color: "bg-green-100" },
          { label: "Failed", value: stats.failed, color: "bg-red-100" },
          { label: "Rate Limited", value: stats.rate_limited, color: "bg-purple-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {["all", "queued", "delivered", "failed", "rate_limited"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              {["Contact Name", "Phone", "Campaign", "Status", "Created At", "Delivered At"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{msg.contactName}</td>
                <td className="px-4 py-3">{msg.phone}</td>
                <td className="px-4 py-3">{msg.campaignId}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[msg.status] ?? "bg-gray-100"}`}>
                    {msg.status}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(msg.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{msg.deliveredAt ? new Date(msg.deliveredAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No messages found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
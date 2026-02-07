"use client";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  saved: "bg-purple-100 text-purple-800",
  dismissed: "bg-gray-100 text-gray-800",
  applied: "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

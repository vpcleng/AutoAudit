import React, { useMemo, useState } from "react";

export default function AuditResultsTable({ results }) {
  /**
   * Normalises the JSON (data is an object keyed by CIS IDs).
   * Convert it to an array of rows so it's easy to loop and filter.
   */
  const rows = useMemo(() => {
    if (!results) return [];
    return Object.keys(results).map((k) => {
      const r = results[k] || {};
      const status = (r.status || (r.error ? "Error" : "Unknown")).toLowerCase();
      return {
        id: r.id || k,
        title: r.title || "",
        service: r.input_kind || "",
        status, // compliant | noncompliant | error | unknown
        count: r.counts?.violations ?? (r.violations?.length ?? 0),
        violations: r.violations || [],
        error: r.error || ""
      };
    });
  }, [results]);

  /**
   *Filter state — which rows to show.
   */
  const [filter, setFilter] = useState("all"); // all | compliant | noncompliant | error

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "compliant") return rows.filter(r => r.status === "compliant");
    if (filter === "noncompliant") return rows.filter(r => r.status === "noncompliant");
    if (filter === "error") return rows.filter(r => r.status === "error" || r.status === "unknown");
    return rows;
  }, [rows, filter]);

  /**
   * Helper to style the filter pills.
   * (Using token colours)
   */
  const pillStyle = (active) => ({
    background: active ? "rgb(var(--accent-teal))" : "transparent",
    color: active ? "rgb(var(--surface-1))" : "rgb(var(--text-strong))",
    border: "1px solid rgb(var(--border-subtle))",
  });

  return (
    <div
      className="rounded-[var(--radius-2)] p-4 space-y-4"
      style={{
        background: "rgb(var(--surface-2))",
        border: "1px solid rgb(var(--border-subtle))",
      }}
    >
      {/* Header with filter pills */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-base font-semibold" style={{ color: "rgb(var(--text-strong))" }}>
          Scan at 30/09/25 03:34 ({filtered.length}/{rows.length})
        </h3>

        <div className="flex gap-2 text-sm">
          <button onClick={() => setFilter("all")} style={pillStyle(filter==="all")} className="px-3 py-1 rounded-full">All</button>
          <button onClick={() => setFilter("compliant")} style={pillStyle(filter==="compliant")} className="px-3 py-1 rounded-full">Compliant</button>
          <button onClick={() => setFilter("noncompliant")} style={pillStyle(filter==="noncompliant")} className="px-3 py-1 rounded-full">NonCompliant</button>
          <button onClick={() => setFilter("error")} style={pillStyle(filter==="error")} className="px-3 py-1 rounded-full">Error</button>
        </div>
      </div>

      {/* Main results table */}
      <div className="overflow-auto rounded-[var(--radius-1)] border"
           style={{ borderColor: "rgb(var(--border-subtle))" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "rgb(var(--surface-1))" }}>
            <tr className="text-left">
              <th className="p-2 text-[var(--text-muted)]">Control</th>
              <th className="p-2 text-[var(--text-muted)]">Service</th>
              <th className="p-2 text-[var(--text-muted)]">Status</th>
              <th className="p-2 text-[var(--text-muted)]"># Violations</th>
              <th className="p-2 text-[var(--text-muted)]">Example / Error</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t"
                  style={{
                    borderColor: "rgb(var(--border-subtle))",
                    background:
                      c.status === "noncompliant"
                        ? "rgba(var(--accent-bad),0.1)"
                        : c.status === "compliant"
                        ? "rgba(var(--accent-good),0.05)"
                        : "transparent"
                  }}>
                {/* Control ID + Title */}
                <td className="p-2">
                  <span className="font-semibold text-[var(--text-strong)]">{c.id}</span>
                  <div className="text-xs text-[var(--text-muted)]">{c.title}</div>
                </td>

                {/* Service */}
                <td className="p-2 text-[var(--text-strong)]">{c.service}</td>

                {/* Status Badge */}
                <td className="p-2">
                  <span
                    className="rounded px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background:
                        c.status === "noncompliant"
                          ? "rgb(var(--accent-bad))"
                          : c.status === "compliant"
                          ? "rgb(var(--accent-good))"
                          : "rgb(var(--accent-warn))",
                      color: "rgb(var(--surface-1))",
                    }}
                  >
                    {c.status}
                  </span>
                </td>

                {/* Violation count */}
                <td className="p-2 text-center">{c.count}</td>

                {/* First violation / error */}
                <td className="p-2 text-xs text-[var(--text-muted)]">
                  {c.violations?.[0] || c.error || "—"}
                </td>
              </tr>
            ))}

            {/* If there are 0 rows (no results) render this */}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[var(--text-muted)]">
                  No results to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

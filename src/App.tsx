/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";

const techniques = [
  { rank: 1, name: "Deep Work Blocks", tagline: "90-min focus", effectiveness: 97, description: "Undivided work sessions. No distractions. One task only.", howTo: "Set a timer for 90 minutes. Work on one task. Do not stop until the timer ends.", scienceBit: "Ultradian rhythms: brain focus cycles.", color: "#000" },
  { rank: 2, name: "Temptation Bundling", tagline: "Pair pain with pleasure", effectiveness: 84, description: "Only enjoy a specific reward while working.", howTo: "Pick a reward and only allow it during work blocks.", scienceBit: "Dopamine pairing.", color: "#000" },
  { rank: 3, name: "Implementation Intentions", tagline: "If-then protocol", effectiveness: 76, description: "Pre-decide actions for distractions.", howTo: "Write 'If [distraction], then [action]'.", scienceBit: "Goal-setting efficiency.", color: "#000" },
  { rank: 4, name: "The 2-Minute Rule", tagline: "Start small", effectiveness: 68, description: "If a task takes less than 2 minutes, do it now. Or just start for 2 minutes.", howTo: "Commit to just 2 minutes of work.", scienceBit: "Activation energy.", color: "#000" },
  { rank: 5, name: "Environmental Design", tagline: "Engineer your space", effectiveness: 61, description: "Remove distractions from your physical and digital space.", howTo: "Put your phone in another room.", scienceBit: "Friction reduction.", color: "#000" },
];

const weekdayBlocks = [
  { time: "17:00", dur: 10, label: "BOOT", type: "ritual", desc: "Prepare space. Set goal." },
  { time: "17:10", dur: 90, label: "DEEP WORK I", type: "work", desc: "Primary task." },
  { time: "18:40", dur: 15, label: "RECHARGE", type: "break", desc: "No screens." },
  { time: "18:55", dur: 75, label: "DEEP WORK II", type: "work", desc: "Secondary task." },
  { time: "20:10", dur: 20, label: "RESET", type: "ritual", desc: "Log wins. Plan tomorrow." },
  { time: "20:30", dur: 60, label: "LEARN", type: "learn", desc: "Study/Read." },
  { time: "21:30", dur: 30, label: "WIND DOWN", type: "break", desc: "Prepare for rest." },
  { time: "22:00", dur: 0, label: "END", type: "end", desc: "Shutdown complete." },
];

const weekendBlocks = [
  { time: "06:00", dur: 30, label: "IGNITION", type: "ritual", desc: "Morning ritual." },
  { time: "06:30", dur: 120, label: "PRIME BLOCK", type: "work", desc: "Hardest problem." },
  { time: "08:30", dur: 30, label: "BREAK", type: "break", desc: "Walk/Eat." },
  { time: "09:00", dur: 90, label: "DEEP WORK II", type: "work", desc: "Creative work." },
  { time: "10:30", dur: 30, label: "RESET", type: "break", desc: "Stretch." },
  { time: "11:00", dur: 60, label: "LEARN", type: "learn", desc: "Research." },
  { time: "12:00", dur: 0, label: "END", type: "end", desc: "Mission complete." },
];

const habits = [
  { icon: "📵", habit: "Phone in drawer", impact: "Cuts 70% distraction", cat: "Space" },
  { icon: "🔒", habit: "Log out social", impact: "Adds friction", cat: "Digital" },
  { icon: "🎯", habit: "One goal", impact: "Halves switching", cat: "Clarity" },
  { icon: "🩶", habit: "Grayscale mode", impact: "Cuts triggers", cat: "Digital" },
  { icon: "💬", habit: "Batch messages", impact: "Kills reactivity", cat: "Boundaries" },
  { icon: "⛔", habit: "No social start", impact: "Protects focus", cat: "Ritual" },
  { icon: "📓", habit: "Daily debrief", impact: "Builds awareness", cat: "Reflection" },
];

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const HABITS_TRACK = ["Deep Work I", "Deep Work II", "Phone Away", "No Social", "One Goal", "Learning", "Debrief"];

const TC: Record<string, { color: string; bg: string }> = {
  ritual: { color: "#000", bg: "#f0f0f0" },
  work:   { color: "#fff", bg: "#000" },
  break:  { color: "#666", bg: "#f9f9f9" },
  learn:  { color: "#000", bg: "#e8e8e8" },
  end:    { color: "#999", bg: "#fff" },
};

export default function App() {
  const [tab, setTab] = useState("techniques");
  const [sched, setSched] = useState("weekday");
  const [exp, setExp] = useState<number | null>(null);
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>(() => {
    const c: Record<string, Record<string, boolean>> = {};
    DAYS.forEach(d => { c[d] = {}; HABITS_TRACK.forEach(h => { c[d][h] = false; }); });
    return c;
  });

  const toggle = (d: string, h: string) => setChecks(p => ({ ...p, [d]: { ...p[d], [h]: !p[d][h] } }));
  const score = (d: string) => Math.round(Object.values(checks[d]).filter(Boolean).length / HABITS_TRACK.length * 100);

  const TABS = [
    { id: "techniques", label: "TECH" },
    { id: "schedule",   label: "TIME" },
    { id: "habits",     label: "HABIT" },
    { id: "tracker",    label: "TRACK" },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#fff", 
      color: "#000", 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      padding: "env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0" 
    }}>
      
      {/* HEADER */}
      <header style={{ padding: "40px 20px 20px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px", margin: 0 }}>Focus Override</h1>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Minimalist Productivity System</p>
      </header>

      {/* TABS */}
      <nav style={{ display: "flex", borderBottom: "1px solid #eee", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        {TABS.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            style={{
              flex: 1,
              padding: "16px 0",
              border: "none",
              background: "none",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "1px",
              color: tab === t.id ? "#000" : "#aaa",
              borderBottom: tab === t.id ? "2px solid #000" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: "24px 20px" }}>
        
        {tab === "techniques" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {techniques.map(t => (
              <div 
                key={t.rank} 
                onClick={() => setExp(exp === t.rank ? null : t.rank)}
                style={{
                  padding: "20px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: exp === t.rank ? "#fafafa" : "#fff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>{t.name}</h3>
                    <p style={{ fontSize: "12px", color: "#888", margin: "2px 0 0" }}>{t.tagline}</p>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>{t.effectiveness}%</span>
                </div>
                {exp === t.rank && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
                    <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#444" }}>{t.description}</p>
                    <div style={{ marginTop: "12px", padding: "12px", background: "#000", color: "#fff", borderRadius: "4px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>How to</p>
                      <p style={{ fontSize: "13px", margin: 0 }}>{t.howTo}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "schedule" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              {["weekday", "weekend"].map(k => (
                <button 
                  key={k} 
                  onClick={() => setSched(k)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "1px solid #eee",
                    background: sched === k ? "#000" : "#fff",
                    color: sched === k ? "#fff" : "#000",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "capitalize"
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(sched === "weekday" ? weekdayBlocks : weekendBlocks).map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px", border: "1px solid #eee", borderRadius: "8px" }}>
                  <div style={{ width: "60px", fontSize: "13px", fontWeight: "700" }}>{b.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{b.label}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{b.desc}</div>
                  </div>
                  <div style={{ 
                    fontSize: "10px", 
                    padding: "4px 8px", 
                    borderRadius: "4px", 
                    background: TC[b.type].bg, 
                    color: TC[b.type].color,
                    fontWeight: "700",
                    textTransform: "uppercase"
                  }}>
                    {b.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "habits" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {habits.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", padding: "20px", border: "1px solid #eee", borderRadius: "8px" }}>
                <span style={{ fontSize: "24px" }}>{h.icon}</span>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "600", margin: 0 }}>{h.habit}</h3>
                  <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0" }}>{h.impact}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "tracker" && (
          <div>
            <div style={{ display: "flex", gap: "4px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
              {DAYS.map(d => {
                const s = score(d);
                return (
                  <div key={d} style={{ flex: 1, minWidth: "50px", textAlign: "center", padding: "12px 0", border: "1px solid #eee", borderRadius: "8px" }}>
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>{d}</div>
                    <div style={{ fontSize: "14px", fontWeight: "700" }}>{s}%</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#eee", border: "1px solid #eee", borderRadius: "8px", overflow: "hidden" }}>
              {HABITS_TRACK.map((h, i) => (
                <div key={i} style={{ background: "#fff", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#444" }}>{h}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {DAYS.map(d => (
                      <div 
                        key={d} 
                        onClick={() => toggle(d, h)}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          border: "1px solid #eee",
                          background: checks[d][h] ? "#000" : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "12px"
                        }}
                      >
                        {checks[d][h] ? "✓" : ""}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER / PWA INSTALL HINT */}
      <footer style={{ padding: "40px 20px", textAlign: "center", color: "#ccc", fontSize: "11px" }}>
        <p>© 2026 Focus Override · Minimalist PWA</p>
      </footer>
    </div>
  );
}

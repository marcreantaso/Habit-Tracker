/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";

const techniques = [
  { rank: 1, name: "Deep Work Blocks", tagline: "90-min monk mode", effectiveness: 97, description: "Lock yourself in 90-minute sessions of pure, undivided work. Phone in another room. Browser closed. One task only. This is where 10% energy people become 80% output machines.", howTo: "Set a physical timer. Write the ONE thing you're working on. Don't break until the timer ends. No negotiation.", scienceBit: "Ultradian rhythms: your brain runs in ~90-min high-focus cycles naturally.", color: "#FF4500" },
  { rank: 2, name: "Temptation Bundling", tagline: "Pair pain with pleasure", effectiveness: 84, description: "Only listen to your favorite playlist WHILE doing deep work. Your brain learns: focus = reward. Brainrot scrolling loses its appeal.", howTo: "Pick 1 pleasure and ONLY allow it during work blocks. No work = no pleasure. Operant conditioning hacked in your favor.", scienceBit: "Dopamine pairing: associate work stimulus with reward. Harvard-backed method.", color: "#FFB300" },
  { rank: 3, name: "Implementation Intentions", tagline: "If-then protocol", effectiveness: 76, description: "Pre-decide what you'll do when distraction hits. 'If I feel like opening TikTok, I will do 10 push-ups first.' The urge needs a script.", howTo: "Write 3 IF-THEN statements tonight. Tape them to your monitor. Read before every session.", scienceBit: "Peter Gollwitzer: if-then planners achieve goals at 2-3x the rate of vague goal-setters.", color: "#00BFA5" },
  { rank: 4, name: "The 2-Minute Rule", tagline: "Start small, scale fast", effectiveness: 68, description: "At 10% energy, starting is the boss battle. You only have to do 2 minutes. 90% of the time you keep going. Resistance isn't the work — it's the start.", howTo: "Open your task and do ANYTHING for exactly 2 minutes. Set the timer. Begin. That's all.", scienceBit: "Activation energy theory: beginning a task drops psychological resistance by 60%.", color: "#7C4DFF" },
  { rank: 5, name: "Environmental Design", tagline: "Engineer your battlefield", effectiveness: 61, description: "Your environment is your OS. If social media is 2 taps away, you WILL open it. Put friction between you and distraction.", howTo: "Log out of all social accounts. Move apps to a folder labeled 'DOPAMINE TRAP'. Set grayscale during work hours.", scienceBit: "BJ Fogg: reducing friction by even 20 seconds changes behavior long-term.", color: "#26A69A" },
];

const weekdayBlocks = [
  { time: "5:00 PM", dur: 10, label: "BOOT SEQUENCE", type: "ritual", desc: "Change clothes. Drink water. Write today's ONE goal." },
  { time: "5:10 PM", dur: 90, label: "DEEP WORK BLOCK 1", type: "work", desc: "Hardest task. Phone off. Music on. No mercy." },
  { time: "6:40 PM", dur: 15, label: "RECHARGE BREAK", type: "break", desc: "Walk. Stretch. No screens. Eat something real." },
  { time: "6:55 PM", dur: 75, label: "DEEP WORK BLOCK 2", type: "work", desc: "Secondary task or continue Block 1." },
  { time: "8:10 PM", dur: 20, label: "REVIEW + RESET", type: "ritual", desc: "What did you ship? Log it. Plan tomorrow's ONE goal." },
  { time: "8:30 PM", dur: 60, label: "LEARNING BLOCK", type: "learn", desc: "Read. Watch lectures. Study for IQ expansion." },
  { time: "9:30 PM", dur: 30, label: "WIND DOWN", type: "break", desc: "Light activity. No brainrot. Prepare for tomorrow." },
  { time: "10:00 PM", dur: 0, label: "SHUTDOWN COMPLETE", type: "end", desc: "Done. You earned rest." },
];

const weekendBlocks = [
  { time: "6:00 AM", dur: 30, label: "MORNING IGNITION", type: "ritual", desc: "Cold water. 5 min journaling. Declare the day's mission." },
  { time: "6:30 AM", dur: 120, label: "PRIME POWER BLOCK", type: "work", desc: "Freshest brain hits hardest problem. Sacred time." },
  { time: "8:30 AM", dur: 30, label: "BREAKFAST + WALK", type: "break", desc: "Eat well. Move. No phone." },
  { time: "9:00 AM", dur: 90, label: "DEEP WORK BLOCK 2", type: "work", desc: "Creative work, assignments, coding, designing." },
  { time: "10:30 AM", dur: 30, label: "TACTICAL BREAK", type: "break", desc: "Controlled social check (10 min max). Stretch. Reset." },
  { time: "11:00 AM", dur: 60, label: "THESIS / LEARNING", type: "learn", desc: "Thesis, research, technical reading. Future-you says thanks." },
  { time: "12:00 PM", dur: 0, label: "MISSION COMPLETE", type: "end", desc: "Morning wins locked in. Rest of day is yours." },
];

const habits = [
  { icon: "📵", habit: "Phone in a drawer during all work blocks", impact: "Eliminates 70% of impulse checking", cat: "Environment" },
  { icon: "🔒", habit: "Log out of ALL social media every night", impact: "Login friction = 80% less brainrot scrolling", cat: "Friction" },
  { icon: "🎯", habit: "Write your ONE goal before every session", impact: "Intention-setting reduces task-switching by half", cat: "Clarity" },
  { icon: "🩶", habit: "Grayscale mode on phone during work hours", impact: "Color removal cuts dopamine triggers by ~40%", cat: "Environment" },
  { icon: "💬", habit: "Reply to messages ONLY at 8:00 PM batch time", impact: "Kills reactive distraction from ineffective chats", cat: "Boundaries" },
  { icon: "⛔", habit: "Zero social media in the first 30 min of any session", impact: "Protects attentional priming — the golden window", cat: "Ritual" },
  { icon: "📓", habit: "Write 1 win + 1 lesson at end of every day", impact: "Builds metacognitive awareness — literal IQ expansion habit", cat: "Reflection" },
];

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const HABITS_TRACK = ["Deep Work Block 1","Deep Work Block 2","Phone in drawer","No social before session","Wrote ONE goal","Learning Block done","1 win + 1 lesson logged"];

const TC: Record<string, { bg: string; accent: string }> = {
  ritual: { bg:"#12100E", accent:"#FFB300" },
  work:   { bg:"#0A120A", accent:"#00E676" },
  break:  { bg:"#120A0A", accent:"#FF4500" },
  learn:  { bg:"#0A0A14", accent:"#7C4DFF" },
  end:    { bg:"#0A0A0A", accent:"#444"    },
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
    { id:"techniques", label:"⚡ TECHNIQUES" },
    { id:"schedule",   label:"🕐 SCHEDULE"   },
    { id:"habits",     label:"🔩 HABITS"     },
    { id:"template",   label:"📐 TEMPLATE"   },
    { id:"tracker",    label:"📊 TRACKER"    },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#050505", color:"#E8E8E8", fontFamily:"'Courier New',monospace", overflowX:"hidden" }}>

      {/* HEADER */}
      <div style={{ background:"#090909", borderBottom:"2px solid #FF4500", padding:"20px 16px 16px", position:"sticky", top:0, zIndex:99 }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#FF4500", boxShadow:"0 0 10px #FF4500" }} />
            <span style={{ color:"#FF4500", fontSize:10, letterSpacing:4, fontWeight:"bold" }}>OPERATION: FOCUS OVERRIDE</span>
          </div>
          <h1 style={{ fontSize:"clamp(20px,5vw,34px)", fontWeight:900, fontFamily:"Georgia,serif", margin:0, color:"#fff", lineHeight:1.1 }}>
            7-DAY PRODUCTIVITY <span style={{ color:"#FF4500" }}>WAR SYSTEM</span>
          </h1>
          <p style={{ margin:"4px 0 0", color:"#555", fontSize:10, letterSpacing:2 }}>DISTRACTION ELIMINATION · DEEP WORK ARCHITECTURE · IQ EXPANSION</p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background:"#0A0A0A", borderBottom:"1px solid #1a1a1a", overflowX:"auto", whiteSpace:"nowrap" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background:"none", border:"none",
              borderBottom: tab===t.id ? "2px solid #FF4500" : "2px solid transparent",
              color: tab===t.id ? "#FF4500" : "#555",
              padding:"12px 12px", cursor:"pointer",
              fontSize:10, fontFamily:"'Courier New',monospace", letterSpacing:2, fontWeight:"bold"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"20px 16px 60px" }}>

        {/* TECHNIQUES */}
        {tab==="techniques" && (
          <div>
            <p style={{ color:"#888", fontSize:12, lineHeight:1.7, marginBottom:18 }}>
              At 10% energy you need techniques that work <em>with</em> your biology. Ranked by effectiveness for low-baseline, high-distraction situations. <strong style={{color:"#FF4500"}}>Tap each card to expand.</strong>
            </p>
            {techniques.map(t => (
              <div key={t.rank} onClick={() => setExp(exp===t.rank ? null : t.rank)} style={{
                border:`1px solid ${exp===t.rank ? t.color : "#1e1e1e"}`,
                borderLeft:`4px solid ${t.color}`, background: exp===t.rank ? "#0C0C0C" : "#080808",
                marginBottom:8, padding:"14px 16px", cursor:"pointer", borderRadius:2, transition:"border-color 0.2s"
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:t.color+"1a", border:`2px solid ${t.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:t.color, flexShrink:0 }}>#{t.rank}</div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <div style={{ fontWeight:"bold", fontSize:13, color:"#fff" }}>{t.name}</div>
                    <div style={{ color:t.color, fontSize:10, letterSpacing:2 }}>{t.tagline.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:t.color, fontSize:20, fontWeight:900 }}>{t.effectiveness}%</div>
                    <div style={{ width:70, height:3, background:"#1a1a1a", borderRadius:2, marginTop:3, overflow:"hidden" }}>
                      <div style={{ width:`${t.effectiveness}%`, height:"100%", background:t.color }} />
                    </div>
                  </div>
                </div>
                {exp===t.rank && (
                  <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${t.color}22` }}>
                    <p style={{ color:"#ccc", fontSize:12, lineHeight:1.7, margin:"0 0 10px" }}>{t.description}</p>
                    <div style={{ background:"#111", border:`1px solid ${t.color}33`, padding:"10px 12px", borderRadius:2, marginBottom:8 }}>
                      <div style={{ color:t.color, fontSize:9, letterSpacing:2, marginBottom:5 }}>⚙ HOW TO DEPLOY</div>
                      <p style={{ color:"#ddd", margin:0, fontSize:11, lineHeight:1.6 }}>{t.howTo}</p>
                    </div>
                    <div style={{ background:"#08080F", border:"1px solid #7C4DFF33", padding:"8px 12px", borderRadius:2 }}>
                      <span style={{ color:"#7C4DFF", fontSize:9, letterSpacing:2 }}>🧠 SCIENCE: </span>
                      <span style={{ color:"#999", fontSize:11 }}>{t.scienceBit}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE */}
        {tab==="schedule" && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
              {[["weekday","⚡ WEEKDAY 5PM–10PM"],["weekend","🌅 WEEKEND 6AM–12PM"]].map(([k,l]) => (
                <button key={k} onClick={() => setSched(k)} style={{
                  background: sched===k ? "#FF4500" : "#0F0F0F",
                  color: sched===k ? "#fff" : "#555",
                  border:`1px solid ${sched===k ? "#FF4500" : "#2a2a2a"}`,
                  padding:"7px 14px", cursor:"pointer", borderRadius:2,
                  fontFamily:"'Courier New',monospace", fontSize:10, letterSpacing:2, fontWeight:"bold"
                }}>{l}</button>
              ))}
            </div>
            {(sched==="weekday" ? weekdayBlocks : weekendBlocks).map((b,i) => {
              const c = TC[b.type];
              return (
                <div key={i} style={{ display:"flex", marginBottom:4, borderRadius:2, overflow:"hidden", border:`1px solid ${c.accent}22` }}>
                  <div style={{ background:c.bg, borderRight:`3px solid ${c.accent}`, padding:"12px 12px", minWidth:80, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"flex-end" }}>
                    <div style={{ color:c.accent, fontSize:11, fontWeight:"bold" }}>{b.time}</div>
                    {b.dur>0 && <div style={{ color:"#3a3a3a", fontSize:9 }}>{b.dur}m</div>}
                  </div>
                  <div style={{ background:"#090909", padding:"12px 14px", flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ color:"#fff", fontWeight:"bold", fontSize:12 }}>{b.label}</span>
                      <span style={{ background:c.accent+"18", color:c.accent, fontSize:8, letterSpacing:2, padding:"2px 6px", borderRadius:1 }}>{b.type.toUpperCase()}</span>
                    </div>
                    <div style={{ color:"#777", fontSize:11, marginTop:3 }}>{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* HABITS */}
        {tab==="habits" && (
          <div>
            <div style={{ color:"#666", fontSize:10, letterSpacing:3, marginBottom:14 }}>YOUR 7 ANTI-DISTRACTION FIRMWARE UPDATES</div>
            {habits.map((h,i) => (
              <div key={i} style={{ display:"flex", gap:12, background:"#080808", border:"1px solid #161616", borderLeft:"4px solid #FF4500", padding:"14px", marginBottom:8, borderRadius:2, alignItems:"flex-start" }}>
                <div style={{ fontSize:24, lineHeight:1, minWidth:32 }}>{h.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:4 }}>
                    <span style={{ color:"#444", fontSize:10 }}>#{i+1}</span>
                    <span style={{ color:"#fff", fontWeight:"bold", fontSize:13 }}>{h.habit}</span>
                    <span style={{ background:"#FF450010", color:"#FF4500", fontSize:8, letterSpacing:2, padding:"2px 6px", borderRadius:1 }}>{h.cat.toUpperCase()}</span>
                  </div>
                  <div style={{ color:"#00E676", fontSize:11 }}>↑ {h.impact}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TEMPLATE */}
        {tab==="template" && (
          <div>
            <div style={{ color:"#666", fontSize:10, letterSpacing:3, marginBottom:14 }}>DAILY TIME-BLOCK TEMPLATE — USE THIS EVERY SESSION</div>
            <div style={{ background:"#090909", border:"1px solid #2a2a2a", padding:"20px", borderRadius:2 }}>
              <div style={{ borderBottom:"2px solid #FF4500", paddingBottom:10, marginBottom:14 }}>
                <div style={{ color:"#FF4500", fontSize:10, letterSpacing:4, marginBottom:8 }}>📋 DAILY MISSION BRIEF</div>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  {["DATE","TODAY'S ONE GOAL"].map(l => (
                    <div key={l} style={{ flex:1, minWidth:150 }}>
                      <div style={{ color:"#444", fontSize:9 }}>{l}</div>
                      <div style={{ borderBottom:"1px solid #2a2a2a", height:22, marginTop:4 }} />
                    </div>
                  ))}
                </div>
              </div>
              {[["🟢 DEEP WORK BLOCK 1",["START TIME","END TIME","TASK","DONE?"]],["🟢 DEEP WORK BLOCK 2",["START TIME","END TIME","TASK","DONE?"]],["🟣 LEARNING BLOCK",["START TIME","END TIME","TOPIC","DONE?"]]].map(([title,fields]) => (
                <div key={title} style={{ border:"1px solid #1e1e1e", marginBottom:10, padding:"10px 12px", borderRadius:2 }}>
                  <div style={{ color:"#FF4500", fontSize:9, letterSpacing:3, marginBottom:8 }}>{title}</div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    {fields.map(f => (
                      <div key={f} style={{ flex:1, minWidth:80 }}>
                        <div style={{ color:"#444", fontSize:9 }}>{f}</div>
                        <div style={{ borderBottom:"1px solid #1e1e1e", height:18, marginTop:3 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ border:"1px solid #1e1e1e", padding:"10px 12px", borderRadius:2, marginBottom:10 }}>
                <div style={{ color:"#FFB300", fontSize:9, letterSpacing:3, marginBottom:8 }}>⚠ DISTRACTION LOG — write the urge here instead of acting on it</div>
                {[1,2,3].map(n => (
                  <div key={n} style={{ display:"flex", gap:10, marginBottom:6, alignItems:"center" }}>
                    <span style={{ color:"#2a2a2a" }}>{n}.</span>
                    <div style={{ flex:1, borderBottom:"1px solid #1a1a1a", height:16 }} />
                  </div>
                ))}
              </div>
              <div style={{ border:"1px solid #1e1e1e", padding:"10px 12px", borderRadius:2 }}>
                <div style={{ color:"#7C4DFF", fontSize:9, letterSpacing:3, marginBottom:8 }}>📓 END-OF-DAY DEBRIEF</div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {["1 WIN TODAY","1 LESSON LEARNED","TOMORROW'S GOAL"].map(f => (
                    <div key={f} style={{ flex:1, minWidth:140 }}>
                      <div style={{ color:"#444", fontSize:9 }}>{f}</div>
                      <div style={{ borderBottom:"1px solid #1e1e1e", height:18, marginTop:4 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRACKER */}
        {tab==="tracker" && (
          <div>
            <div style={{ color:"#666", fontSize:10, letterSpacing:3, marginBottom:14 }}>WEEKLY TRACKER — TAP CHECKBOXES TO LOG YOUR PROGRESS</div>
            <div style={{ display:"flex", gap:5, marginBottom:18, overflowX:"auto", paddingBottom:4 }}>
              {DAYS.map(d => {
                const s = score(d);
                const c = s>=80 ? "#00E676" : s>=50 ? "#FFB300" : s>0 ? "#FF4500" : "#2a2a2a";
                return (
                  <div key={d} style={{ flex:1, minWidth:56, background:"#090909", border:`1px solid ${c}`, padding:"8px 4px", textAlign:"center", borderRadius:2 }}>
                    <div style={{ color:"#555", fontSize:9, letterSpacing:1 }}>{d}</div>
                    <div style={{ color:c, fontSize:18, fontWeight:900 }}>{s}%</div>
                    <div style={{ fontSize:10 }}>{s>=80?"🔥":s>=50?"📈":s>0?"⚠️":"—"}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
                <thead>
                  <tr>
                    <th style={{ color:"#444", fontSize:9, letterSpacing:1, padding:"7px 8px", textAlign:"left", borderBottom:"1px solid #1a1a1a" }}>HABIT</th>
                    {DAYS.map(d => <th key={d} style={{ color:"#FF4500", fontSize:9, padding:"7px 6px", textAlign:"center", borderBottom:"1px solid #1a1a1a" }}>{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {HABITS_TRACK.map((item,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #111" }}>
                      <td style={{ color:"#bbb", fontSize:11, padding:"8px 8px" }}>{item}</td>
                      {DAYS.map(d => (
                        <td key={d} style={{ textAlign:"center", padding:"8px 6px" }}>
                          <div onClick={() => toggle(d,item)} style={{
                            width:20, height:20, margin:"0 auto",
                            border:`2px solid ${checks[d][item] ? "#00E676" : "#2a2a2a"}`,
                            background: checks[d][item] ? "#00E67620" : "transparent",
                            borderRadius:3, cursor:"pointer",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            color:"#00E676", fontSize:12
                          }}>{checks[d][item] ? "✓" : ""}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:14, padding:"10px 12px", background:"#090909", border:"1px solid #1a1a1a", borderRadius:2, display:"flex", gap:16, flexWrap:"wrap" }}>
              {[["🔥 80–100%","Operator Mode","#00E676"],["📈 50–79%","Progressing","#FFB300"],["⚠ 1–49%","Needs Work","#FF4500"],["— 0%","Not Started","#444"]].map(([r,l,c]) => (
                <div key={r} style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ color:c, fontSize:11, fontWeight:"bold" }}>{r}</span>
                  <span style={{ color:"#444", fontSize:10 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, createContext, useContext, ReactNode, FormEvent } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  doc, setDoc, getDoc, collection, onSnapshot, addDoc, serverTimestamp,
  handleFirestoreError, OperationType
} from "./firebase";
import { User } from "firebase/auth";

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
  ritual: { color: "#fff", bg: "#1a1a1a" },
  work:   { color: "#000", bg: "#fff" },
  break:  { color: "#888", bg: "#111" },
  learn:  { color: "#fff", bg: "#222" },
  end:    { color: "#444", bg: "#000" },
};

// --- AUTH CONTEXT ---
const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Ensure user document exists
        const userRef = doc(db, "users", u.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              createdAt: serverTimestamp(),
              role: 'user'
            });
          }
        } catch (error) {
          console.error("Error setting up user profile:", error);
        }
      }
      setUser(u);
      setLoading(false);
    });
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

// --- ERROR BOUNDARY ---
function ErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      try {
        const parsed = JSON.parse(e.message);
        if (parsed.error) setError(parsed.error);
      } catch {
        setError(e.message);
      }
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: "#000", color: "#fff", height: "100vh" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Something went wrong</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", background: "#fff", color: "#000", border: "none", borderRadius: "24px" }}>Reload</button>
      </div>
    );
  }
  return <>{children}</>;
}

// --- LOGIN/SIGNUP COMPONENT ---
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "320px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "8px", textAlign: "center" }}>Focus Override</h1>
        <p style={{ color: "#444", marginBottom: "40px", textAlign: "center", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Minimalist Productivity System</p>
        
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "14px 20px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", color: "#fff", outline: "none" }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "14px 20px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", color: "#fff", outline: "none" }}
          />
          {error && <p style={{ color: "#ff4444", fontSize: "12px", margin: "4px 0" }}>{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: "14px", background: "#fff", color: "#000", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", marginTop: "8px" }}
          >
            {loading ? "..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        <p style={{ marginTop: "32px", textAlign: "center", fontSize: "13px", color: "#666" }}>
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: "none", border: "none", color: "#fff", fontWeight: "600", cursor: "pointer", padding: 0 }}
          >
            {isLogin ? "Create account" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function FocusApp() {
  const { user, loading } = useContext(AuthContext);
  const [tab, setTab] = useState("techniques");
  const [sched, setSched] = useState("weekday");
  const [exp, setExp] = useState<number | null>(null);
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>(() => {
    const c: Record<string, Record<string, boolean>> = {};
    DAYS.forEach(d => { c[d] = {}; HABITS_TRACK.forEach(h => { c[d][h] = false; }); });
    return c;
  });

  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [totalTime, setTotalTime] = useState(90 * 60);
  const [focusGoal, setFocusGoal] = useState("");

  // Chat State
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I am your Focus Coach. Need a custom recommendation or help with a block?" }
  ]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync Habits from Firestore
  useEffect(() => {
    if (!user) return;
    const habitsRef = collection(db, "users", user.uid, "habits");
    return onSnapshot(habitsRef, (snapshot) => {
      const newChecks = { ...checks };
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (newChecks[data.day]) {
          newChecks[data.day][data.habit] = data.completed;
        }
      });
      setChecks({ ...newChecks });
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`));
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSessionComplete = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "sessions"), {
        uid: user.uid,
        goal: focusGoal,
        duration: totalTime,
        completedAt: serverTimestamp()
      });
      alert("Focus session complete and saved.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/sessions`);
    }
  };

  const toggle = async (d: string, h: string) => {
    if (!user) return;
    const completed = !checks[d][h];
    const habitId = `${d}_${h.replace(/\s+/g, '_')}`;
    try {
      await setDoc(doc(db, "users", user.uid, "habits", habitId), {
        uid: user.uid,
        day: d,
        habit: h,
        completed,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const score = (d: string) => Math.round(Object.values(checks[d]).filter(Boolean).length / HABITS_TRACK.length * 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleChat = async () => {
    if (!input.trim() || loadingChat) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoadingChat(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "You are a minimalist productivity coach. Give short, punchy, actionable advice. Focus on deep work, habit building, and distraction elimination. Keep responses under 3 sentences. Use a direct, slightly stoic tone.",
        },
      });
      setMessages(prev => [...prev, { role: "ai", text: response.text || "I'm offline. Focus on the work." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "Error connecting to coach. Trust the system." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const TABS = [
    { id: "techniques", label: "TECH" },
    { id: "schedule",   label: "TIME" },
    { id: "habits",     label: "HABIT" },
    { id: "tracker",    label: "TRACK" },
    { id: "coach",      label: "COACH" },
  ];

  if (loading) return <div style={{ height: "100vh", background: "#000" }} />;

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#000", 
      color: "#fff", 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      padding: "env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0",
      display: "flex",
      flexDirection: "column"
    }}>
      
      {/* HEADER */}
      <header style={{ padding: "40px 20px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px", margin: 0 }}>Focus Override</h1>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Minimalist Productivity System</p>
        </div>
        <button onClick={() => signOut(auth)} style={{ background: "none", border: "none", color: "#444", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Logout</button>
      </header>

      {/* TABS */}
      <nav style={{ display: "flex", borderBottom: "1px solid #1a1a1a", background: "#000", position: "sticky", top: 0, zIndex: 10 }}>
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
              color: tab === t.id ? "#fff" : "#444",
              borderBottom: tab === t.id ? "2px solid #fff" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{ flex: 1, padding: "24px 20px", overflowY: "auto" }}>
        
        {tab === "techniques" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {techniques.map(t => (
              <div 
                key={t.rank} 
                onClick={() => setExp(exp === t.rank ? null : t.rank)}
                style={{
                  padding: "20px",
                  border: "1px solid #1a1a1a",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: exp === t.rank ? "#0a0a0a" : "#000"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>{t.name}</h3>
                    <p style={{ fontSize: "12px", color: "#666", margin: "2px 0 0" }}>{t.tagline}</p>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>{t.effectiveness}%</span>
                </div>
                {exp === t.rank && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1a1a1a" }}>
                    <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#aaa" }}>{t.description}</p>
                    <div style={{ marginTop: "12px", padding: "12px", background: "#fff", color: "#000", borderRadius: "4px" }}>
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
            {/* FOCUS GOAL */}
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "10px", fontWeight: "700", color: "#444", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Current Objective</p>
              <input 
                value={focusGoal}
                onChange={(e) => setFocusGoal(e.target.value)}
                placeholder="What is the ONE thing?"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  border: "none",
                  borderBottom: "2px solid #1a1a1a",
                  outline: "none",
                  background: "transparent",
                  color: "#fff",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#fff"}
                onBlur={(e) => e.target.style.borderColor = "#1a1a1a"}
              />
            </div>

            {/* TIMER SECTION */}
            <div style={{ marginBottom: "32px", padding: "24px", border: "1px solid #fff", borderRadius: "12px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              {/* Progress Bar Background */}
              <div style={{ position: "absolute", bottom: 0, left: 0, height: "4px", background: "#1a1a1a", width: "100%" }} />
              {/* Progress Bar Fill */}
              <div style={{ position: "absolute", bottom: 0, left: 0, height: "4px", background: "#fff", width: `${((totalTime - timeLeft) / totalTime) * 100}%`, transition: "width 1s linear" }} />

              <div style={{ fontSize: "48px", fontWeight: "800", fontFamily: "monospace", letterSpacing: "-2px", marginBottom: "12px" }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  style={{ padding: "10px 24px", background: "#fff", color: "#000", border: "none", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}
                >
                  {timerActive ? "PAUSE" : "START BLOCK"}
                </button>
                <button 
                  onClick={() => { setTimerActive(false); setTimeLeft(90 * 60); setTotalTime(90 * 60); }}
                  style={{ padding: "10px 24px", background: "#000", color: "#fff", border: "1px solid #1a1a1a", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}
                >
                  RESET
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              {["weekday", "weekend"].map(k => (
                <button 
                  key={k} 
                  onClick={() => setSched(k)}
                  style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #1a1a1a", background: sched === k ? "#fff" : "#000", color: sched === k ? "#000" : "#fff", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}
                >
                  {k}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(sched === "weekday" ? weekdayBlocks : weekendBlocks).map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px", border: "1px solid #1a1a1a", borderRadius: "8px" }}>
                  <div style={{ width: "60px", fontSize: "13px", fontWeight: "700" }}>{b.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{b.label}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{b.desc}</div>
                  </div>
                  <div style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "4px", background: TC[b.type].bg, color: TC[b.type].color, fontWeight: "700", textTransform: "uppercase" }}>
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
              <div key={i} style={{ display: "flex", gap: "16px", padding: "20px", border: "1px solid #1a1a1a", borderRadius: "8px" }}>
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
                  <div key={d} style={{ flex: 1, minWidth: "50px", textAlign: "center", padding: "12px 0", border: "1px solid #1a1a1a", borderRadius: "8px" }}>
                    <div style={{ fontSize: "10px", color: "#444", marginBottom: "4px" }}>{d}</div>
                    <div style={{ fontSize: "14px", fontWeight: "700" }}>{s}%</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1a1a1a", border: "1px solid #1a1a1a", borderRadius: "8px", overflow: "hidden" }}>
              {HABITS_TRACK.map((h, i) => (
                <div key={i} style={{ background: "#000", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#aaa" }}>{h}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {DAYS.map(d => (
                      <div 
                        key={d} 
                        onClick={() => toggle(d, h)}
                        style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid #1a1a1a", background: checks[d][h] ? "#fff" : "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: "12px" }}
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

        {tab === "coach" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", padding: "12px 16px", borderRadius: "12px", background: m.role === "user" ? "#fff" : "#1a1a1a", color: m.role === "user" ? "#000" : "#fff", fontSize: "14px", lineHeight: "1.5" }}>
                  {m.text}
                </div>
              ))}
              {loadingChat && <div style={{ fontSize: "12px", color: "#444" }}>Coach is thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: "8px", position: "sticky", bottom: 0, background: "#000", padding: "12px 0" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChat()} placeholder="Ask for advice..." style={{ flex: 1, padding: "12px 16px", border: "1px solid #1a1a1a", borderRadius: "24px", fontSize: "14px", outline: "none", background: "#0a0a0a", color: "#fff" }} />
              <button onClick={handleChat} style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#fff", color: "#000", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{ padding: "20px", textAlign: "center", color: "#222", fontSize: "11px", borderTop: "1px solid #1a1a1a" }}>
        <p>© 2026 Focus Override · Minimalist PWA</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <FocusApp />
      </ErrorBoundary>
    </AuthProvider>
  );
}

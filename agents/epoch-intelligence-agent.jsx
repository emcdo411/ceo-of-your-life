import { useState, useEffect, useRef } from "react";

const PERIWINKLE = "#8E9FD5";

const CLASS_CONFIG = {
  "INDIVIDUAL":  { label: "Individual",  color: "#8E9FD5", bg: "rgba(142,159,213,0.10)", border: "rgba(142,159,213,0.35)" },
  "ENTERPRISE":  { label: "Enterprise",  color: "#1D9E75", bg: "rgba(29,158,117,0.10)",  border: "rgba(29,158,117,0.35)" },
  "TECHNICAL":   { label: "Technical",   color: "#BA7517", bg: "rgba(186,117,23,0.10)",  border: "rgba(186,117,23,0.35)" },
  "COMPOUND-A":  { label: "Compound A",  color: "#7F77DD", bg: "rgba(127,119,221,0.10)", border: "rgba(127,119,221,0.35)" },
  "COMPOUND-B":  { label: "Compound B",  color: "#D85A30", bg: "rgba(216,90,48,0.10)",   border: "rgba(216,90,48,0.35)" },
  "COMPOUND-C":  { label: "Compound C",  color: "#185FA5", bg: "rgba(24,95,165,0.10)",   border: "rgba(24,95,165,0.35)" },
};

const VERDICT_CONFIG = {
  PASS:        { color: "#1D9E75", bg: "rgba(29,158,117,0.08)",  border: "rgba(29,158,117,0.30)" },
  CONDITIONAL: { color: "#BA7517", bg: "rgba(186,117,23,0.08)",  border: "rgba(186,117,23,0.30)" },
  FAIL:        { color: "#A32D2D", bg: "rgba(163,45,45,0.08)",   border: "rgba(163,45,45,0.30)" },
};

const PROCESSING_STEPS = [
  "Firing PDCG gate...",
  "Routing to framework...",
  "Running HCDG veto...",
  "EBT passive audit...",
];

const SYSTEM_PROMPT = `You are the Epoch Intelligence Agent (EIA) v1.0.0 — a routed diagnostic engine built on three proprietary frameworks by Erwin Maurice McDonald (Epoch Frameworks LLC). You are NOT a generalist assistant. You are a classification-first, gate-verified intelligence system.

THREE FRAMEWORKS:
1. CEO OF YOUR LIFE (COYL) — individual professional transformation. Five layers: Identity Shift (produce identity rewrite: I [verb] [for whom] [producing what outcome]), Market Awareness (score BEHIND/AT/AHEAD, three positioning opportunities), Asset Building (score ZERO/PROTO/ASSET-BUILDING), AI Fluency (score CAPPED/EXPOSED/LEVERAGED), Pipeline Thinking (score EMPTY/REACTIVE/PERMANENT — flag PIPELINE URGENCY DETECTED if between roles with empty pipeline).

2. AI ADOPTION ARCHITECT (AAA) — organizational AI transformation. L0 BI Architecture, L0B MLOps Audit, L0C CGM Governance with Shadow Component (Competence shadow: expert who champions AI but fears exposure; Authority shadow: manager who blocks via data quality concerns; Legacy shadow: builder who calls it governance risk), L1 Human Adoption with Enantiodromia Flag (if adoption pressure rises proportionally with resistance, strategic withdrawal is the prescription not more pressure), L2 Intelligence Economy, L3 GTM Intelligence. Jungian Depth Layer JDL v2.7: scan what the org refuses to see; check for enantiodromia; map projections onto AI or vendors.

3. 10x SENIOR BSA (BSA) — practitioner translation. JDE/SAP/JIRA gap maps, agent specification documents, TRAIGA readiness scoring, LinkedIn artifact production.

PDCG CLASSIFICATION: INDIVIDUAL (COYL) | ENTERPRISE (AAA) | TECHNICAL (BSA) | COMPOUND-A (BSA professional positioning for AI market: COYL L1+L2+L4 plus BSA Gap Map) | COMPOUND-B (enterprise AI with individual identity stakes: AAA L0C Shadow plus COYL L5) | COMPOUND-C (agent build request: BSA Agent Spec plus AAA L0B MLOps)

HCDG: Q1 Does AI belong here PASS/CONDITIONAL/FAIL. Q2 Named human owner for every consequential decision. Q3 Evidence independent of system being evaluated.

OAL: Assign a specific named human owner to every consequential recommendation.

EBT PASSIVE AUDIT: Watch for Objectivity Laundering P3, ASHEN H/E encoding as objective criteria, Silent Distortion Window. Output CLEAN if none detected.

RESPOND ONLY in this XML structure, absolutely no text outside the tags:
<classification>INDIVIDUAL|ENTERPRISE|TECHNICAL|COMPOUND-A|COMPOUND-B|COMPOUND-C</classification>
<primary_framework>framework name</primary_framework>
<rationale>one sentence</rationale>
<diagnostic_output>full thorough diagnostic, plain text with line breaks only, no asterisks or markdown symbols</diagnostic_output>
<hcdg_verdict>PASS|CONDITIONAL|FAIL</hcdg_verdict>
<hcdg_notes>brief explanation</hcdg_notes>
<oal_assignments>specific named owner assignments</oal_assignments>
<ebt_flags>flags if triggered or CLEAN</ebt_flags>
<bottom_line>2-3 sentences, plain language, decision-useful</bottom_line>
<immediate_next_action>single most important action today with specific owner named</immediate_next_action>
<calendar_suggestion>professional follow-up meeting title and timeframe, or NONE</calendar_suggestion>`;

function parseTag(text, tag) {
  const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : null;
}

async function runAPI(userInput) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userInput }],
    }),
  });
  const d = await res.json();
  const text = (d.content || []).map((b) => b.text || "").join("");
  const truncated = d.stop_reason === "max_tokens";
  const parsed = {
    classification: parseTag(text, "classification"),
    primaryFramework: parseTag(text, "primary_framework"),
    rationale: parseTag(text, "rationale"),
    diagnosticOutput: parseTag(text, "diagnostic_output"),
    hcdgVerdict: parseTag(text, "hcdg_verdict"),
    hcdgNotes: parseTag(text, "hcdg_notes"),
    oalAssignments: parseTag(text, "oal_assignments"),
    ebtFlags: parseTag(text, "ebt_flags"),
    bottomLine: parseTag(text, "bottom_line"),
    immediateNextAction: parseTag(text, "immediate_next_action"),
    calendarSuggestion: parseTag(text, "calendar_suggestion"),
  };
  const missingCritical = !parsed.diagnosticOutput || !parsed.bottomLine || !parsed.classification;
  return { ...parsed, truncated: truncated || missingCritical };
}

async function runScheduleAPI(result) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      mcp_servers: [{ type: "url", url: "https://calendarmcp.googleapis.com/mcp/v1", name: "google-calendar" }],
      messages: [{
        role: "user",
        content: `Create a Google Calendar event for an Epoch Frameworks LLC consulting follow-up. Suggestion: "${result.calendarSuggestion}". Context: "${result.bottomLine}". Next action: "${result.immediateNextAction}". Schedule tomorrow at 10:00 AM Central Time, 60 minutes. Use a professional title for a fractional CXO consulting engagement.`,
      }],
    }),
  });
  const d = await res.json();
  return (d.content || []).map((b) => b.text || "").join("") || "Calendar event created.";
}

function generateReport(result) {
  const lines = [
    "══════════════════════════════════════════════════════",
    "EPOCH INTELLIGENCE AGENT — DIAGNOSTIC REPORT",
    "Epoch Frameworks LLC | McDonald, E.M. (2026)",
    "Generated: " + new Date().toLocaleString(),
    "══════════════════════════════════════════════════════", "",
    "PDCG CLASSIFICATION: " + result.classification,
    "Primary Framework: " + result.primaryFramework,
    "Rationale: " + result.rationale, "",
    "──────────────────────────────────────────────────────",
    "DIAGNOSTIC OUTPUT",
    "──────────────────────────────────────────────────────",
    result.diagnosticOutput || "", "",
    "──────────────────────────────────────────────────────",
    "HCDG VERDICT: " + result.hcdgVerdict,
    result.hcdgNotes || "", "",
    "OAL ASSIGNMENTS:", result.oalAssignments || "", "",
    "EBT PASSIVE AUDIT:", result.ebtFlags || "",
    "──────────────────────────────────────────────────────", "",
    "BOTTOM LINE", result.bottomLine || "", "",
    "IMMEDIATE NEXT ACTION: " + (result.immediateNextAction || ""), "",
    "══════════════════════════════════════════════════════",
    "Epoch Intelligence Agent · v1.0.0",
    "10x Senior BSA v1.1 | AI Adoption Architect v6.5 | CEO of Your Life v1.0.0",
    "EBT v2.7 passive audit | JDL Jungian Depth Layer active",
    "All rights reserved. Proprietary — Epoch Frameworks LLC",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "EIA-Report-" + new Date().toISOString().slice(0, 10) + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label, color, bg, border }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500,
      letterSpacing: "0.07em",
      background: bg || `${color}18`,
      border: `0.5px solid ${border || color + "50"}`,
      color,
    }}>
      {label}
    </span>
  );
}

function Mono({ children, style }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 10,
      letterSpacing: "0.08em", color: "var(--color-text-tertiary)",
      ...style,
    }}>
      {children}
    </span>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12, padding: "16px 18px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function ActionButton({ label, onClick, primary, disabled, icon }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "10px 18px", borderRadius: 8,
        fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 500,
        letterSpacing: "0.06em", textTransform: "uppercase",
        border: primary ? "none" : "0.5px solid var(--color-border-secondary)",
        background: primary ? PERIWINKLE : "var(--color-background-primary)",
        color: primary ? "#fff" : disabled ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
      }}
    >
      {icon && <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />}
      {label}
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ mode, onModeChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 0 22px",
      borderBottom: "0.5px solid var(--color-border-tertiary)",
      marginBottom: 26,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: PERIWINKLE,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="ti ti-hexagon" aria-hidden="true" style={{ fontSize: 18, color: "#fff" }} />
        </div>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 500,
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
          }}>
            EPOCH INTELLIGENCE AGENT
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
            v1.0.0 · Epoch Frameworks LLC · McDonald (2026)
          </div>
        </div>
      </div>

      <div style={{
        display: "flex",
        background: "var(--color-background-secondary)",
        borderRadius: 6, padding: 2,
        border: "0.5px solid var(--color-border-tertiary)",
      }}>
        {["practitioner", "client"].map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              padding: "5px 14px", borderRadius: 4,
              fontSize: 11, fontWeight: 500,
              fontFamily: "var(--font-mono)", textTransform: "uppercase",
              letterSpacing: "0.06em", border: "none",
              background: mode === m ? PERIWINKLE : "transparent",
              color: mode === m ? "#fff" : "var(--color-text-secondary)",
              cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Intake Phase ─────────────────────────────────────────────────────────────

function IntakePhase({ input, onChange, onSubmit, error }) {
  const taRef = useRef(null);

  useEffect(() => { taRef.current?.focus(); }, []);

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();
  }

  return (
    <div style={{ animation: "eiaFade 0.35s ease forwards" }}>
      <div style={{ marginBottom: 18 }}>
        <Mono style={{ display: "block", marginBottom: 6 }}>STEP 0 — INTAKE</Mono>
        <p style={{
          fontSize: 15, color: "var(--color-text-secondary)",
          lineHeight: 1.65, margin: 0,
        }}>
          Describe the engagement context. Who is this about, what is happening, what triggered the conversation? The PDCG gate classifies before any framework executes.
        </p>
      </div>

      <textarea
        ref={taRef}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the individual, organization, or situation. Include domain, current state, and what triggered this conversation..."
        style={{
          width: "100%", minHeight: 140, padding: 14,
          fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.7,
          resize: "vertical", boxSizing: "border-box",
          borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
          background: "var(--color-background-primary)",
          color: "var(--color-text-primary)",
        }}
      />

      {error && (
        <div style={{
          marginTop: 10, padding: "10px 14px",
          background: "var(--color-background-danger)",
          border: "0.5px solid var(--color-border-danger)",
          borderRadius: 8, fontSize: 12,
          color: "var(--color-text-danger)",
          fontFamily: "var(--font-mono)",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <Mono>⌘↵ to run</Mono>
        <ActionButton
          label="Run classification"
          onClick={onSubmit}
          primary
          disabled={!input.trim()}
          icon="ti-arrow-right"
        />
      </div>
    </div>
  );
}

// ─── Processing Phase ─────────────────────────────────────────────────────────

function ProcessingPhase() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{
        fontSize: 11, fontFamily: "var(--font-mono)",
        color: PERIWINKLE, letterSpacing: "0.1em", marginBottom: 22,
        animation: "eiaPulse 1.8s ease-in-out infinite",
      }}>
        ◆ PDCG CLASSIFICATION GATE ACTIVE
      </div>
      {PROCESSING_STEPS.map((msg, i) => (
        <div key={msg} style={{
          fontSize: 11, fontFamily: "var(--font-mono)",
          color: "var(--color-text-tertiary)",
          marginBottom: 5, opacity: 0.45 + i * 0.15,
        }}>
          {msg}
        </div>
      ))}
    </div>
  );
}

// ─── Results Phase ────────────────────────────────────────────────────────────

function ResultsPhase({ result, mode, onReset }) {
  const [scheduling, setScheduling] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState(null);

  const cc = CLASS_CONFIG[result.classification] || {};
  const vc = VERDICT_CONFIG[result.hcdgVerdict] || {};
  const hasCalSuggestion = result.calendarSuggestion && result.calendarSuggestion !== "NONE";
  const isTruncated = result.truncated;

  async function handleSchedule() {
    setScheduling(true);
    try {
      const msg = await runScheduleAPI(result);
      setScheduleMsg(msg);
    } catch {
      setScheduleMsg("Calendar scheduling failed. Please try again.");
    } finally {
      setScheduling(false);
    }
  }

  return (
    <div style={{ animation: "eiaFade 0.35s ease forwards" }}>

      {/* Truncation warning */}
      {isTruncated && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 16px", marginBottom: 16,
          background: "rgba(186,117,23,0.08)",
          border: "0.5px solid rgba(186,117,23,0.35)",
          borderRadius: 8,
        }}>
          <i className="ti ti-alert-triangle" aria-hidden="true" style={{ fontSize: 14, color: "#BA7517", marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 500, color: "#BA7517", marginBottom: 4 }}>
              RESPONSE TRUNCATED
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              One or more output fields are missing. The diagnostic was cut off before completing. Re-run the classification to get a full response.
            </div>
            <button
              onClick={onReset}
              style={{
                marginTop: 8, padding: "5px 12px", borderRadius: 6,
                fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500,
                letterSpacing: "0.06em", textTransform: "uppercase",
                border: "0.5px solid rgba(186,117,23,0.50)",
                background: "transparent", color: "#BA7517",
                cursor: "pointer",
              }}
            >
              Re-run classification
            </button>
          </div>
        </div>
      )}

      {/* Classification row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {cc.color && <Badge label={result.classification} color={cc.color} bg={cc.bg} border={cc.border} />}
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          → {result.primaryFramework}
        </span>
        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
          {result.rationale}
        </span>
      </div>

      {/* Diagnostic output */}
      <Panel style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10, fontFamily: "var(--font-mono)",
          color: PERIWINKLE, letterSpacing: "0.1em", marginBottom: 14,
        }}>
          ◆ DIAGNOSTIC OUTPUT — {(result.primaryFramework || "").toUpperCase()}
        </div>
        <div style={{
          fontSize: 13, lineHeight: 1.85,
          color: "var(--color-text-primary)", whiteSpace: "pre-wrap",
        }}>
          {result.diagnosticOutput}
        </div>
      </Panel>

      {/* Gate layer — practitioner only */}
      {mode === "practitioner" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>

          {/* HCDG verdict card */}
          <div style={{
            background: vc.bg || "var(--color-background-primary)",
            border: `0.5px solid ${vc.border || "var(--color-border-tertiary)"}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <Mono style={{ display: "block", marginBottom: 8 }}>HCDG VERDICT</Mono>
            <div style={{
              fontSize: 20, fontFamily: "var(--font-mono)", fontWeight: 500,
              color: vc.color || "var(--color-text-primary)", marginBottom: 8,
            }}>
              {result.hcdgVerdict}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {result.hcdgNotes}
            </div>
          </div>

          {/* EBT audit card */}
          <Panel>
            <Mono style={{ display: "block", marginBottom: 8 }}>EBT PASSIVE AUDIT</Mono>
            <div style={{
              fontSize: 11, fontFamily: "var(--font-mono)",
              color: result.ebtFlags === "CLEAN" ? "#1D9E75" : "#BA7517",
              lineHeight: 1.6,
            }}>
              {result.ebtFlags}
            </div>
          </Panel>

          {/* OAL assignments — full width */}
          <Panel style={{ gridColumn: "1 / -1" }}>
            <Mono style={{ display: "block", marginBottom: 8 }}>OAL — OWNERSHIP ASSIGNMENTS</Mono>
            <div style={{
              fontSize: 12, color: "var(--color-text-secondary)",
              lineHeight: 1.7, whiteSpace: "pre-wrap",
              fontFamily: "var(--font-mono)",
            }}>
              {result.oalAssignments}
            </div>
          </Panel>
        </div>
      )}

      {/* Bottom line */}
      <div style={{
        background: "rgba(142,159,213,0.12)",
        border: "0.5px solid rgba(142,159,213,0.35)",
        borderRadius: 12, padding: "16px 18px", marginBottom: 10,
      }}>
        <div style={{
          fontSize: 10, fontFamily: "var(--font-mono)",
          color: PERIWINKLE, letterSpacing: "0.1em", marginBottom: 10,
        }}>
          BOTTOM LINE
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.75, color: "var(--color-text-primary)" }}>
          {result.bottomLine}
        </div>
      </div>

      {/* Next action */}
      <div style={{
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 8, padding: "12px 16px", marginBottom: 20,
      }}>
        <Mono style={{ display: "block", marginBottom: 6 }}>IMMEDIATE NEXT ACTION</Mono>
        <div style={{ fontSize: 13, fontWeight: 500, color: PERIWINKLE }}>
          → {result.immediateNextAction}
        </div>
      </div>

      {/* Schedule result */}
      {scheduleMsg && (
        <div style={{
          padding: "12px 16px",
          background: "var(--color-background-success)",
          border: "0.5px solid var(--color-border-success)",
          borderRadius: 8, marginBottom: 14,
          fontSize: 12, color: "var(--color-text-success)",
          fontFamily: "var(--font-mono)", lineHeight: 1.6,
        }}>
          {scheduleMsg}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ActionButton
          label={isTruncated ? "Report unavailable" : "Generate report"}
          onClick={isTruncated ? undefined : () => generateReport(result)}
          primary
          disabled={isTruncated}
          icon="ti-download"
        />
        {hasCalSuggestion && (
          <ActionButton
            label={scheduling ? "Scheduling..." : "Schedule follow-up"}
            onClick={handleSchedule}
            disabled={scheduling}
            icon="ti-calendar"
          />
        )}
        <ActionButton label="New engagement" onClick={onReset} icon="ti-arrow-left" />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 30, paddingTop: 14,
        borderTop: "0.5px solid var(--color-border-tertiary)",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <Mono>EBT v2.7 · JDL Jungian Depth Layer · TRAIGA overlay active</Mono>
        <Mono>Proprietary — Epoch Frameworks LLC</Mono>
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function EpochIntelligenceAgent() {
  const [mode, setMode] = useState("practitioner");
  const [phase, setPhase] = useState("intake");
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    if (!input.trim()) return;
    setPhase("processing");
    setError(null);
    setResult(null);
    try {
      const r = await runAPI(input);
      setResult(r);
      setPhase("results");
    } catch (e) {
      setError("Classification failed. Check connection and retry.");
      setPhase("intake");
    }
  }

  function handleReset() {
    setPhase("intake");
    setInput("");
    setResult(null);
    setError(null);
  }

  return (
    <>
      <style>{`
        @keyframes eiaFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes eiaPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 0 40px", fontFamily: "var(--font-sans)" }}>
        <Header mode={mode} onModeChange={setMode} />

        {phase === "intake" && (
          <IntakePhase
            input={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            error={error}
          />
        )}

        {phase === "processing" && <ProcessingPhase />}

        {phase === "results" && result && (
          <ResultsPhase result={result} mode={mode} onReset={handleReset} />
        )}
      </div>
    </>
  );
}

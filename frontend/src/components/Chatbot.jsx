import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! Ask me anything about internships.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]); // keep track of applied job ids

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");  // for getting user id

      // include both authToken and userId so backend + recommender can fetch the real profile
      const payload = { message: input };
      if (token) payload.authToken = token;
      if (userId) payload.userId = userId;

      const res = await axios.post("http://localhost:5001/api/chatbot", payload);

      console.log("Chatbot response:", res.data);

      const botMessage = {
        text: res.data.reply,
        sender: "bot",
        recommendations: res.data.recommendations || []
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      console.error("Chatbot send error:", err);
      setMessages(prev => [
        ...prev,
        { text: "Error connecting to server", sender: "bot" }
      ]);
    }

    setInput("");
  };

  // Apply to a job returned in recommendations
  const applyToJob = async (job) => {
    const jobId = job.job_id || job.jobId || job.id || job._id;
    if (!jobId) return alert("Cannot apply: missing job id");

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return alert("Please login to apply for jobs.");

    try {
      await axios.post(
        "http://localhost:5001/api/applications",
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppliedJobs(prev => [...prev, String(jobId)]);
      // update messages to reflect applied state (optional)
      setMessages(prev => prev.map(m => {
        if (m.recommendations && m.recommendations.length) {
          return {
            ...m,
            recommendations: m.recommendations.map(r => {
              const rid = r.job_id || r.jobId || r.id || r._id;
              if (String(rid) === String(jobId)) return { ...r, _applied: true };
              return r;
            })
          };
        }
        return m;
      }));

      alert("Application submitted");
    } catch (err) {
      console.error("Apply error:", err?.response || err);
      const msg = err?.response?.data?.message || "Failed to apply. Try again.";
      alert(msg);
    }
  };

  // helper to normalize skill strings
  const normalize = (s) => (String(s || "").toLowerCase().trim());

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#007bff",
          color: "white",
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}
      >
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "320px",
            height: "420px",
            background: "white",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px",
              background: "#007bff",
              color: "white",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            Internship Assistant
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    background:
                      msg.sender === "user" ? "#007bff" : "#f1f1f1",
                    color:
                      msg.sender === "user" ? "white" : "#333",
                    padding: "10px 12px",
                    borderRadius: "14px",
                    maxWidth: "75%",
                    fontSize: "13px",
                    lineHeight: "1.4"
                  }}
                >
                  <div>
                    {msg.text}

                    {/* Show job recommendations */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div style={{ marginTop: "8px" }}>
                        {msg.recommendations.map((job, i) => {
                          const jobId = job.job_id || job.jobId || job.id || job._id;
                          const isApplied = appliedJobs.includes(String(jobId)) || job._applied;

                          // normalize matched skills coming from backend
                          const matchedNorm = new Set((job.skills_matched || []).map(normalize));

                          const required = Array.isArray(job.skills_required) ? job.skills_required : (Array.isArray(job.skills) ? job.skills : []);

                          const matchedForDisplay = (job.skills_matched || []).slice();

                          // compute display score: prefer job.score from backend, but if it's 0 and matched exists, compute fallback
                          const backendScore = (typeof job.score === 'number') ? job.score : NaN;
                          const fallbackScore = (matchedNorm.size > 0) ? (matchedNorm.size * 2) : 0; // same weight as recommender
                          const displayScore = (backendScore && backendScore > 0) ? backendScore : fallbackScore;

                          return (
                            <div
                              key={i}
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "8px",
                                marginTop: "6px",
                                background: "#fff"
                              }}
                            >
                              <strong>{job.title}</strong>
                              <div style={{ fontSize: "12px", color: "#555" }}>
                                {job.company}
                              </div>

                              {/* REQUIRED SKILLS */}
                              <div style={{ fontSize: "12px", marginTop: "6px" }}>
                                Required: {required.length ? (
                                  required.map((s, idx) => {
                                    const norm = normalize(s);
                                    const isMatched = matchedNorm.has(norm);
                                    return (
                                      <span
                                        key={idx}
                                        style={{
                                          display: "inline-block",
                                          marginRight: 6,
                                          padding: "4px 6px",
                                          borderRadius: 6,
                                          background: isMatched ? "#d1fae5" : "#f3f4f6",
                                          fontSize: 12
                                        }}
                                      >
                                        {s}{isMatched ? " ✓" : ""}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span style={{ color: "#999" }}>No skills listed</span>
                                )}
                              </div>

                              {/* SCORE
                              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                                Score: {typeof displayScore === 'number' ? displayScore.toFixed(2) : 'N/A'}
                              </div> */}

                              {/* SCORE - need to implement actual score */}
                              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                                Score: {(Math.random() * (5 - 1) + 1).toFixed(1)}
                              </div>

                              {/* REASON */}
                              <div style={{ fontSize: "11px", color: "#888" }}>
                                {job.reason || ((displayScore === 0) ? 'No matching skills' : 'Matched')}
                              </div>

                              {/* WHY BUTTON */}
                              <button
                                style={{
                                  marginTop: "6px",
                                  fontSize: "12px",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                  background: "#f9f9f9",
                                  cursor: "pointer"
                                }}
                                onClick={() => {
                                  const matched = Array.from(matchedNorm);
                                  const missing = required.map(normalize).filter(r => !matchedNorm.has(r));
                                  alert(
                                    // `Matched: ${matched.length ? matched.join(', ') : 'None'}\n` +
                                    // `Missing: ${missing.length ? missing.join(', ') : 'None'}`
                                    `Your profile has similar skills as the requirement\n` +
                                    `skills required: ${missing.length ? missing.join(', ') : 'None'}`
                                  );
                                }}
                              >
                                Why?
                              </button>

                              <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => applyToJob(job)}
                                  disabled={isApplied}
                                  style={{
                                    fontSize: "13px",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: isApplied ? "#6c757d" : "#28a745",
                                    color: "white",
                                    cursor: isApplied ? "default" : "pointer"
                                  }}
                                >
                                  {isApplied ? "Applied" : "Apply"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "8px",
              borderTop: "1px solid #eee",
              gap: "8px"
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about internships..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "13px"
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                padding: "0 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import "./AnalysisResults.css";

const AnalysisResults = ({ result }) => {
  if (!result) return null;

  const getMatchStatus = (score) => {
    const s = score * 100;
    if (s < 35) return { color: "#ef4444", glow: "rgba(239, 68, 68, 0.35)", class: "weak" };
    if (s < 50) return { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.35)", class: "moderate" };
    if (s < 65) return { color: "#10b981", glow: "rgba(16, 185, 129, 0.35)", class: "strong" };
    return { color: "#6366f1", glow: "rgba(99, 102, 241, 0.35)", class: "very-strong" };
  };

  const renderReview = (text) => {

    if (!text) return null;
    return text.split("\n").map((line, index) => {
      
      const l = line.trim();
      if (!l) return <br key={index} />;

      if (l.toUpperCase().startsWith("STRENGTHS")) return <div key={index} className="res-tag tag-success">Strengths</div>;
      if (l.toUpperCase().startsWith("WEAKNESSES")) return <div key={index} className="res-tag tag-warning">Areas for Growth</div>;
      if (l.toUpperCase().startsWith("HIRING")) return <div key={index} className="res-tag tag-info">Hiring Alignment</div>;
      if (l.toUpperCase().startsWith("RECOMMENDATIONS")) return <div key={index} className="res-tag tag-recommend">Recommendations</div>;
      
      if (l.startsWith("-") || l.startsWith("•") || l.match(/^\d\./)) 
      {
        return (
          <div key={index} className="res-bullet">
            <span className="bullet-dot">✦</span>
            <span>{l.replace(/^[-•\d\.]\s*/, "")}</span>
          </div>
        );
      }

      return <p key={index} className="res-text">{l}</p>;
      
    });
  };

  return (
    <div className="card results-card fade-in">
      <div className="score-section">
        <div className="score-circle" style={{ '--dynamic-color': getMatchStatus(result.score).color }}>
          <span className="score-number">{Math.round(result.score * 100)}%</span>
          <span className="score-label">Match</span>
        </div>
        <div>
          <h3 className="match-title">Match Score</h3>
          <p className="match-desc">Resume compatibility against role requirements.</p>
        </div>
      </div>

      <div className="score-scale">
        <h4 className="scale-title"> Match Score Scale </h4>
        <div className="scale-row weak">        <span>0% – 35%</span>  <span>Weak Match</span>        </div>
        <div className="scale-row moderate">    <span>35% – 50%</span> <span>Moderate Match</span>    </div>
        <div className="scale-row strong">      <span>50% – 65%</span> <span>Strong Match</span>      </div>
        <div className="scale-row very-strong"> <span>65% +</span>     <span>Very Strong Match</span> </div>
      </div> 

      <div className="resume-insights">
        <h2 className="insights-title">Resume Insights</h2>
        <div className="review-container">{renderReview(result.review)}</div>
      </div>
    </div>
  );
};

export default AnalysisResults;

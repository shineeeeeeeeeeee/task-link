import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.svg";
import axios from "axios";


function RoleCard() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state?.formData || {};

  function selectRole(r) { setRole(r); }

  async function onContinue() {
    if (!role) return;
    const updatedData = { ...signupData, role };
    console.log("Selected Role:", updatedData);

    try {
      // Send role update to backend
      await axios.post("http://localhost:5001/api/auth/role", {
        email: signupData.email,
        role: role,
      });

      // Navigate after role is saved in backend
      if (role === "student") {
        navigate("/details/student", {
          state: { fullName: signupData?.fullName || "", email: signupData?.email || "" },
        });
      } else if (role === "recruiter") {
        navigate("/details/company", {
          state: { email: signupData?.email || "" },
        });
      }
    } catch (error) {
      console.error("Error saving role:", error.response?.data || error.message);
      alert("Failed to save role. Please try again.");
    }
  }

  const buttonText = (role === "student" ? "Apply as a Student" : (role === "recruiter" ? "Apply as a Recruiter" : "Create Account"));
  const buttonDisabled = role === "";

  return (
    <div className="role-card" role="region" aria-labelledby="role-title">
      <header className="role-card-header">
        <img src={logo} alt="Portal logo" className="role-card-logo" />
        <h1 id="role-title" className="role-card-title">Join as a client or freelancer</h1>
        <p className="role-card-sub">Pick the role that best describes you</p>
      </header>

      <div className="role-options" role="radiogroup" aria-label="Choose role">
        <button
          type="button"
          className={`role-option ${role === "student" ? "selected" : ""}`}
          onClick={() => selectRole("student")}
          aria-checked={role === "student"}
          role="radio"
        >
          <div className="role-icon">🎓</div>
          <div className="role-text">
            <div className="role-tag">I'm a student</div>
            <div className="role-desc">Looking for internship opportunities</div>
          </div>
          <div className="role-radio" aria-hidden="true">
            <span className={`radio-dot ${role === "student" ? "on" : ""}`} />
          </div>
        </button>

        <button
          type="button"
          className={`role-option ${role === "recruiter" ? "selected" : ""}`}
          onClick={() => selectRole("recruiter")}
          aria-checked={role === "recruiter"}
          role="radio"
        >
          <div className="role-icon">💼</div>
          <div className="role-text">
            <div className="role-tag">I'm a recruiter</div>
            <div className="role-desc">Hiring for internships / full-time roles</div>
          </div>
          <div className="role-radio" aria-hidden="true">
            <span className={`radio-dot ${role === "recruiter" ? "on" : ""}`} />
          </div>
        </button>
      </div>

      <div className="role-actions">
        <button
          type="button"
          className={`continue-btn ${buttonDisabled ? "disabled" : "active"}`}
          onClick={onContinue}
          disabled={buttonDisabled}
          aria-disabled={buttonDisabled}
        >
          {buttonText}
        </button>
      </div>

      <div className="role-note">
        Already have an account? <a href="/login">Log In</a>
      </div>
    </div>
  );
}

export default RoleCard;
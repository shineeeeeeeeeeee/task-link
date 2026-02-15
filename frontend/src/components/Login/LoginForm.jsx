import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Button from "../Shared/Button";
import axios from "axios";

function LoginForm() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const ACCOUNT_NAME = state?.fullName || "Account";
  const ACCOUNT_EMAIL = state?.email || "account@example.com";

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors((prev) => ({ ...prev, [event.target.name]: undefined }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.identifier)) {
      newErrors.identifier = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      // Call backend login API /api/auth/signup
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email: formData.identifier,
        password: formData.password,
      });

      // Store token in sessionStorage (identity)
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("userEmail", res.data.user.email);
      sessionStorage.setItem("userRole", res.data.user.role);

      // Navigate to respective dashboard
      if (res.data.user.role === "student") {
        //------------------------------------THIS HAS TO BE UPDATED-----------------------------------------------
        // INSTEAD OF FULLNAME SOME UNIQUE STUDENT ID MUST BE USED TO IDENTIFY THE STUDENT.
        const studentId = res.data.user.fullName.replace(/\s+/g, '-').toLowerCase();
        sessionStorage.setItem("studentId", studentId);
        sessionStorage.setItem("userName", res.data.user.fullName);
        sessionStorage.setItem("userEmail", res.data.user.email);

        navigate(`/s/${studentId}`, { state: { fullName: res.data.user.fullName, email: res.data.user.email } });
      } else if (res.data.user.role === "recruiter") {
        //------------------------------------THIS HAS TO BE UPDATED-----------------------------------------------
        // INSTEAD OF FULLNAME SOME UNIQUE COMPANY ID MUST BE USED TO IDENTIFY THE COMPANY.
        const companyId = res.data.user.fullName;
        sessionStorage.setItem("tasklink_company_id", companyId);
        sessionStorage.setItem("tasklink_company_name", res.data.user.fullName);
        sessionStorage.setItem("tasklink_company_email", res.data.user.email);

        navigate(`/c/${companyId}`, { state: { fullName: res.data.user.fullName, email: res.data.user.email } });
      }

      // Clear form
      setFormData({ identifier: "", password: "" });
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  }

  return (
    <form className="login-form" noValidate onSubmit={handleSubmit}>
      {/* -----------------------------------------------------------------USER NAME / EMAIL---------------------------------------------------------- */}
      <div className="input-group">
        <div className="field filled">
          <input
            name="identifier"
            type="text"
            placeholder=" "
            aria-label="Email"
            autoComplete="username"
            value={formData.identifier}
            onChange={handleChange}
          />
          <label>Email</label>
          <div className="input-underline" />
        </div>

        {errors.identifier && (
          <div className="error-box" role="alert" aria-live="polite">
            <span className="error-icon" aria-hidden="true">i</span>
            <span className="error-text">{errors.identifier}</span>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------------PASSWORD----------------------------------------------------------- */}
      <div className="input-group">
        <div className="field filled" style={{ position: "relative" }}>
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder=" "
            aria-label="Password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <label>Password</label>

          {/* ----------------------------------------------Show/Hide toggle----------------------------------------------- */}
          <button
            type="button"
            className="pwd-toggle"
            onClick={() => setShowPwd((s) => !s)}
            aria-pressed={showPwd}
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? "Hide" : "Show"}
          </button>

          <div className="input-underline" />
        </div>

        {errors.password && (
          <div className="error-box" role="alert" aria-live="polite">
            <span className="error-icon" aria-hidden="true">i</span>
            <span className="error-text">{errors.password}</span>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------SUBMIT---------------------------------------------------------------- */}
      <div className="form-actions">
        <Button type="submit" text="Login" />
      </div>

      {/* ---------------------------------------------------------Signup & Forgot------------------------------------------------------------ */}
      <div className="helper-row">
        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="signup-link">Sign Up</Link>
        </p>
        <Link to="/forgot" className="forgot-link">Forgot password?</Link>
      </div>
    </form>
  );
}

export default LoginForm;

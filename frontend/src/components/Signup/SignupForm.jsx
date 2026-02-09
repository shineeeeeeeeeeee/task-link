import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Shared/Button";
import axios from "axios";

function SignupForm() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    retypedPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showRetyped, setShowRetyped] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors((prev) => ({ ...prev, [event.target.name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.retypedPassword) {
      newErrors.retypedPassword = "Please confirm your password.";
    } else if (formData.password !== formData.retypedPassword) {
      newErrors.retypedPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validate()) {
      const userData = {
        fullName: formData.fullname,
        email: formData.email,
        password: formData.password,
      };

      try {
        // Send signup data to backend
        await axios.post("http://localhost:5001/api/auth/signup", userData);

        // Clear form and states
        setFormData({ fullname: "", email: "", password: "", retypedPassword: "" });
        setShowPwd(false);
        setShowRetyped(false);

        // Navigate to role page with data
        navigate("/role", { state: { formData: userData } });
      } catch (err) {
        console.error("Signup error:", err.response?.data || err.message);

        // Optional: handle backend error messages
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        }
      }
    }
  };

  return (
    <form className="signup-form" noValidate onSubmit={handleSubmit}>
      {/* -----------------------------------------------------------------FULL NAME---------------------------------------------------------- */}
      <div className="input-group">
        <div className="field filled">
          <input
            name="fullname"
            type="text"
            placeholder=" "
            value={formData.fullname}
            onChange={handleChange}
            required
          />
          <label>Full Name</label>
          <div className="input-underline" />
        </div>
        {errors.fullname && (
          <div className="error-box" role="alert" aria-live="polite">
            <span className="error-icon" aria-hidden="true">i</span>
            <span className="error-text">{errors.fullname}</span>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------------EMAIL---------------------------------------------------------- */}
      <div className="input-group">
        <div className="field filled">
          <input
            name="email"
            type="email"
            placeholder=" "
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label>Email</label>
          <div className="input-underline" />
        </div>
        {errors.email && (
          <div className="error-box" role="alert" aria-live="polite">
            <span className="error-icon" aria-hidden="true">i</span>
            <span className="error-text">{errors.email}</span>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------PASSWORD-------------------------------------------------------- */}
      <div className="input-group">
        <div className="field filled" style={{ position: "relative" }}>
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder=" "
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label>Password</label>

          {/* ----------------------------------------------Show/Hide toggle----------------------------------------------- */}
          <button
            type="button"
            className="pwd-toggle"
            aria-pressed={showPwd}
            aria-label={showPwd ? "Hide password" : "Show password"}
            onClick={() => setShowPwd((s) => !s)}
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

      {/* ----------------------------------------------------------CONFIRM PASSWORD---------------------------------------------------- */}
      <div className="input-group">
        <div className="field filled" style={{ position: "relative" }}>
          <input
            name="retypedPassword"
            type={showRetyped ? "text" : "password"}
            placeholder=" "
            value={formData.retypedPassword}
            onChange={handleChange}
            required
          />
          <label>Confirm Password</label>

          <button
            type="button"
            className="pwd-toggle"
            aria-pressed={showRetyped}
            aria-label={showRetyped ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowRetyped((s) => !s)}
          >
            {showRetyped ? "Hide" : "Show"}
          </button>

          <div className="input-underline" />
        </div>
        {errors.retypedPassword && (
          <div className="error-box" role="alert" aria-live="polite">
            <span className="error-icon" aria-hidden="true">i</span>
            <span className="error-text">{errors.retypedPassword}</span>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------SUBMIT-------------------------------------------------------- */}
      <div className="form-actions">
        <Button type="submit" text="Sign Up" />
      </div>

      {/* --------------------------------------------------------------LOGIN LINK------------------------------------------------------ */}
      <p className="redirect-text">
        Already have an account?{" "}
        <Link to="/login" className="redirect-link">
          Login
        </Link>
      </p>
    </form>
  );
}

export default SignupForm;

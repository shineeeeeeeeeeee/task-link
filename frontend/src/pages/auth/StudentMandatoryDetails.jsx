import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.svg";
import "../../pages/auth/StudentMandatoryDetails.css";
import SkillList from "../../components/Shared/SkillList";
import InputField from "../../components/Shared/InputField";

function StudentMandatoryDetails() {
  const { state } = useLocation();
  const ACCOUNT_NAME = state?.fullName || "Account name";
  const ACCOUNT_EMAIL = state?.email || "account.email@example.com";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    country: "",
    address: "",
    phone: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleResumeChange = (event) => {
    const f = event.target.files && event.target.files[0];
    if (f && f.type === "application/pdf") {
      setResumeFile(f);
      setErrors((prev) => ({ ...prev, resumeFile: "" }));
    } else {
      setResumeFile(null);
      setErrors((prev) => ({
        ...prev,
        resumeFile: "Please upload a valid PDF file.",
      }));
    }
  };

  const onSkillsChange = useCallback((newSkills) => {
    setSkills(newSkills);
    if (newSkills.length > 0) {
      setErrors((prev) => ({ ...prev, skills: "" }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(formData.phone.trim()))
      newErrors.phone = "Enter a valid 10-digit phone number.";

    if (!resumeFile) newErrors.resumeFile = "Resume (PDF) is required.";
    if (skills.length === 0)
      newErrors.skills = "Please add at least one skill.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("email", ACCOUNT_EMAIL);
    data.append("firstName", formData.firstName);
    data.append("middleName", formData.middleName);
    data.append("lastName", formData.lastName);
    data.append("country", formData.country);
    data.append("address", formData.address);
    data.append("phone", formData.phone);
    data.append("skills", JSON.stringify(skills));
    data.append("fullName", ACCOUNT_NAME);
    if (resumeFile) data.append("resumeFile", resumeFile);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/details/student",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(res.data);
      alert("Student details saved successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to save student details.");
    }
  };

  return (
    <div className="std-page">
      {/* -----------------------------------------------------------------TOP BAR---------------------------------------------------------- */}
      <div className="std-hero" aria-hidden="true">
        <img src={logo} alt="Internship Portal Logo" />
      </div>

      <div
        className="std-account-card"
        role="banner"
        aria-label="account-summary"
      >
        <div className="acct-inner">
          <h2 className="acct-title">{ACCOUNT_NAME}</h2>
          <div className="acct-email">{ACCOUNT_EMAIL}</div>
        </div>
      </div>

      <main className="std-main">
        <div className="info-strip" role="note">
          <div className="info-icon">&#9432;</div>
          <div className="info-text">
            You can view and edit your profile details here. Any changes you
            make will be reflected in all your{" "}
            <strong>active job applications</strong>.
          </div>
        </div>

        <form className="std-card form-card" onSubmit={handleSubmit} noValidate>
          {/* -----------------------------------------------------------------PERSONAL INFO------------------------------------------------------- */}
          <div className="std-card-header">
            <h3>Personal Name</h3>
            <br /> <br />
          </div>

          <div className="std-grid">
            <InputField
              label="First name"
              value={formData.firstName}
              onChange={(val) => handleInputChange("firstName", val)}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <div className="error-msg">&#9888; {errors.firstName}</div>
            )}

            <InputField
              label="Middle name"
              value={formData.middleName}
              onChange={(val) => handleInputChange("middleName", val)}
              placeholder="Enter middle name (optional)"
            />

            <InputField
              label="Last name"
              value={formData.lastName}
              onChange={(val) => handleInputChange("lastName", val)}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <div className="error-msg">&#9888; {errors.lastName}</div>
            )}
          </div>

          {/* -----------------------------------------------------------------CONTACT---------------------------------------------------------- */}
          <div className="std-card-divider" />
          <div className="std-card-header">
            <h3>Contact</h3>
          </div>

          <div className="std-grid contact-grid">
            <div className="field">
              <div className="field-value">{ACCOUNT_EMAIL}</div>
            </div>

            <InputField
              label="Country"
              value={formData.country}
              onChange={(val) => handleInputChange("country", val)}
              placeholder="Country"
            />
            {errors.country && (
              <div className="error-msg">&#9888; {errors.country}</div>
            )}

            <InputField
              label="Address"
              value={formData.address}
              onChange={(val) => handleInputChange("address", val)}
              placeholder="Address"
            />
            {errors.address && (
              <div className="error-msg">&#9888; {errors.address}</div>
            )}

            <InputField
              label="Phone number"
              type="tel"
              value={formData.phone}
              onChange={(val) => handleInputChange("phone", val)}
              placeholder="Phone number"
            />
            {errors.phone && (
              <div className="error-msg">&#9888; {errors.phone}</div>
            )}
          </div>

          {/* -----------------------------------------------------------------RESUME---------------------------------------------------------- */}
          <div className="std-card-divider" />
          <div className="std-card-header">
            <h3>Resume</h3>
          </div>

          <div className="resume-box upload-box">
            <div className="resume-body">
              <div className="resume-sub">
                Upload a PDF copy of your resume. Recruiters will see this file.
              </div>
            </div>

            <div className="resume-cta">
              <label className="file-upload">
                <input accept=".pdf" type="file" onChange={handleResumeChange} />
                <span className="file-btn">Upload PDF</span>
              </label>

              <div className="file-name">
                {resumeFile ? (
                  resumeFile.name
                ) : (
                  <span className="muted">No file selected</span>
                )}
              </div>
            </div>
            {errors.resumeFile && (
              <div className="error-msg">&#9888; {errors.resumeFile}</div>
            )}
          </div>

          {/* -----------------------------------------------------------------SKILLS---------------------------------------------------------- */}
          <div className="std-card-divider" />
          <div className="std-card-header">
            <h3>Skills</h3>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="muted">
              &nbsp;&nbsp; Add the skills you want recruiters to see — click the
              + to add.
            </div>
          </div>

          <SkillList initialSkills={[]} onChange={onSkillsChange} />
          {errors.skills && (
            <div className="error-msg">&#9888; {errors.skills}</div>
          )}

          {/* -----------------------------------------------------------------SUBMIT---------------------------------------------------------- */}
          <div className="std-card-divider" />
          <div className="std-actions" style={{ marginTop: 25 }}>
            <button
              type="submit"
              className={`primary-btn ${Object.keys(errors).length === 0 ? "active" : ""
                }`}
            >
              Submit
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
      {/* --------------------------------------------------------------------------------------------------------------------------------- */}
    </div>
  );
}

export default StudentMandatoryDetails;

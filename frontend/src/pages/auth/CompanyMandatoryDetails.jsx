import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.svg";
import "../../pages/auth/CompanyMandatoryDetails.css";
import InputField from "../../components/Shared/InputField";

export default function CompanyMandatoryDetails() {
  const { state } = useLocation();
  const ACCOUNT_EMAIL = state?.email || "company@example.com";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    companyType: "",
    location: "",
    contactPerson: "",
    contactPhone: "",
    description: "",
  });

  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyDocument, setCompanyDocument] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (state?.companyName) {
      setFormData((prev) => ({ ...prev, companyName: state.companyName }));
    }
  }, [state]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoChange = (event) => {
    const f = event.target.files && event.target.files[0];
    if (f && f.type.startsWith("image/")) {
      setCompanyLogo(f);
      setErrors((prev) => ({ ...prev, companyLogo: "" }));
    } else {
      setCompanyLogo(null);
      setErrors((prev) => ({
        ...prev,
        companyLogo: "Please upload a valid image (JPG/PNG).",
      }));
    }
  };

  const handleDocumentChange = (event) => {
    const f = event.target.files && event.target.files[0];
    if (f && f.type === "application/pdf") {
      setCompanyDocument(f);
      setErrors((prev) => ({ ...prev, companyDocument: "" }));
    } else {
      setCompanyDocument(null);
      setErrors((prev) => ({
        ...prev,
        companyDocument: "Please upload a valid PDF.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required.";
    if (!formData.contactPerson.trim())
      newErrors.contactPerson = "Contact person is required.";
    if (!formData.companyWebsite.trim())
      newErrors.companyWebsite = "Company Website is required.";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Contact phone is required.";
    else if (!/^\d{10}$/.test(formData.contactPhone.trim()))
      newErrors.contactPhone = "Enter a valid 10-digit phone number.";

    if (formData.companyWebsite && formData.companyWebsite.trim()) {
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;
      if (!urlPattern.test(formData.companyWebsite.trim()))
        newErrors.companyWebsite =
          "Please enter a valid website URL (e.g. https://example.com).";
    }

    if (!companyLogo)
      newErrors.companyLogo = "Company logo (image) is required.";
    if (!companyDocument)
      newErrors.companyDocument = "Company registration PDF is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!validateForm()) {
      const firstErrorField = document.querySelector(".error-msg");
      if (firstErrorField)
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  
    const formDataToSend = new FormData();
    formDataToSend.append("email", ACCOUNT_EMAIL);
    formDataToSend.append("companyName", formData.companyName);
    formDataToSend.append("companyWebsite", formData.companyWebsite);
    formDataToSend.append("companyType", formData.companyType);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("contactPerson", formData.contactPerson);
    formDataToSend.append("contactPhone", formData.contactPhone);
    formDataToSend.append("description", formData.description);
  
    if (companyLogo) formDataToSend.append("companyLogo", companyLogo);
    if (companyDocument) formDataToSend.append("companyDocument", companyDocument);
  
    try {
      const response = await fetch("http://localhost:5001/api/auth/details/company", {
        method: "POST",
        body: formDataToSend,
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log("Company details saved:", data);
        alert("Company details saved successfully!");
        navigate("/login");
      } else {
        console.error("Error saving company details:", data);
        alert(data.message || "Error saving details.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to connect to the server.");
    }
  };
  

  return (
    <div className="cmp-page">
      {/* ---------------------------------------------------------------------------------------------------------------------------------- */}
      <div className="cmp-hero" aria-hidden="true">
        <img src={logo} alt="Internship Portal Logo" className="cmp-hero-img" />
      </div>

      <div className="std-account-card" role="banner" aria-label="account-summary">
        <div className="acct-inner">
          <h2 className="acct-title">{formData.companyName || "Company Name"}</h2>
          <div className="acct-email">{ACCOUNT_EMAIL}</div>
        </div>
      </div>

      <main className="cmp-main">
        <div className="info-strip" role="note">
          <div className="info-icon">&#127970;</div>
          <div className="info-text">
            Please complete your <strong>company profile</strong>. These details will be visible to students during job postings.
          </div>
        </div>

        <form className="cmp-card form-card" onSubmit={handleSubmit} noValidate>
          {/* ----------------------------------------------------------COMPANY INFO----------------------------------------------------------- */}
          <div className="cmp-card-header">
            <h3>Company Details</h3>
          </div>

          <div className="cmp-grid">
            <InputField
              label="Company name"
              value={formData.companyName}
              onChange={(val) => handleInputChange("companyName", val)}
              placeholder="Enter company name"
            />
            {errors.companyName && (
              <div className="error-msg">&#9888; {errors.companyName}</div>
            )}

            <InputField
              label="Company website"
              value={formData.companyWebsite}
              onChange={(val) => handleInputChange("companyWebsite", val)}
              placeholder="https://example.com"
            />
            {errors.companyWebsite && (
              <div className="error-msg">&#9888; {errors.companyWebsite}</div>
            )}

            <InputField
              label="Company type / Industry"
              value={formData.companyType}
              onChange={(val) => handleInputChange("companyType", val)}
              placeholder="e.g. IT, Manufacturing, Finance"
            />

            <InputField
              label="Location"
              value={formData.location}
              onChange={(val) => handleInputChange("location", val)}
              placeholder="City, Country"
            />
          </div>

          {/* -------------------------------------------------------------CONTACT----------------------------------------------------------- */}
          <div className="cmp-card-divider" />
          <div className="cmp-card-header">
            <h3>Contact Person</h3>
          </div>

          <div className="cmp-grid">
            <InputField
              label="Full name"
              value={formData.contactPerson}
              onChange={(val) => handleInputChange("contactPerson", val)}
              placeholder="Recruiter or HR Name"
            />
            {errors.contactPerson && (
              <div className="error-msg">&#9888; {errors.contactPerson}</div>
            )}

            <InputField
              label="Phone number"
              value={formData.contactPhone}
              onChange={(val) => handleInputChange("contactPhone", val)}
              placeholder="Enter contact number"
              type="tel"
            />
            {errors.contactPhone && (
              <div className="error-msg">&#9888; {errors.contactPhone}</div>
            )}
          </div>

          {/* ------------------------------------------------------------ABOUT------------------------------------------------------------- */}
          <div className="cmp-card-divider" />
          <div className="cmp-card-header">
            <h3>About Company</h3>
          </div>
          <div className="field floating filled">
            <textarea
              className="field-input text-area"
              rows="4"
              placeholder="Write a short company description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          {/* ----------------------------------------------------------UPLOADS----------------------------------------------------------- */}
          <div className="cmp-card-divider" />
          <div className="cmp-card-header">
            <h3>Uploads</h3>
          </div>

          <div className="upload-box">
            <div className="resume-body">
              <div className="resume-title">Company Logo</div>
              <div className="resume-sub">Upload a square image (JPG or PNG).</div>
            </div>
            <div className="resume-cta">
              <label className="file-upload">
                <input accept="image/*" type="file" onChange={handleLogoChange} />
                <span className="file-btn">Upload Logo</span>
              </label>
              <div className="file-name">
                {companyLogo ? companyLogo.name : <span className="muted">No file selected</span>}
              </div>
            </div>
            {errors.companyLogo && (
              <div className="error-msg">&#9888; {errors.companyLogo}</div>
            )}
          </div>

          <div className="upload-box">
            <div className="resume-body">
              <div className="resume-title">Company Registration Document</div>
              <div className="resume-sub">Upload company verification PDF.</div>
            </div>
            <div className="resume-cta">
              <label className="file-upload">
                <input accept=".pdf" type="file" onChange={handleDocumentChange} />
                <span className="file-btn">Upload PDF</span>
              </label>
              <div className="file-name">
                {companyDocument ? companyDocument.name : <span className="muted">No file selected</span>}
              </div>
            </div>
            {errors.companyDocument && (
              <div className="error-msg">&#9888; {errors.companyDocument}</div>
            )}
          </div>

          {/* ----------------------------------------------------------SUBMIT----------------------------------------------------------- */}
          <div className="cmp-card-divider" />
          <div className="cmp-actions">
            <button type="submit" className="primary-btn active">Submit</button>
            <button type="button" className="secondary-btn" onClick={() => navigate("/login")}>Cancel</button>
          </div>
        </form>
      </main>
    </div>
  );
}

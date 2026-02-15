import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Globe,
    MapPin,
    Briefcase,
    User,
    FileText,
    Edit2,
    X,
    CheckCircle,
    ExternalLink,
    Download,
    LayoutDashboard,
    Users,
    UserCheck,
    HelpCircle,
    ArrowLeft
} from "lucide-react";
import "../../pages/company/CompanyProfile.css";
import logo from "../../assets/logo.svg";
import axios from "axios";

export default function CompanyProfile() {
    const navigate = useNavigate();
    const { companyId } = useParams();

    // Unified dummy data for fallbacks
    const DUMMY_PROFILE = {
        companyName: "Company Name",
        companyWebsite: "www.companyURL.com",
        email: "company@email.com",
        companyIndustry: "IT",
        location: "Bangalore, India",
        contactPersonName: "Company Contact Person",
        phoneNumber: "+91 XXXXX XXXXX",
        aboutCompany: "Company Description",
        companyLogo: null,
        companyRegistrationDocument: null
    };

    const CACHE_KEY = `tasklink_company_profile_cache_${companyId}`;

    const [profile, setProfile] = useState(() => {
        const cached = sessionStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    });

    const [loading, setLoading] = useState(!profile);
    const [fetchError, setFetchError] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState(profile || DUMMY_PROFILE);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const fetchProfileData = async () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            if (!profile) setProfile(DUMMY_PROFILE);
            return;
        }

        try {
            const { data } = await axios.get(
                "http://localhost:5001/api/auth/profile/company",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data?.company) {
                const fetched = {
                    companyName: data.company.companyName || "",
                    companyWebsite: data.company.website || "",
                    email: data.company.email || "",
                    companyIndustry: data.company.companyType || "",
                    location: data.company.location || "",
                    contactPersonName: data.company.contactPerson || "",
                    phoneNumber: data.company.contactPhone || "",
                    aboutCompany: data.company.description || "",
                    companyLogo: data.company.logoPath || null,
                    companyRegistrationDocument: data.company.docPath || null,
                };
                setProfile(fetched);
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(fetched));
                setFetchError(false);
            } else if (!profile) {
                setProfile(DUMMY_PROFILE);
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            if (!profile) {
                setProfile(DUMMY_PROFILE);
                setFetchError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [companyId]);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    const handleOpenEditModal = () => {
        setFormData(profile || DUMMY_PROFILE);
        setIsEditModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return showToast("Please login again", "error");

        try {
            const formPayload = {
                email: profile?.email || "default@example.com",
                companyName: formData.companyName,
                website: formData.companyWebsite,
                companyType: formData.companyIndustry,
                location: formData.location,
                contactPerson: formData.contactPersonName,
                contactPhone: formData.phoneNumber,
                description: formData.aboutCompany
            };

            const { data } = await axios.post(
                "http://localhost:5001/api/auth/details/company",
                formPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedProfile = data.company || { ...profile, ...formData };
            setProfile(updatedProfile);
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(updatedProfile));

            setIsEditModalOpen(false);
            showToast("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || "Failed to update profile", "error");
        }
    };

    const calculateCompleteness = () => {
        if (!profile) return 0;
        const fields = ["companyName", "companyWebsite", "companyIndustry", "location", "contactPersonName", "phoneNumber", "aboutCompany"];
        const filledFields = fields.filter((field) => profile[field] && profile[field].trim() !== "");
        let score = filledFields.length;
        if (profile.companyLogo) score += 1;
        if (profile.companyRegistrationDocument) score += 1;
        return Math.round((score / (fields.length + 2)) * 100);
    };

    const completeness = calculateCompleteness();

    const renderLoadingPlaceholder = () => (
        <div className="profile-container" style={{ opacity: 0.6 }}>
            <div className="profile-hero-card" style={{ height: "160px", background: "#f3f4f6", border: "none", boxShadow: "none" }}></div>
            <div className="completeness-section" style={{ height: "60px", background: "#f3f4f6", border: "none", boxShadow: "none" }}></div>
            <div className="profile-grid">
                <div className="profile-col-main">
                    <div className="profile-info-card" style={{ height: "200px", background: "#f3f4f6", border: "none", boxShadow: "none" }}></div>
                </div>
                <div className="profile-col-side">
                    <div className="profile-info-card" style={{ height: "150px", background: "#f3f4f6", border: "none", boxShadow: "none" }}></div>
                </div>
            </div>
        </div>
    );

    const renderErrorState = () => (
        <div className="profile-container" style={{ alignItems: "center", padding: "60px 0" }}>
            <div className="profile-info-card" style={{ textAlign: "center", width: "100%", maxWidth: "400px" }}>
                <h3 style={{ border: "none", justifyContent: "center", color: "#ef4444" }}>Connection Lost</h3>
                <p style={{ margin: "16px 0", color: "#6b7280" }}>Unable to load company profile. Please check your connection.</p>
                <button className="btn-primary" onClick={fetchProfileData} style={{ width: "100%" }}>Retry</button>
            </div>
        </div>
    );

    {/* ------------------------------------------------------------------------------------------------------------------------------- */ }
    return (
        <div className="dashboard-wrapper">
            {/* ------------------------------------------------TOAST NOTIFICATION-------------------------------------------------*/}
            {toast.show && (
                <div className={`toast-message ${toast.type}`}>{toast.message}</div>
            )}
            {/* ------------------------------------------------HEADER-------------------------------------------------*/}
            <header className="dashboard-header">
                <div className="header-container">
                    <div
                        className="header-brand"
                        onClick={() => navigate(`/c/${companyId}`)}
                        style={{ cursor: "pointer" }}
                    >
                        <img src={logo} alt="TaskLink" className="brand-logo" />
                        <h1 className="brand-name">Profile</h1>
                    </div>

                    <div className="header-actions">
                        <button className="btn-create" onClick={() => navigate(`/c/${companyId}`)}>
                            <ArrowLeft size={18} />
                            <span>Back to Dashboard</span>
                        </button>

                        <div className="user-profile">
                            <div className="user-avatar">
                                {profile?.companyName?.charAt(0) || "C"}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{profile?.companyName || "Company"}</span>
                                <span className="user-role">Recruiter</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ------------------------------------------------SIDE BAR-------------------------------------------------*/}
            <div className="dashboard-layout">
                <aside className="dashboard-sidebar">
                    <nav className="sidebar-nav">
                        <button className="nav-item" onClick={() => navigate(`/c/${companyId}`)}>
                            <LayoutDashboard size={20} />
                            <span>My Postings</span>
                        </button>
                        <button className="nav-item">
                            <Users size={20} />
                            <span>Applicants</span>
                        </button>
                        <button className="nav-item">
                            <UserCheck size={20} />
                            <span>Shortlisted</span>
                        </button>
                        <div className="nav-divider"></div>
                        <button className="nav-item active">
                            <User size={20} />
                            <span>Company Profile</span>
                        </button>
                        <button className="nav-item">
                            <HelpCircle size={20} />
                            <span>Help Center</span>
                        </button>
                    </nav>

                    <div className="company-mini-card">
                        <div className="mini-avatar">🏢</div>
                        <div className="mini-info">
                            <h4>{profile?.companyName || "Company"}</h4>
                            <p>{profile?.email || "recruiter@tasklink.com"}</p>
                        </div>
                    </div>
                </aside>

                {/* ------------------------------------------------MAIN CONTENT-------------------------------------------------*/}
                <main className="dashboard-content">
                    {loading && !profile ? (
                        renderLoadingPlaceholder()
                    ) : fetchError && !profile ? (
                        renderErrorState()
                    ) : (
                        <div className="profile-container">
                            {/* ------------------------------------------------PROFILE HERO CARD-------------------------------------------------*/}
                            <section className="profile-hero-card">
                                <div className="hero-content">
                                    <div className="profile-logo-container">
                                        {profile?.logoPath ? (
                                            <img
                                                src={`http://localhost:5001${profile.logoPath}`}
                                                alt="Logo"
                                                className="company-logo"
                                            />
                                        ) : (
                                            <div className="logo-placeholder">{profile?.companyName?.charAt(0) || "🏢"}</div>
                                        )}
                                    </div>

                                    <div className="hero-details">
                                        <div className="name-row">
                                            <h2>{profile?.companyName}</h2>
                                            <span className="verified-badge">
                                                <CheckCircle size={14} /> Verified
                                            </span>
                                        </div>

                                        <p className="hero-industry">
                                            <Briefcase size={14} /> {profile?.companyIndustry}
                                        </p>

                                        <div className="hero-meta">
                                            <span>
                                                <Globe size={14} />{" "}
                                                <a
                                                    href={`https://${profile?.companyWebsite}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {profile?.companyWebsite}
                                                </a>
                                            </span>
                                            <span>
                                                <MapPin size={14} /> {profile?.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hero-actions">
                                    <button className="btn-edit-profile" onClick={handleOpenEditModal}>
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                </div>
                            </section>

                            {/* ----------------------------------------------COMPLETENESS BAR------------------------------------------- */}
                            <section className="completeness-section">
                                <div className="completeness-header">
                                    <span>Profile Completeness</span>
                                    <span>{completeness}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${completeness}%` }}
                                    ></div>
                                </div>
                            </section>

                            <div className="profile-grid">
                                {/* -------------------------------------LEFT COLUMN--------------------------------------- */}
                                <div className="profile-col-main">
                                    <div className="profile-info-card">
                                        <h3>
                                            <FileText size={18} /> About Company
                                        </h3>
                                        <p className="about-text">{profile?.aboutCompany}</p>
                                    </div>

                                    <div className="profile-info-card">
                                        <h3>
                                            <Briefcase size={18} /> Company Details
                                        </h3>
                                        <div className="details-list">
                                            <div className="detail-item">
                                                <label>Industry Type</label>
                                                <span>{profile?.companyIndustry}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Website</label>
                                                <span className="link">{profile?.companyWebsite}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Headquarters</label>
                                                <span>{profile?.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* -------------------------------------RIGHT COLUMN--------------------------------------- */}
                                <div className="profile-col-side">
                                    <div className="profile-info-card">
                                        <h3>
                                            <User size={18} /> Contact Person
                                        </h3>
                                        <div className="details-list">
                                            <div className="detail-item">
                                                <label>Name</label>
                                                <span>{profile?.contactPersonName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Phone Number</label>
                                                <span>{profile?.phoneNumber}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Email Address</label>
                                                <span>{profile?.email || "admin@tasklink.com"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="profile-info-card">
                                        <h3>
                                            <FileText size={18} /> Official Documents
                                        </h3>
                                        <div className="document-list">
                                            <div className="doc-item">
                                                <div className="doc-icon pdf">PDF</div>
                                                <div className="doc-info">
                                                    <p>Registration Document</p>
                                                    <span>
                                                        {profile?.companyRegistrationDocument
                                                            ? `Verified • ${new Date().toLocaleDateString()}`
                                                            : "Not uploaded"}
                                                    </span>
                                                </div>
                                                <button
                                                    className="doc-btn"
                                                    title={profile?.companyRegistrationDocument ? "Open Document" : "No document uploaded"}
                                                    onClick={() => {
                                                        if (profile?.companyRegistrationDocument) {
                                                            window.open(`http://localhost:5001${profile.companyRegistrationDocument}`, "_blank");
                                                        } else {
                                                            showToast("No document uploaded", "error");
                                                        }
                                                    }}
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>

                                            <div className="doc-item">
                                                <div className="doc-icon img">IMG</div>
                                                <div className="doc-info">
                                                    <p>Company Logo</p>
                                                    <span>
                                                        {profile?.companyLogo ? "Primary Brand Asset" : "Not uploaded"}
                                                    </span>
                                                </div>
                                                <button
                                                    className="doc-btn"
                                                    title={profile?.companyLogo ? "View Logo" : "No logo uploaded"}
                                                    onClick={() => {
                                                        if (profile?.companyLogo) {
                                                            window.open(`http://localhost:5001${profile.companyLogo}`, "_blank");
                                                        } else {
                                                            showToast("No logo uploaded", "error");
                                                        }
                                                    }}
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {/* ------------------------------------------------------------------------------------------------------------------------------- */}

            {/* -----------------------------------------------------------EDIT PROFILE-------------------------------------------------------- */}
            {isEditModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
                    <div
                        className="modal-content profile-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Edit Company Profile</h2>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form className="modern-form" onSubmit={handleSaveChanges}>
                            <div className="form-grid">
                                <div className="field-group span-2">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Website URL</label>
                                    <input
                                        type="text"
                                        name="companyWebsite"
                                        value={formData.companyWebsite}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Industry</label>
                                    <input
                                        type="text"
                                        name="companyIndustry"
                                        value={formData.companyIndustry}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Headquarters Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Contact Person Name</label>
                                    <input
                                        type="text"
                                        name="contactPersonName"
                                        value={formData.contactPersonName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="field-group span-2">
                                    <label>About Company</label>
                                    <textarea
                                        name="aboutCompany"
                                        rows="4"
                                        value={formData.aboutCompany}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ------------------------------------------------------------------------------------------------------------------------------- */}
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    Bookmark,
    User,
    HelpCircle,
    CheckCircle,
    Edit2,
    X,
    Mail,
    Phone,
    MapPin,
    Globe,
    Download,
    ExternalLink,
    ArrowLeft,
    GraduationCap
} from "lucide-react";
import "../../pages/student/StudentProfile.css";
import logo from "../../assets/logo.svg";

export default function StudentProfile() {
    const navigate = useNavigate();
    const { student_id } = useParams();

    // Initial dummy data with Academic fields as requested in UI refactor
    const [profile, setProfile] = useState({
        firstName: "Firstname",
        middleName: "Middlename",
        lastName: "Surname",
        email: "student@example.com",
        country: "country",
        address: "address",
        phoneNumber: "+91 XXXXX XXXXX",
        resumeFileName: "Resume.pdf",
        resumeUrl: "https://example.com/resume.pdf",
        skills: ["React", "Node.js", "Java", "Python", "SQL"],
        // Academic Details (New for UI consistency) (to be added in UI Form and DB)
        college: "College",
        branch: "Branch",
        semester: "Semester"
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState(profile);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        // TODO: Fetch student profile from backend
    }, [student_id]);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    const handleOpenEditModal = () => {
        setFormData(profile);
        setIsEditModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSkillsChange = (e) => {
        const value = e.target.value;
        const skillsArray = value.split(",").map(skill => skill.trim()).filter(skill => skill !== "");
        setFormData(prev => ({ ...prev, skills: skillsArray }));
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        // TODO: Save updated student profile to backend
        setProfile(formData);
        setIsEditModalOpen(false);
        showToast("Profile updated successfully!");
    };

    const calculateCompleteness = () => {
        const fields = ["firstName", "lastName", "email", "country", "address", "phoneNumber", "college", "branch", "semester"];
        const filledFields = fields.filter((field) => profile[field] && profile[field].trim() !== "");
        let score = filledFields.length;
        if (profile.skills && profile.skills.length > 0) score += 1;
        if (profile.resumeUrl) score += 1;
        return Math.round((score / (fields.length + 2)) * 100);
    };

    const completeness = calculateCompleteness();

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
                    <div className="header-brand" onClick={() => navigate(`/s/${student_id}`)} style={{ cursor: "pointer" }}>
                        <img src={logo} alt="TaskLink" className="brand-logo" />
                        <h1 className="brand-name">Profile</h1>
                    </div>
                    <div className="header-actions">
                        <button className="btn-create" onClick={() => navigate(`/s/${student_id}`)}>
                            <ArrowLeft size={18} />
                            <span>Back to Dashboard</span>
                        </button>
                        <div className="user-profile">
                            <div className="user-avatar">{profile.firstName?.charAt(0) || "S"}</div>
                            <div className="user-details">
                                <span className="user-name">{`${profile.firstName} ${profile.lastName}`}</span>
                                <span className="user-role">Student</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ------------------------------------------------SIDEBAR-------------------------------------------------*/}
            <div className="dashboard-layout">
                <aside className="dashboard-sidebar">
                    <nav className="sidebar-nav">
                        <button className="nav-item" onClick={() => navigate(`/s/${student_id}`)}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </button>
                        <button className="nav-item">
                            <FileText size={20} />
                            <span>My Applications</span>
                        </button>
                        <button className="nav-item">
                            <Bookmark size={20} />
                            <span>Saved Internships</span>
                        </button>
                        <div className="nav-divider"></div>
                        <button className="nav-item active">
                            <User size={20} />
                            <span>Student Profile</span>
                        </button>
                        <button className="nav-item">
                            <HelpCircle size={20} />
                            <span>Help Center</span>
                        </button>
                    </nav>
                    <div className="company-mini-card">
                        <div className="mini-avatar">👨‍🎓</div>
                        <div className="mini-info">
                            <h4>{`${profile.firstName} ${profile.lastName}`}</h4>
                            <p>{profile.email}</p>
                        </div>
                    </div>
                </aside>

                {/* ------------------------------------------------MAIN CONTENT-------------------------------------------------*/}
                <main className="dashboard-content">
                    <div className="profile-container">
                        {/* ------------------------------------------------PROFILE HERO CARD-------------------------------------------------*/}
                        <section className="profile-hero-card">
                            <div className="hero-content">
                                <div className="profile-logo-container">
                                    <div className="logo-placeholder">{profile.firstName?.charAt(0) || "S"}</div>
                                </div>
                                <div className="hero-details">
                                    <div className="name-row">
                                        <h2>{`${profile.firstName} ${profile.middleName} ${profile.lastName}`}</h2>
                                        <span className="verified-badge"><CheckCircle size={14} /> Verified</span>
                                    </div>
                                    <p className="hero-industry"><Mail size={14} /> {profile.email}</p>
                                    <div className="hero-meta">
                                        <span><Globe size={14} /> {profile.country}</span>
                                        <span><MapPin size={14} /> {profile.address}</span>
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
                                <div className="progress-bar-fill" style={{ width: `${completeness}%` }}></div>
                            </div>
                        </section>

                        <div className="profile-grid">
                            <div className="profile-col-main">
                                {/* --------------------------------------ACADEMIC DETAILS CARD-------------------------------------- */}
                                <div className="profile-info-card">
                                    <h3><GraduationCap size={18} /> Academic Details</h3>
                                    <div className="details-list">
                                        <div className="detail-item">
                                            <label>College / University</label>
                                            <span>{profile.college}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Branch / Specialization</label>
                                            <span>{profile.branch}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Current Semester</label>
                                            <span>{profile.semester}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* --------------------------------------SKILLS & INTERESTS CARD-------------------------------------- */}
                                <div className="profile-info-card">
                                    <h3><Bookmark size={18} /> Skills & Interests</h3>
                                    <div className="skills-tags">
                                        {profile.skills.length > 0 ? (
                                            profile.skills.map((skill, index) => (
                                                <span key={index} className="skill-pill">{skill}</span>
                                            ))
                                        ) : (
                                            <p className="muted-text">No skills added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="profile-col-side">
                                {/* --------------------------------------CONTACT INFORMATION CARD-------------------------------------- */}
                                <div className="profile-info-card">
                                    <h3><Phone size={18} /> Contact Information</h3>
                                    <div className="details-list">
                                        <div className="detail-item">
                                            <label>Phone Number</label>
                                            <span>{profile.phoneNumber}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Home Address</label>
                                            <span>{profile.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* --------------------------------------RESUME CARD-------------------------------------- */}
                                <div className="profile-info-card">
                                    <h3><FileText size={18} /> Resume</h3>
                                    <div className="document-list">
                                        <div className="doc-item">
                                            <div className="doc-icon pdf">PDF</div>
                                            <div className="doc-info">
                                                <p>{profile.resumeFileName || "Not uploaded"}</p>
                                                <span>{profile.resumeUrl ? "Uploaded Document" : "Not uploaded"}</span>
                                            </div>
                                            <button className="doc-btn" onClick={() => profile.resumeUrl && window.open(profile.resumeUrl, "_blank")}>
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {/* ------------------------------------------------------------------------------------------------------------------------------- */}

            {/* -----------------------------------------------------------EDIT PROFILE-------------------------------------------------------- */}
            {isEditModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Student Profile</h2>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form className="modern-form" onSubmit={handleSaveChanges}>
                            <div className="form-grid">
                                <div className="field-group"><label>First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required /></div>
                                <div className="field-group"><label>Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required /></div>
                                <div className="field-group"><label>College</label><input type="text" name="college" value={formData.college} onChange={handleInputChange} required /></div>
                                <div className="field-group"><label>Branch</label><input type="text" name="branch" value={formData.branch} onChange={handleInputChange} required /></div>
                                <div className="field-group"><label>Semester</label><input type="text" name="semester" value={formData.semester} onChange={handleInputChange} required /></div>
                                <div className="field-group"><label>Phone</label><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required /></div>
                                <div className="field-group span-2"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} required /></div>
                                <div className="field-group span-2"><label>Skills (Comma separated)</label><input type="text" value={formData.skills.join(", ")} onChange={handleSkillsChange} /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ------------------------------------------------------------------------------------------------------------------------------- */}
        </div>
    );
}

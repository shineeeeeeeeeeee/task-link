// src/pages/company/CompanyDashboard.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  MapPin,
  Clock,
  Wallet,
  Users,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Briefcase,
  UserCheck,
  HelpCircle,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import "../../pages/company/CompanyDashboard.css";
import logo from "../../assets/logo.svg";

const INITIAL_FORM_STATE = {
  title: "",
  location: "",
  duration: "",
  stipend: "",
  description: "",
  skills: "",
};

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ACCOUNT_NAME = state?.fullName || "Company Admin";
  const ACCOUNT_EMAIL = state?.email || "recruiter@tasklink.com";

  // State Management
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [postings, setPostings] = useState([
    {
      id: 1,
      title: "Senior Java Developer Intern",
      applicants: 12,
      location: "Ahmedabad, IN",
      stipend: "₹15,000 / month",
      duration: "6 months",
      status: "Open",
      description: "Looking for a passionate Java developer to join our backend team.",
      skills: ["Java", "Spring Boot", "MySQL"]
    },
    {
      id: 2,
      title: "Frontend UI/UX Intern (React)",
      applicants: 7,
      location: "Remote",
      stipend: "₹10,000 / month",
      duration: "3 months",
      status: "Reviewing",
      description: "Help us build the next generation of our user interface using React and modern CSS.",
      skills: ["React", "CSS3", "Figma"]
    },
  ]);

  // Dummy data for applicants
  const applicants = [
    {
      id: 101,
      name: "Shine Suri",
      college: "GSFC University",
      skills: ["Java", "Spring", "SQL"],
      resume: "#",
      shortlisted: false,
    },
    {
      id: 102,
      name: "Dhruvil Dhamecha",
      college: "GSFC University",
      skills: ["Java", "React", "Node.js", "MongoDB"],
      resume: "#",
      shortlisted: true,
    },
    {
      id: 103,
      name: "Anjali Sharma",
      college: "GSFC University",
      skills: ["Python", "Django", "React"],
      resume: "#",
      shortlisted: false,
    }
  ];

  // Helper Functions
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setIsEditing(false);
    setCurrentEditId(null);
  };

  const openPostModal = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (post) => {
    setFormData({
      ...post,
      skills: post.skills.join(", "),
    });
    setIsEditing(true);
    setCurrentEditId(post.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this internship posting?")) {
      setPostings(prev => prev.filter(p => p.id !== id));
      showToast("Internship deleted successfully", "success");
    }
  };

  const toggleStatus = (id) => {
    setPostings(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === "Open" ? "Closed" : "Open" } : p
    ));
    showToast("Status updated");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.skills.trim()) newErrors.skills = "At least one skill is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      if (isEditing) {
        setPostings(prev => prev.map(p =>
          p.id === currentEditId
            ? {
              ...p,
              ...formData,
              skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean)
            }
            : p
        ));
        showToast("Internship updated successfully");
      } else {
        const newPost = {
          ...formData,
          id: Date.now(),
          applicants: 0,
          status: "Open",
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
          postedAt: new Date().toISOString(),
        };
        setPostings(prev => [newPost, ...prev]);
        showToast("Internship posted successfully");
      }

      setShowForm(false);
      resetForm();
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-message ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Modern Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-brand">
            <img src={logo} alt="TaskLink" className="brand-logo" />
            <h1 className="brand-name">Dashboard</h1>
          </div>
          <div className="header-actions">
            <button className="btn-create" onClick={openPostModal}>
              <Plus size={18} />
              <span>Post Internship</span>
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                {ACCOUNT_NAME.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="user-details">
                <span className="user-name">{ACCOUNT_NAME}</span>
                <span className="user-role">Recruiter</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar Nav */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button className="nav-item active">
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
            <button className="nav-item">
              <HelpCircle size={20} />
              <span>Help Center</span>
            </button>
          </nav>

          <div className="company-mini-card">
            <div className="mini-avatar">🏢</div>
            <div className="mini-info">
              <h4>{ACCOUNT_NAME}</h4>
              <p>{ACCOUNT_EMAIL}</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-content">
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">My Internship Postings</h2>
              <span className="count-badge">{postings.length} Active</span>
            </div>

            {postings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No internships posted yet</h3>
                <p>Start hiring top talent by posting your first internship requirements.</p>
                <button className="btn-primary" onClick={openPostModal}>
                  Post your first internship
                </button>
              </div>
            ) : (
              <div className="postings-grid">
                {postings.map((p) => (
                  <div key={p.id} className="modern-card">
                    <div className="card-header">
                      <div className="card-title-group">
                        <h3 className="card-title">{p.title}</h3>
                        <span className={`status-pill ${p.status.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="card-actions">
                        <button className="icon-btn edit" onClick={() => handleEdit(p)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(p.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="card-meta">
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{p.location}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{p.duration}</span>
                      </div>
                      <div className="meta-item">
                        <Wallet size={14} />
                        <span>{p.stipend}</span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="applicant-summary">
                        <Users size={16} />
                        <span>{p.applicants} Applicants</span>
                      </div>
                      <div className="footer-btns">
                        <button
                          className={`btn-text ${p.status === "Open" ? "danger" : "success"}`}
                          onClick={() => toggleStatus(p.id)}
                        >
                          {p.status === "Open" ? "Close" : "Reopen"}
                        </button>
                        <button className="btn-outline-sm">View Applicants</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section mt-32">
            <div className="section-header">
              <h2 className="section-title">Recent Applicants</h2>
              <button className="view-all-link">View all <ChevronRight size={16} /></button>
            </div>

            <div className="applicants-list">
              {applicants.slice(0, 3).map((a) => (
                <div key={a.id} className="applicant-row">
                  <div className="applicant-basic">
                    <div className="initials-avatar">
                      {a.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="applicant-info">
                      <h4>{a.name}</h4>
                      <p>{a.college}</p>
                    </div>
                  </div>
                  <div className="applicant-skills">
                    {a.skills.map((s, i) => (
                      <span key={i} className="mini-chip">{s}</span>
                    ))}
                  </div>
                  <div className="applicant-cta">
                    <button className={`btn-icon-pill ${a.shortlisted ? "active" : ""}`}>
                      <CheckCircle size={16} />
                      <span>{a.shortlisted ? "Shortlisted" : "Shortlist"}</span>
                    </button>
                    <button className="ghost-btn">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Refined Modal Form */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? "Edit Internship" : "Post New Internship"}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modern-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-group span-2">
                  <label>Internship Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Frontend Developer Intern"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={errors.title ? "error" : ""}
                  />
                  {errors.title && <span className="error-msg">{errors.title}</span>}
                </div>

                <div className="field-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Remote or City"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={errors.location ? "error" : ""}
                  />
                  {errors.location && <span className="error-msg">{errors.location}</span>}
                </div>

                <div className="field-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g. 3 Months"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={errors.duration ? "error" : ""}
                  />
                  {errors.duration && <span className="error-msg">{errors.duration}</span>}
                </div>

                <div className="field-group">
                  <label>Stipend (Optional)</label>
                  <input
                    type="text"
                    name="stipend"
                    placeholder="e.g. ₹10,000 / month"
                    value={formData.stipend}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="field-group">
                  <label>Skills (Comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g. React, Node.js, CSS"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className={errors.skills ? "error" : ""}
                  />
                  {errors.skills && <span className="error-msg">{errors.skills}</span>}
                </div>

                <div className="field-group span-2">
                  <label>Description</label>
                  <textarea
                    name="description"
                    placeholder="What will the intern do?"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={errors.description ? "error" : ""}
                  ></textarea>
                  {errors.description && <span className="error-msg">{errors.description}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : isEditing ? "Update Internship" : "Post Internship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

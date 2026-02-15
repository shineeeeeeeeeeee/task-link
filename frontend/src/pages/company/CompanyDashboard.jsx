import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

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
  const { companyId } = useParams();

  const DUMMY_COMPANY_INFO = {
    companyName: "Company Name",
    companyEmail: "company@email.com",
  };

  const CACHE_KEY_INFO = `tasklink_company_info_cache_${companyId}`;
  const CACHE_KEY_POSTINGS = `tasklink_company_postings_cache_${companyId}`;

  // Initialize state from cache to prevent flicker
  const [companyInfo, setCompanyInfo] = useState(() => {
    const cached = sessionStorage.getItem(CACHE_KEY_INFO);
    return cached ? JSON.parse(cached) : DUMMY_COMPANY_INFO;
  });

  const [postings, setPostings] = useState(() => {
    const cached = sessionStorage.getItem(CACHE_KEY_POSTINGS);
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // State Management
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchDashboardData = async () => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch Profile & Postings in parallel
      const [profileRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/api/auth/profile/company`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/jobs/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData?.company) {
          const info = {
            companyName: profileData.company.companyName || "Company",
            companyEmail: profileData.company.email || "recruiter@tasklink.com",
          };
          setCompanyInfo(info);
          sessionStorage.setItem(CACHE_KEY_INFO, JSON.stringify(info));
        }
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const mapped = (jobsData.jobs || []).map((j) => ({
          id: j._id,
          title: j.title,
          applicants: j.applicantsCount || 0,
          location: j.location,
          stipend: j.stipend || "",
          duration: j.duration,
          status: j.status || "Open",
          description: j.description,
          skills: j.skills || [],
          postedAt: j.postedAt,
        }));
        setPostings(mapped);
        sessionStorage.setItem(CACHE_KEY_POSTINGS, JSON.stringify(mapped));
      }

      setFetchError(false);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      // Only set error if we have no data at all
      if (postings.length === 0 && companyInfo.companyName === "Company Name") {
        setFetchError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [companyId]);

  // Initials logic for company avatar
  const getCompanyInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C";
  };

  // Dummy data 
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
    }
  ];

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship posting?")) return;
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = postings.filter((p) => p.id !== id);
      setPostings(updated);
      sessionStorage.setItem(CACHE_KEY_POSTINGS, JSON.stringify(updated));
      showToast("Internship deleted successfully", "success");
    } catch (e) {
      console.error("Delete failed:", e);
      showToast("Delete failed", "error");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/jobs/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const j = data.job;
      const updated = postings.map((p) => (p.id === id ? { ...p, status: j.status } : p));
      setPostings(updated);
      sessionStorage.setItem(CACHE_KEY_POSTINGS, JSON.stringify(updated));
      showToast("Status updated");
    } catch (e) {
      console.error("Status update failed:", e);
      showToast("Status update failed", "error");
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const payload = {
      title: formData.title,
      location: formData.location,
      duration: formData.duration,
      stipend: formData.stipend,
      description: formData.description,
      skills: formData.skills,
    };

    try {
      if (isEditing && currentEditId) {
        const res = await fetch(`${API_BASE}/api/jobs/${currentEditId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const j = data.job;
        const updated = postings.map((p) =>
          p.id === currentEditId
            ? {
              ...p,
              title: j.title,
              location: j.location,
              duration: j.duration,
              stipend: j.stipend || "",
              description: j.description,
              skills: j.skills || [],
            }
            : p
        );
        setPostings(updated);
        sessionStorage.setItem(CACHE_KEY_POSTINGS, JSON.stringify(updated));
        showToast("Internship updated successfully");
      } else {
        const res = await fetch(`${API_BASE}/api/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const j = data.job;
        const newPost = {
          id: j._id,
          title: j.title,
          applicants: j.applicantsCount || 0,
          location: j.location,
          stipend: j.stipend || "",
          duration: j.duration,
          status: j.status || "Open",
          description: j.description,
          skills: j.skills || [],
          postedAt: j.postedAt,
        };
        const updated = [newPost, ...postings];
        setPostings(updated);
        sessionStorage.setItem(CACHE_KEY_POSTINGS, JSON.stringify(updated));
        showToast("Internship posted successfully");
      }
      setShowForm(false);
      resetForm();
    } catch (e) {
      console.error("Save failed:", e);
      showToast("Save failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSkeleton = () => (
    <div className="dashboard-content" style={{ opacity: 0.6 }}>
      <div className="section-header" style={{ marginBottom: "24px" }}>
        <div style={{ height: "32px", width: "200px", background: "#f3f4f6", borderRadius: "8px" }}></div>
      </div>
      <div className="postings-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="modern-card" style={{ height: "180px", background: "#f3f4f6", border: "none", boxShadow: "none" }}></div>
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <div className="dashboard-content" style={{ textAlign: "center", padding: "60px 0" }}>
      <div className="modern-card" style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📡</div>
        <h3 style={{ color: "#ef4444", marginBottom: "8px" }}>Network Error</h3>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>We couldn't load your dashboard data. Please check your connection.</p>
        <button className="btn-primary" onClick={fetchDashboardData} style={{ width: "100%" }}>Retry Loading</button>
      </div>
    </div>
  );

  {/* ------------------------------------------------------------------------------------------------------------------------------- */ }
  return (
    <div className="dashboard-wrapper">
      {/* ------------------------------------------------TOAST NOTIFICATION-------------------------------------------------*/}
      {toast.show && (
        <div className={`toast-message ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* ----------------------------------------------HEADER------------------------------------------------------- */}
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
            <div className="user-profile" onClick={() => navigate(`/c/${companyId}/profile`)} style={{ cursor: "pointer" }}>
              <div className="user-avatar">
                {getCompanyInitials(companyInfo.companyName)}
              </div>

              <div className="user-details">
                <span className="user-name">{companyInfo.companyName}</span>
                <span className="user-role">Recruiter</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------SIDE BAR--------------------------------------------------- */}
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button className="nav-item active" onClick={() => navigate(`/c/${companyId}`)}>
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

          <div className="company-mini-card" onClick={() => navigate(`/c/${companyId}/profile`)} style={{ cursor: "pointer" }}>
            <div className="mini-avatar">🏢</div>
            <div className="mini-info">
              <h4>{companyInfo.companyName}</h4>
              <p>{companyInfo.companyEmail}</p>
            </div>
          </div>
        </aside>

        {/* ---------------------------------------------------MAIN CONTENT----------------------------------------------- */}
        {loading && postings.length === 0 ? (
          renderSkeleton()
        ) : fetchError ? (
          renderError()
        ) : (
          <main className="dashboard-content">
            {/* ---------------------------------------------------DASHBOARD SECTION----------------------------------------------- */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">My Internship Postings</h2>
                <span className="count-badge">{postings.length} Active</span>
              </div>

              {/* ---------------------------------------------------POSTINGS GRID----------------------------------------------- */}
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

            {/* ---------------------------------------------------APPLICANTS SECTION----------------------------------------------- */}
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
        )}
      </div>

      {/* ---------------------------------------------------REFINED MODAL FORM----------------------------------------------- */}
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
      {/* ------------------------------------------------------------------------------------------------------------------------------- */}
    </div>
  );
}

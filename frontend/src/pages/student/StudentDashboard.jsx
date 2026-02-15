import { useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Briefcase,
  FileText,
  Bookmark,
  Award,
  Users,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LayoutDashboard
} from "lucide-react";
import InternshipCard from "../../components/InternshipCard";
import "../../pages/student/StudentDashboard.css";
import logo from "../../assets/logo.svg";
import { useEffect } from "react";
import axios from "axios";

function StudentDashboard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ACCOUNT_NAME = state?.fullName || sessionStorage.getItem("userName") || localStorage.getItem("userName") || "Student";
  const ACCOUNT_EMAIL = state?.email || sessionStorage.getItem("userEmail") || localStorage.getItem("userEmail") || "student@example.com";
  const studentId = sessionStorage.getItem("studentId") || localStorage.getItem("studentId") || "demo-student";

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch internships
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
          alert("Please login to access internships");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5001/api/jobs/open", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const jobs = (res.data.jobs || res.data).map((job) => ({
          ...job,
          company: "Recruiter", // temporary
          shortDescription: job.description,
        }));

        setInternships(jobs);

      } catch (err) {
        console.error("Failed to fetch jobs", err);
        alert("Failed to fetch jobs. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // fetch applied internships
  useEffect(() => {
    const fetchApplied = async () => {
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:5001/api/applications/mine",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const appliedJobIds = res.data.applications.map((app) => app.job._id);
        setApplied(appliedJobIds);
      } catch (err) {
        console.error("Failed to fetch applied jobs", err);
      }
    };

    fetchApplied();
  }, []);

  async function handleApply(internship) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      alert("Please login again");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5001/api/applications",
        {
          jobId: internship._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplied((prev) => [...prev, internship._id]);
      alert("Applied successfully");
    } catch (err) {
      if (err.response?.status === 409) {
        alert("You have already applied to this job");
      } else {
        alert("Failed to apply");
      }
      console.error(err);
    }
  }

  async function handleSave(internship) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return alert("Please login again");

    try {
      const url = saved.includes(internship._id)
        ? `/api/saved/${internship._id}/remove`
        : `/api/saved/${internship._id}/add`;

      await axios.post(`http://localhost:5001${url}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSaved((prev) =>
        saved.includes(internship._id)
          ? prev.filter((id) => id !== internship._id)
          : [...prev, internship._id]
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update saved jobs");
    }
  }


  // useEffect(() => {
  //   const fetchJobs = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:5001/api/jobs");
  //       setInternships(res.data.jobs || res.data);
  //     } catch (err) {
  //       console.error("Failed to fetch jobs", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchJobs();
  // }, []);

  // useEffect(() => {
  //   const fetchApplied = async () => {
  //     try {
  //       const token = localStorage.getItem("token");

  //       const res = await fetch("http://localhost:5001/api/applications/mine", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       const data = await res.json();

  //       const appliedJobIds = data.applications.map(
  //         (app) => app.job._id
  //       );

  //       setApplied(appliedJobIds);
  //     } catch (err) {
  //       console.error("Failed to fetch applied jobs", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchApplied();
  // }, []);  

  const [query, setQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");
  const [filterSkill, setFilterSkill] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [saved, setSaved] = useState([]);
  const [applied, setApplied] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const locations = useMemo(
    () => ["All", ...new Set(internships.map((i) => i.location))],
    [internships]
  );

  const skills = useMemo(() => {
    const s = new Set();
    internships.forEach((i) => i.skills.forEach((k) => s.add(k)));
    return ["All", ...Array.from(s)];
  }, [internships]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = internships.filter((i) => {
      if (filterLocation !== "All" && i.location !== filterLocation) return false;
      if (filterSkill !== "All" && !i.skills.includes(filterSkill)) return false;
      if (q) {
        const inText =
          i.title.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.shortDescription.toLowerCase().includes(q) ||
          i.skills.join(" ").toLowerCase().includes(q);
        if (!inText) return false;
      }
      return true;
    });

    if (sortBy === "stipend-low") {
      list = list
        .slice()
        .sort((a, b) => parseStipend(a.stipend) - parseStipend(b.stipend));
    } else if (sortBy === "stipend-high") {
      list = list
        .slice()
        .sort((a, b) => parseStipend(b.stipend) - parseStipend(a.stipend));
    }
    return list;
  }, [internships, query, filterLocation, filterSkill, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSlice = filtered.slice((page - 1) * pageSize, page * pageSize);

  function parseStipend(s) {
    if (!s) return 0;
    if (s.toLowerCase().includes("unpaid")) return 0;
    const num = s.replace(/[^\d]/g, "");
    return Number(num) || 0;
  }

  // function handleApply(internship) {
  //   if (!applied.includes(internship.id)) {
  //     setApplied((prev) => [...prev, internship.id]);
  //   }
  //   console.log("APPLY (UI-only) ->", {
  //     internshipId: internship.id,
  //     internshipTitle: internship.title,
  //   });
  //   setTimeout(
  //     () =>
  //       alert(
  //         `Applied to ${internship.title} at ${internship.company} (UI-only)`
  //       ),
  //     200
  //   );
  // }
  // async function handleApply(internship) {
  //   try {
  //     const token = localStorage.getItem("token");

  //     if (!token) {
  //       alert("Please login again");
  //       return;
  //     }

  //     await axios.post(
  //       `http://localhost:5001/api/applications/${internship._id}/apply`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     setApplied((prev) => [...prev, internship._id]);

  //     alert(`Applied to ${internship.title} at ${internship.company}`);
  //   } catch (err) {
  //     if (err.response?.status === 409) {
  //       alert("You have already applied to this job");
  //     } else {
  //       alert("Failed to apply. Try again.");
  //     }
  //     console.error(err);
  //   }
  // }  

  // function handleSave(internship) {
  //   if (saved.includes(internship._id)) {
  //     setSaved((prev) => prev.filter((id) => id !== internship._id));
  //     console.log("UNSAVE (UI-only)", internship._id);
  //   } else {
  //     setSaved((prev) => [...prev, internship._id]);
  //     console.log("SAVE (UI-only)", internship._id);
  //   }
  // }

  const clearFilters = useCallback(() => {
    setQuery("");
    setFilterLocation("All");
    setFilterSkill("All");
    setSortBy("recent");
    setPage(1);
  }, []);

  const changePage = (n) => {
    setPage(Math.max(1, Math.min(totalPages, n)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  {/* ------------------------------------------------------------------------------------------------------------------------------- */ }
  return (
    <div className="dashboard-wrapper">
      {/* -------------------------------------------HEADER------------------------------------------------------ */}
      <header className="main-header">
        <div className="header-left">
          <img src={logo} alt="TaskLink" className="app-logo" />
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search internships..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            {query && (
              <button className="clear-search" onClick={() => setQuery("")}>
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="header-right">
          <button className="icon-link">
            <Bell size={20} />
            <span className="notif-badge"></span>
          </button>
          <div className="user-nav-chip" onClick={() => navigate(`/s/${studentId}/profile`)}>
            <div className="nav-avatar">
              {ACCOUNT_NAME.charAt(0).toUpperCase()}
            </div>
            <div className="nav-user-info">
              <span className="nav-user-name">{ACCOUNT_NAME}</span>
              <span className="nav-user-email">{ACCOUNT_EMAIL}</span>
            </div>
          </div>
        </div>
      </header>


      {/* -------------------------------------------SIDEBAR------------------------------------------------------ */}
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-group">
              <p className="nav-group-label">Explore</p>
              <button className="nav-link active">
                <Briefcase size={20} />
                <span>Available Internships</span>
              </button>
              <button className="nav-link">
                <FileText size={20} />
                <span>My Applications</span>
              </button>
              <button className="nav-link">
                <Bookmark size={20} />
                <span>Saved Pieces</span>
              </button>
            </div>

            <div className="nav-group">
              <p className="nav-group-label">Career Hub</p>
              <button className="nav-link">
                <Award size={20} />
                <span>Certificates</span>
              </button>
              <button className="nav-link">
                <Users size={20} />
                <span>Mentorship</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* -------------------------------------------MAIN CONTENT------------------------------------------------------ */}
        <main className="dashboard-main">
          {/* -------------------------------------------FILTER & STAT BAR------------------------------------------------------ */}
          <section className="dashboard-toolbar">
            <div className="toolbar-left">
              <div className="select-box">
                <MapPin size={16} className="select-icon" />
                <select
                  value={filterLocation}
                  onChange={(e) => {
                    setFilterLocation(e.target.value);
                    setPage(1);
                  }}
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-box">
                <Filter size={16} className="select-icon" />
                <select
                  value={filterSkill}
                  onChange={(e) => {
                    setFilterSkill(e.target.value);
                    setPage(1);
                  }}
                >
                  {skills.map((sk) => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-box no-icon">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recent">Sort by: Recent</option>
                  <option value="stipend-high">Stipend: High to Low</option>
                  <option value="stipend-low">Stipend: Low to High</option>
                </select>
              </div>

              <button className="btn-inline-reset" onClick={clearFilters}>
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>

            <div className="toolbar-right">
              <div className="compact-stats">
                <div className="mini-stat">
                  <span className="stat-v">{filtered.length}</span>
                  <span className="stat-k">OPEN</span>
                </div>
                <div className="mini-stat">
                  <span className="stat-v">{saved.length}</span>
                  <span className="stat-k">SAVED</span>
                </div>
                <div className="mini-stat">
                  <span className="stat-v">{applied.length}</span>
                  <span className="stat-k">APPLIED</span>
                </div>
              </div>
            </div>
          </section>

          {/* -------------------------------------------INTERNSHIP SECTION------------------------------------------------------ */}
          <section className="feed-section">
            <div className="feed-header">
              <div className="feed-title-group">
                <h2>Recommended Internships</h2>
                <p>Tailored opportunities based on your skills and preferences</p>
              </div>
              <span className="feed-meta-info">Showing {filtered.length} internships</span>
            </div>

            {loading ? (
              <p>Loading internships...</p>
            ) : filtered.length === 0 ? (
              <div className="empty-feed">
                <div className="empty-visual">🔍</div>
                <h3>No internships found</h3>
                <p>Try adjusting your search or filters to see more results.</p>
                <button className="btn-primary" onClick={clearFilters}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="internship-grid">
                  {pageSlice.map((it) => (
                    <InternshipCard
                      key={it._id}
                      internship={it}
                      onApply={handleApply}
                      onSave={handleSave}
                      isSaved={saved.includes(it._id)}
                      isApplied={applied.includes(it._id)}
                    />
                  ))}
                </div>

                {/* -------------------------------------------PAGINATION------------------------------------------------------ */}
                <div className="modern-pagination">
                  <button
                    className="p-nav-btn"
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={20} />
                    <span>Prev</span>
                  </button>

                  <div className="p-numbers">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        className={`p-num-btn ${page === i + 1 ? "active" : ""}`}
                        onClick={() => changePage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="p-nav-btn"
                    onClick={() => changePage(page + 1)}
                    disabled={page === totalPages}
                  >
                    <span>Next</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
      {/* ------------------------------------------------------------------------------------------------------- */}

      {/* -------------------------------------------FOOTER------------------------------------------------------ */}
      <footer className="simple-dash-footer">
        <p>© {new Date().getFullYear()} TaskLink — Building Future Careers</p>
      </footer>
    </div>
  );
}

export default StudentDashboard;
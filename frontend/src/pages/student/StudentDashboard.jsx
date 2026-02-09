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

function StudentDashboard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ACCOUNT_NAME = state?.fullName || "Student";
  const ACCOUNT_EMAIL = state?.email || "student@example.com";

  // Mock data - replace with DB fetch later
  const [internships] = useState([
    {
      id: 1,
      title: "Frontend Web Developer Intern",
      company: "TechNova",
      duration: "3 months",
      location: "Remote",
      stipend: "₹8,000 / month",
      skills: ["React", "HTML", "CSS"],
      shortDescription:
        "Work on customer-facing interfaces using React and build responsive UI components.",
      postedAt: "2 days ago",
    },
    {
      id: 2,
      title: "Java Back-End Intern",
      company: "ByteWorks",
      duration: "2 months",
      location: "Ahmedabad",
      stipend: "₹6,000 / month",
      skills: ["Java", "Spring", "SQL"],
      shortDescription:
        "Develop REST APIs and work with relational databases. Ideal for backend enthusiasts.",
      postedAt: "5 days ago",
    },
    {
      id: 3,
      title: "UI/UX Design Intern",
      company: "CreativeCo",
      duration: "1 month",
      location: "Hybrid - Vadodara",
      stipend: "Unpaid",
      skills: ["Figma", "Prototyping"],
      shortDescription:
        "Design interfaces, create prototypes, and iterate based on user feedback.",
      postedAt: "1 week ago",
    },
    {
      id: 4,
      title: "Fullstack Intern (MERN)",
      company: "StackFlow Labs",
      duration: "4 months",
      location: "Remote",
      stipend: "₹12,000 / month",
      skills: ["MongoDB", "Express", "React", "Node"],
      shortDescription:
        "Build end-to-end features, own modules and deploy to staging environments.",
      postedAt: "3 days ago",
    },
    {
      id: 5,
      title: "Data Science Intern",
      company: "DataWorx",
      duration: "3 months",
      location: "Ahmedabad",
      stipend: "₹10,000 / month",
      skills: ["Python", "Pandas", "ML"],
      shortDescription:
        "Work on real datasets, build features and models to improve product analytics.",
      postedAt: "4 days ago",
    },
    {
      id: 6,
      title: "DevOps Intern",
      company: "CloudOps",
      duration: "2 months",
      location: "Vadodara",
      stipend: "₹9,000 / month",
      skills: ["Docker", "Kubernetes", "CI/CD"],
      shortDescription:
        "Help containerize services and maintain deployment pipelines.",
      postedAt: "6 days ago",
    },
  ]);

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

  function handleApply(internship) {
    if (!applied.includes(internship.id)) {
      setApplied((prev) => [...prev, internship.id]);
    }
    console.log("APPLY (UI-only) ->", {
      internshipId: internship.id,
      internshipTitle: internship.title,
    });
    setTimeout(
      () =>
        alert(
          `Applied to ${internship.title} at ${internship.company} (UI-only)`
        ),
      200
    );
  }

  function handleSave(internship) {
    if (saved.includes(internship.id)) {
      setSaved((prev) => prev.filter((id) => id !== internship.id));
      console.log("UNSAVE (UI-only)", internship.id);
    } else {
      setSaved((prev) => [...prev, internship.id]);
      console.log("SAVE (UI-only)", internship.id);
    }
  }

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

  return (
    <div className="dashboard-wrapper">
      {/* HEADER */}
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
          <div className="user-nav-chip" onClick={() => navigate("/student/profile")}>
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

      <div className="dashboard-layout">
        {/* SIDEBAR */}
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

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          {/* FILTER & STAT BAR */}
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

          {/* INTERNSHIP SECTION */}
          <section className="feed-section">
            <div className="feed-header">
              <div className="feed-title-group">
                <h2>Recommended Internships</h2>
                <p>Tailored opportunities based on your skills and preferences</p>
              </div>
              <span className="feed-meta-info">Showing {filtered.length} internships</span>
            </div>

            {filtered.length === 0 ? (
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
                      key={it.id}
                      internship={it}
                      onApply={handleApply}
                      onSave={handleSave}
                      isSaved={saved.includes(it.id)}
                      isApplied={applied.includes(it.id)}
                    />
                  ))}
                </div>

                {/* PAGINATION */}
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

      <footer className="simple-dash-footer">
        <p>© {new Date().getFullYear()} TaskLink — Building Future Careers</p>
      </footer>
    </div>
  );
}

export default StudentDashboard;
import { Link } from "react-router-dom";
import "../pages/Home.css";
import logo from "../assets/logo.svg";
import textlogo from "../assets/textlogo.png";

import amazon from "../assets/logo-amazon.png";
import google from "../assets/logo-google.png";
import microsoft from "../assets/logo-microsoft.png";
import goldmansachs from "../assets/logo-goldmansachs.png";
import paypal from "../assets/logo-paypal.png";
import samsung from "../assets/logo-samsung.png";
import salesforce from "../assets/logo-salesforce.png";
import netapp from "../assets/logo-netapp.png";
import hitachi from "../assets/logo-hitachi.png";
import jpmorgan from "../assets/logo-jpmorgan.png";
import ibm from "../assets/logo-ibm.png";
import dell from "../assets/logo-dell.png";
import deloitte from "../assets/logo-deloitte.png";
import kpmg from "../assets/logo-kpmg.png";
import isro from "../assets/logo-isro.png";
import mercedes from "../assets/logo-mercedes.png";
import ey from "../assets/logo-ey.png";
import airtel from "../assets/logo-airtel.png";
import apple from "../assets/logo-apple.png";
import lt from "../assets/logo-lt.png";

function Home()
{
  const companies = [ amazon, google, microsoft, apple, goldmansachs, paypal, samsung, salesforce, lt, netapp, hitachi, jpmorgan, ibm, dell, deloitte, kpmg, isro, mercedes, ey, airtel ];

  const achievements = [
    { company: "Citi Bank", offer: "Rs 22.7 LPA (CTC)", student: "Amrutha Anand" },
    { company: "Fastenal", offer: "Rs 17 LPA (CTC)", student: "Divyang Awasthi" },
    { company: "TechCorp", offer: "Rs 15 LPA (CTC)", student: "Riya Patel" },
    { company: "Lambda Inc.", offer: "Rs 11 LPA (CTC)", student: "Sahil Shah" },
  ];

  const testimonials = [
    {
      name: "Kunal Shah",
      role: "SDE @ ExampleCorp",
      quote:
        "TaskLink's project-driven tracks and mentorship helped me go from beginner to placed in under 6 months."
    },
    {
      name: "Priya Mehta",
      role: "Fullstack Intern",
      quote:
        "The hands-on assignments mirrored real work — I walked into interviews with confidence and got multiple offers."
    },
    {
      name: "Aman Verma",
      role: "ML Intern",
      quote:
        "Clear learning paths, quick feedback, and real projects — the best preparation for technical roles."
    }
  ];

  return (
    <div className="home-page">
{/* ------------------------------------------------------------Header------------------------------------------------------------ */}
      <header className="nav">
        <div className="container nav-row">
          <Link to="/" className="brand">
            <img src={logo} alt="TaskLink" className="brand-logo" />
          </Link>

          <nav className="links">
            <Link to="/courses" className="link">Courses</Link>
            <Link to="/results" className="link">Our Results</Link>
            <Link to="/projects" className="link">Projects</Link>
            <Link to="/resources" className="link">Resources</Link>
          </nav>

          <div className="auth">
            <Link to="/login" className="btn small ghost">Log in</Link>
            <Link to="/signup" className="btn small primary">Sign up</Link>
          </div>
        </div>
      </header>

{/* ------------------------------------------------------------INTRO------------------------------------------------------------ */}
      <section className="hero container">
        <div className="hero-left">
          <h1>
            Connect Students with <span className="gradient-text">Internship Opportunities</span>
          </h1>
          <p className="lead">
            A smart platform where companies post internships and students apply seamlessly. 
            Empowering young talent with real-world exposure and career-building opportunities.
          </p>

          <div className="cta-row">
            <Link to="/signup" className="btn large primary">Get Started</Link>
            <Link to="/about" className="btn large ghost">How it works</Link>
          </div>

          <div className="mini-stats">
            <div><strong>1200+</strong> students placed</div>
            <div><strong>300+</strong> hiring companies</div>
            <div><strong>4.8/5</strong> average rating</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <img src={textlogo} alt="student-placeholder" className="hero-deco" />
            <div className="hero-card-inner">
              <h2>Internships that Lead to Real Careers</h2>
              <p>
                TaskLink bridges the gap between talent and opportunity — start your journey today!
              </p>
              <div className="tiny-cta">
                <Link to="/courses" className="btn tiny primary">Browse tracks</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* ------------------------------------------------------------TESTIMONIALS------------------------------------------------------------ */}
      <section className="container section">
        <div className="section-head">
          <h2>What students say</h2>
          <p className="muted">Stories from learners who landed internships and placement offers.</p>
        </div>

        <div className="test-grid">
          {testimonials.map((t, i) => (
            <article className="test-card" key={i}>
              <div className="quote-mark">“</div>
              <p className="quote">{t.quote}</p>
              <div className="author">
                <div className="name">{t.name}</div>
                <div className="role muted">{t.role}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

{/* ------------------------------------------------------------COMPANY LOGOS------------------------------------------------------------ */}
      <section className="container section">
        <div className="section-head">
          <h2>Trusted by top companies</h2>
          <p className="muted">Companies that hired TaskLink students</p>
        </div>

        <div className="companies-grid">
          {companies.map((src, i) => (
            <div className="company" key={i}>
              <img src={src} alt={`company-${i}`} />
            </div>
          ))}
        </div>
      </section>

{/* ------------------------------------------------------------ACHIEVEMENTS------------------------------------------------------------ */}
      <section className="container section">
        <div className="section-head">
          <h2>Recent student achievements</h2>
          <p className="muted">Real offers from our students</p>
        </div>

        <div className="achieve-grid">
          {achievements.map((a, i) => (
            <div className="ach-card" key={i}>
              <div className="ach-top">
                <div className="company-name">{a.company}</div>
                <div className="offer">{a.offer}</div>
              </div>
              <div className="ach-body">
                <div className="student-name">{a.student}</div>
                <div className="muted">Internship → Full-time success</div>
              </div>
            </div>
          ))}
        </div>
      </section>

{/* ------------------------------------------------------------FOOTER------------------------------------------------------------ */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="TaskLink" className="footer-logo" />
            <p className="muted">Where practical skills meet opportunity. Build projects, get hired.</p>
          </div>

          <div>
            <h4>Products</h4>
            <ul>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/internships">Internships</Link></li>
              <li><Link to="/projects">Projects</Link></li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4>Get in touch</h4>
            <p className="muted">support@tasklink.example</p>
            <p className="muted">Mon - Fri, 10am - 6pm</p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">&copy; {new Date().getFullYear()} TaskLink · All rights reserved</div>
        </div>
      </footer>
{/* ------------------------------------------------------------------------------------------------------------------------------- */}
    </div>
  );
}

export default Home;
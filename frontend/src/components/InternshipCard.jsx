// src/components/InternshipCard.jsx
import React from "react";
import {
  MapPin,
  Clock,
  Wallet,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Users
} from "lucide-react";
import "./InternshipCard.css";

export default function InternshipCard({
  internship,
  onApply = () => { },
  onSave = () => { },
  isSaved = false,
  isApplied = false
}) {
  const {
    id,
    title,
    company,
    location,
    duration,
    stipend,
    skills = [],
    shortDescription,
    postedAt = "Recently"
  } = internship;

  // Show max 3 skills, then +N more
  const displayedSkills = skills.slice(0, 3);
  const remainingSkills = skills.length - 3;

  return (
    <article className="internship-card" aria-labelledby={`intern-title-${id}`}>
      {/* Top section: Branding and Status */}
      <div className="card-top">
        <div className="company-branding">
          <span className="company-name">{company}</span>
          <h3 id={`intern-title-${id}`} className="internship-title">{title}</h3>
        </div>
        <div className="card-badges">
          <span className="posted-at">{postedAt}</span>
          <span className="status-badge">Open</span>
        </div>
      </div>

      {/* Meta Info: Location, Duration, Stipend */}
      <div className="meta-row">
        <div className="meta-item">
          <MapPin size={16} className="meta-icon" />
          <span>{location}</span>
        </div>
        <div className="meta-item">
          <Clock size={16} className="meta-icon" />
          <span>{duration}</span>
        </div>
        <div className="meta-item">
          <Wallet size={16} className="meta-icon" />
          <span>{stipend || "Unpaid"}</span>
        </div>
      </div>

      {/* Description: Clamped to 2 lines */}
      <p className="internship-description">
        {shortDescription}
      </p>

      {/* Skills Chips */}
      <div className="skills-row">
        {displayedSkills.map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
          </span>
        ))}
        {remainingSkills > 0 && (
          <span className="more-skills">+{remainingSkills} more</span>
        )}
      </div>

      {/* Actions Row */}
      <div className="card-actions">
        <div className="applicants-info">
          <Users size={14} />
          <span>Active hiring</span>
        </div>

        <div className="action-btns">
          <button
            className={`btn-save ${isSaved ? 'active' : ''}`}
            onClick={() => onSave(internship)}
            title={isSaved ? "Saved" : "Save for later"}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            className="btn-apply"
            onClick={() => onApply(internship)}
            disabled={isApplied}
          >
            {isApplied ? (
              <span className="btn-content">
                <CheckCircle size={16} /> Applied
              </span>
            ) : (
              "Apply Now"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

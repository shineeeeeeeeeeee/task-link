import React from "react";

function Button({ type = "button", text = "Button", onClick, disabled }) {
  return (
    <button
      type={type}
      className="primary-btn"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}>
      <span className="btn-content">{text}</span>
      <span className="btn-glow" aria-hidden="true" />
    </button>
  );
}

export default Button;
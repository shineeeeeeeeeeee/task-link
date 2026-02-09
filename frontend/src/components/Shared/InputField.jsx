import "./InputField.css";

export default function InputField({ label, value, onChange, type = "text", placeholder, autoComplete}) 
{
  return (
    <div className={`field floating ${value ? "filled" : ""}`}>
      <input
        className="field-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
      <label className="field-label">{label}</label>
    </div>
  );
}

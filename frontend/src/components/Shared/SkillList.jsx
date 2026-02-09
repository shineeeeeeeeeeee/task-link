import { useState, useRef, useEffect } from "react";
import "../../pages/auth/StudentMandatoryDetails.css";

function SkillList({ initialSkills = [], onChange = () => {} }) 
{
  const [items, setItems] = useState(initialSkills || []);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    onChange(items);
  }, [items]);

  function addItem() 
  {
    const v = value.trim();
    if(!v) return;
    setItems((prev) => [...prev, v]);
    setValue("");
    inputRef.current?.focus();
  }

  function handleAddClick(event) {
    event.preventDefault();
    addItem();
  }

  function handleKeyDown(event) {
    if(event.key === "Enter") {
      event.preventDefault();
      addItem();
    }
  }

  function handleRemove(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="skill-list">
      <div className="skill-form" role="group" aria-label="Add skills">
        <input
          ref={inputRef}
          className="skill-input"
          placeholder="Add a skill and press +"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Add skill"
        />
        <button
          type="button"
          className="skill-add-btn"
          onClick={handleAddClick}
          aria-label="Add skill"
        >+</button>
      </div>

      <div className="skill-tags" aria-live="polite">
        {items.length === 0 ? 
        (<div className="muted">&nbsp;&nbsp; No skills added yet.</div>) : 
          (items.map((s, i) => (
            <div key={i} className="skill-tag">
              <span className="skill-name">{s}</span>
              <button
                type="button"
                className="skill-remove"
                onClick={() => handleRemove(i)}
                aria-label={`Remove ${s}`}
              >×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SkillList;
// components/AlertModal.js
import '../styles/alertmodal.css';

export default function AlertModal({ type = "error", title = "Incomplete Story", message, onClose }) {
  const emoji = type === "success" ? "🎉" : "🚨";
  const titleColor = type === "success" ? "#4B0082" : "#cc0000";

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-title" style={{ color: titleColor }}>
          {emoji} {title}
        </h2>
        <div className="modal-message">
          {message}
        </div>
        <div className="modal-actions">
          <button className="button button-primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

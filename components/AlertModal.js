// components/AlertModal.js
import '../styles/alertmodal.css';

export default function AlertModal({
  type = "error",
  title = "Incomplete Story",
  message,
  onClose,
  onConfirm,
  confirmLabel = "OK",
  emoji: customEmoji
}) {
  const emoji = customEmoji !== undefined
    ? customEmoji
    : type === "success"
      ? "🎉"
      : "🚨";

  const titleColor = type === "success" ? "#4B0082" : "#4B0082";

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
      <h2 className="modal-title" style={{ color: titleColor }}>
        {emoji && <span>{emoji} </span>}{title}
      </h2>

        <div className="modal-message">{message}</div>
        <div className="modal-actions">
          {onClose && (
            <button className="button button-secondary" onClick={onClose}>
              {onConfirm ? "Back" : confirmLabel}
            </button>
          )}
          {onConfirm && (
            <button className="button button-primary" onClick={onConfirm}>
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

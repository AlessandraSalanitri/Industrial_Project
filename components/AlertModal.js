// components/AlertModal.js
import { useEffect, useState } from 'react';
import '../styles/alertmodal.css';

export default function AlertModal({
  type = "error",
  title = "Incomplete Story",
  message,
  onClose,
  onConfirm,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  emoji: customEmoji
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("🔍 Modal mounted with props:", { title, message, type });
  }, []);

  if (!mounted) return null; // prevent hydration mismatch

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
          {onConfirm && (
            <button className="button button-primary" onClick={onConfirm}>
              {confirmLabel}
            </button>
          )}
          {onClose && (
            <button className="button button-secondary" onClick={onClose}>
              {cancelLabel || "Cancel"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

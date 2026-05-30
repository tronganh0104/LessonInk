import React from "react";

interface RecoveryModalProps {
  projectTitle: string;
  onRecover: () => void;
  onDiscard: () => void;
}

export function RecoveryModal({ projectTitle, onRecover, onDiscard }: RecoveryModalProps) {
  return (
    <div className="recovery-modal-overlay">
      <div className="recovery-modal-content" style={{ maxWidth: "440px", borderRadius: "16px", padding: "32px", boxShadow: "var(--shadow-md)" }}>
        <h3 style={{ marginBottom: "12px", fontSize: "1.5rem", fontWeight: 800 }}>Recover Lesson?</h3>
        <p style={{ marginBottom: "24px", color: "var(--color-muted)", lineHeight: 1.6 }}>
          The application found an unsaved session for <strong>"{projectTitle}"</strong>. 
          Would you like to restore your work?
        </p>
        <div className="recovery-modal-actions" style={{ display: "flex", gap: "12px" }}>
          <button
            className="primary-button"
            type="button"
            onClick={onRecover}
            style={{ flex: 1 }}
          >
            Yes, recover
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={onDiscard}
            style={{ flex: 1 }}
          >
            No, discard
          </button>
        </div>
      </div>
    </div>
  );
}

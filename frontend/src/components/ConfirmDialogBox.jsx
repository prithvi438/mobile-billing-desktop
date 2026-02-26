import React from "react";
import { FiX, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const BRAND = {
  primary: "#0B3A6F",
  accent: "#F57C00",
  danger: "#EF4444",
  text: "#1E293B",
  textMuted: "#64748B",
  glass: "rgba(255, 255, 255, 0.8)",
  border: "rgba(255, 255, 255, 0.5)",
};

const ConfirmDialogBox = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  type = "normal", // normal | destructive
}) => {
  if (!open) return null;

  const isDestructive = type === "destructive";
  const themeColor = isDestructive ? BRAND.danger : BRAND.primary;

  return (
    <>
      {/* Entrance Animation */}
      <style>
        {`
          @keyframes dialogAppear {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes overlayFade {
            from { background: rgba(15, 23, 42, 0); }
            to { background: rgba(15, 23, 42, 0.6); }
          }
        `}
      </style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(4px)",
          animation: "overlayFade 0.3s forwards",
        }}
      >
        <div
          style={{
            width: 400,
            background: "#FFFFFF",
            borderRadius: 24,
            padding: "32px 28px",
            position: "relative",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            textAlign: "center",
            animation: "dialogAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* TOP ICON - Contextual */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: isDestructive ? `${BRAND.danger}15` : `${BRAND.primary}10`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              color: themeColor,
            }}
          >
            {isDestructive ? (
              <FiAlertTriangle size={32} />
            ) : (
              <FiCheckCircle size={32} />
            )}
          </div>

          {/* CLOSE ICON */}
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "transparent",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 20,
              color: BRAND.textMuted,
              padding: 4,
              borderRadius: "50%",
              display: "flex",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FiX />
          </button>

          {/* TITLE */}
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: BRAND.text,
              marginBottom: 10,
              letterSpacing: "-0.5px",
            }}
          >
            {title}
          </h3>

          {/* MESSAGE */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: BRAND.textMuted,
              marginBottom: 32,
              padding: "0 10px",
              fontWeight: 500,
            }}
          >
            {message}
          </p>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: 14,
            }}
          >
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 14,
                border: "none",
                background: "#F1F5F9",
                color: BRAND.text,
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1.2,
                padding: "14px 0",
                borderRadius: 14,
                border: "none",
                background: themeColor,
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: isDestructive 
                  ? `0 10px 15px -3px ${BRAND.danger}40`
                  : `0 10px 15px -3px ${BRAND.primary}40`,
                opacity: loading ? 0.7 : 1,
                transition: "0.2s",
              }}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialogBox;
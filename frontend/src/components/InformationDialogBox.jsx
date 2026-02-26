import React from "react";
import { FiX, FiInfo } from "react-icons/fi";

const InformationDialogBox = ({
    open,
    title,
    message,
    buttonText = "OK",
    onClose,
    type = "info", // info | success | warning | error
}) => {
    if (!open) return null;

    const config = {
        info: {
            color: "#0B3A6F",
            background: "#EFF6FF",
            icon: <FiInfo size={28} />,
        },
        success: {
            color: "#16A34A",
            background: "#ECFDF5",
            icon: <FiInfo size={28} />,
        },
        warning: {
            color: "#D97706",
            background: "#FFFBEB",
            icon: <FiInfo size={28} />,
        },
        error: {
            color: "#DC2626",
            background: "#FEF2F2",
            icon: <FiInfo size={28} />,
        },
    };

    const { color, background, icon } = config[type];

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    width: 360,
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: 24,
                    position: "relative",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    textAlign: "center",
                }}
            >
                {/* CLOSE ICON */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "#475569",
                    }}
                >
                    <FiX />
                </button>

                {/* ICON */}
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}
                >
                    {icon}
                </div>

                {/* TITLE */}
                <h3
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color,
                        marginBottom: 12,
                    }}
                >
                    {title}
                </h3>

                {/* MESSAGE */}
                <p
                    style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#374151",
                        marginBottom: 24,
                    }}
                >
                    {message}
                </p>

                {/* ACTION */}
                <button
                    onClick={onClose}
                    style={{
                        width: "100%",
                        padding: "10px 0",
                        borderRadius: 10,
                        border: "none",
                        background: color,
                        color: "#FFFFFF",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default InformationDialogBox;

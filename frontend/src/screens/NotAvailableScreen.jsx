import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft, FiHelpCircle } from "react-icons/fi";
import logo from "../assets/logo.svg";


const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.8)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8",
};

const NotAvailableScreen = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.glassCard}>
                {/* LOGO SECTION */}
                <div style={styles.iconWrapper}>
                    <div style={styles.iconCircle}>
                        {/* Replaced Icon with logo.svg from public folder */}
                        <img
                            src={logo}
                            alt="Daksh Logo"
                            style={{ width: "60px", height: "60px", objectFit: "contain" }}
                        />
                    </div>
                    {/* Subtle background pulse effect */}
                    <div style={styles.pulseRing} />
                </div>

                {/* TEXT CONTENT */}
                <h1 style={styles.errorCode}>404 Error</h1>
                <h2 style={styles.title}>Oops! Page Not Found</h2>
                <p style={styles.description}>
                    The page you are looking for might have been moved, deleted,
                    or perhaps the URL is incorrect. Let's get you back on track.
                </p>

                {/* BUTTON CONTAINER */}
                <div style={styles.buttonGroup}>
                    <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={18} /> Go Back
                    </button>

                    <button style={styles.primaryBtn} onClick={() => navigate("/landing/dashboard")}>
                        <FiHome size={18} /> Go to Dashboard
                    </button>
                </div>

                {/* FOOTER INFO */}
                <div style={styles.footer}>
                    <FiHelpCircle size={14} />
                    <span>If you think this is a mistake, please contact support.</span>
                </div>
            </div>
        </div>
    );
};

export default NotAvailableScreen;

/* ---------- STYLES ---------- */
// styles remain exactly the same as your provided code
const styles = {
    container: {
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.bg,
        backgroundImage: `radial-gradient(at 0% 0%, rgba(11, 58, 111, 0.05) 0, transparent 50%), 
                      radial-gradient(at 100% 100%, rgba(245, 124, 0, 0.03) 0, transparent 50%)`,
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
    },
    glassCard: {
        maxWidth: "560px",
        width: "100%",
        background: BRAND.glass,
        backdropFilter: "blur(12px)",
        borderRadius: "32px",
        border: `1px solid ${BRAND.border}`,
        padding: "60px 40px",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    iconWrapper: {
        position: "relative",
        marginBottom: "32px",
    },
    iconCircle: {
        width: "100px",
        height: "100px",
        borderRadius: "30px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 25px rgba(11, 58, 111, 0.1)",
        zIndex: 2,
        position: "relative",
    },
    pulseRing: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "130px",
        height: "130px",
        borderRadius: "40px",
        border: `2px solid ${BRAND.primary}10`,
        zIndex: 1,
    },
    errorCode: {
        fontSize: "14px",
        fontWeight: 800,
        color: BRAND.accent,
        margin: 0,
        letterSpacing: "4px",
        textTransform: "uppercase",
        marginBottom: "8px",
    },
    title: {
        fontSize: "32px",
        fontWeight: 900,
        color: BRAND.primary,
        margin: "0 0 16px 0",
        letterSpacing: "-0.5px",
    },
    description: {
        fontSize: "16px",
        color: BRAND.textMuted,
        lineHeight: "1.6",
        margin: "0 0 40px 0",
        maxWidth: "400px",
    },
    buttonGroup: {
        display: "flex",
        gap: "16px",
        width: "100%",
        justifyContent: "center",
        marginBottom: "40px",
    },
    primaryBtn: {
        background: BRAND.primary,
        color: "#fff",
        border: "none",
        padding: "14px 28px",
        borderRadius: "16px",
        fontWeight: 700,
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        boxShadow: `0 8px 20px ${BRAND.primary}25`,
        transition: "transform 0.2s ease",
    },
    secondaryBtn: {
        background: "#fff",
        color: BRAND.text,
        border: `1px solid ${BRAND.border}`,
        padding: "14px 28px",
        borderRadius: "16px",
        fontWeight: 600,
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    footer: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: BRAND.textMuted,
        fontWeight: 500,
    },
};
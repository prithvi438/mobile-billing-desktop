import React from "react";
import { FiAlertCircle, FiPhoneCall, FiMessageCircle, FiLock, FiGlobe } from "react-icons/fi";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    danger: "#EF4444",
    bg: "#F1F5F9",
    glass: "rgba(255, 255, 255, 0.8)",
    border: "rgba(255, 255, 255, 0.5)",
    text: "#1E293B",
};

const SubscriptionEndScreen = () => {
    const supportNumber = "9234111462";

    const handleCall = () => {
        window.location.href = `tel:${supportNumber}`;
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent("Hello, my subscription has ended. I want to renew my Daksh ERP account.");
        window.open(`https://wa.me/91${supportNumber}?text=${message}`, "_blank");
    };

    return (
        <div style={styles.container}>
            {/* BACKGROUND DECORATION */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            <div style={styles.glassCard}>
                {/* ICON HEADER */}
                <div style={styles.iconWrapper}>
                    <div style={styles.iconCircle}>
                        <FiLock size={40} color={BRAND.danger} />
                    </div>
                    <div style={styles.pulseRing} />
                </div>

                {/* TEXT CONTENT */}
                <h1 style={styles.title}>Subscription Ended</h1>
                <p style={styles.subtitle}>
                    Access to your **EasyHai ERP** dashboard and billing services has been restricted
                    because your subscription and grace period have expired.
                </p>

                {/* RESTRICTION NOTICE */}
                <div style={styles.warningBox}>
                    <FiAlertCircle size={18} />
                    <span>Inventory, Sales, and Reports are currently locked.</span>
                </div>

                {/* ACTION BUTTONS */}
                <div style={styles.buttonGroup}>
                    <button style={styles.primaryBtn} onClick={handleCall}>
                        <FiPhoneCall size={18} />
                        Call Support to Renew
                    </button>

                    <button style={styles.whatsappBtn} onClick={handleWhatsApp}>
                        <FiMessageCircle size={18} />
                        WhatsApp for Instant Renewal
                    </button>
                </div>

                {/* FOOTER */}
                <div style={styles.footer}>
                    <FiGlobe size={14} />
                    <span>easyhai.in</span>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionEndScreen;

/* ---------- STYLES ---------- */

const styles = {
    container: {
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.bg,
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
    },
    // Floating decorative blobs to match your dashboard's radial-gradient vibe
    blob1: {
        position: "absolute", top: "-10%", left: "-5%", width: "400px", height: "400px",
        background: "rgba(11, 58, 111, 0.05)", borderRadius: "50%", filter: "blur(80px)"
    },
    blob2: {
        position: "absolute", bottom: "-10%", right: "-5%", width: "400px", height: "400px",
        background: "rgba(245, 124, 0, 0.05)", borderRadius: "50%", filter: "blur(80px)"
    },
    glassCard: {
        width: "100%",
        maxWidth: "500px",
        background: BRAND.glass,
        backdropFilter: "blur(20px)",
        borderRadius: "32px",
        border: `1px solid ${BRAND.border}`,
        padding: "60px 40px",
        textAlign: "center",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        /* Optimization for Electron Scroll Smoothness we discussed earlier */
        transform: "translateZ(0)",
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
        boxShadow: "0 10px 25px rgba(239, 68, 68, 0.15)",
        position: "relative",
        zIndex: 2,
    },
    pulseRing: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "130px",
        height: "130px",
        borderRadius: "40px",
        border: `2px solid ${BRAND.danger}20`,
        zIndex: 1,
    },
    title: {
        fontSize: "32px",
        fontWeight: 900,
        color: BRAND.primary,
        margin: "0 0 16px 0",
        letterSpacing: "-1px",
    },
    subtitle: {
        fontSize: "15px",
        color: "#64748B",
        lineHeight: "1.6",
        margin: "0 0 32px 0",
        maxWidth: "380px",
    },
    warningBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(239, 68, 68, 0.08)",
        padding: "12px 20px",
        borderRadius: "12px",
        color: BRAND.danger,
        fontSize: "13px",
        fontWeight: 700,
        marginBottom: "40px",
    },
    buttonGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
    },
    primaryBtn: {
        background: BRAND.primary,
        color: "#fff",
        border: "none",
        padding: "16px",
        borderRadius: "16px",
        fontWeight: 700,
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        cursor: "pointer",
        boxShadow: `0 10px 20px ${BRAND.primary}25`,
        transition: "transform 0.2s ease",
    },
    whatsappBtn: {
        background: "#fff",
        color: "#16A34A",
        border: "1px solid #BBF7D0",
        padding: "16px",
        borderRadius: "16px",
        fontWeight: 700,
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    footer: {
        marginTop: "40px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        color: "#94A3B8",
        fontWeight: 600,
    }
};
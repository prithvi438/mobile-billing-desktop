import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FiAlertTriangle, FiPhoneCall, FiMessageCircle,
    FiArrowRight, FiClock, FiShieldOff
} from "react-icons/fi";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    warning: "#F59E0B",
    danger: "#EF4444",
    bg: "#F1F5F9",
    glass: "rgba(255, 255, 255, 0.8)",
    border: "rgba(255, 255, 255, 0.5)",
    text: "#1E293B",
};

const SubscriptionRenewScreen = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    // Extracting data passed from the auth/app wrapper
    const subscription = state?.subscriptionData?.subscription;
    const supportNumber = "9234111462";

    // Logic for Grace Period calculation
    const periodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : new Date();
    const graceDays = subscription?.gracePeriodDays || 0;
    const graceEndDate = new Date(periodEnd);
    graceEndDate.setDate(graceEndDate.getDate() + graceDays);

    const diffTime = graceEndDate - new Date();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const handleCall = () => window.location.href = `tel:${supportNumber}`;

    const handleWhatsApp = () => {
        const msg = encodeURIComponent("Hello, my Daksh subscription has expired. I want to renew.");
        window.open(`https://wa.me/91${supportNumber}?text=${msg}`, "_blank");
    };

    const skipAndContinue = () => navigate("/landing/dashboard");

    return (
        <div style={styles.container}>
            {/* AMBIENT BACKGROUND */}
            <div style={styles.blob} />

            <div style={styles.glassCard}>
                {/* WARNING HEADER */}
                <div style={styles.iconWrapper}>
                    <div style={styles.iconCircle}>
                        <FiAlertTriangle size={42} color={BRAND.warning} />
                    </div>
                </div>

                <h1 style={styles.title}>Subscription Expired</h1>

                <p style={styles.subtitle}>
                    Your premium plan ended on <strong>{periodEnd.toLocaleDateString('en-IN')}</strong>.
                    You are currently using the grace period access.
                </p>

                {/* GRACE PERIOD TICKET */}
                <div style={{
                    ...styles.graceBox,
                    color: daysRemaining <= 2 ? BRAND.danger : BRAND.warning,
                    background: daysRemaining <= 2 ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)"
                }}>
                    <FiClock size={18} />
                    <span>{daysRemaining} Day(s) remaining in grace period</span>
                </div>

                {/* MAIN ACTIONS */}
                <div style={styles.buttonGroup}>
                    <button style={styles.primaryBtn} onClick={handleCall}>
                        <FiPhoneCall size={18} />
                        Call to Renew Now
                    </button>

                    <button style={styles.whatsappBtn} onClick={handleWhatsApp}>
                        <FiMessageCircle size={18} />
                        WhatsApp Support
                    </button>

                    <button style={styles.skipBtn} onClick={skipAndContinue}>
                        Skip & Continue to Dashboard <FiArrowRight size={14} />
                    </button>
                </div>

                {/* SAFETY NOTICE */}
                <div style={styles.footerNote}>
                    <FiShieldOff size={12} />
                    <span>Avoid data lockout by renewing before the timer hits zero.</span>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionRenewScreen;

/* ---------- STYLES ---------- */

const styles = {
    container: {
        height: "100vh", width: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", background: BRAND.bg, overflow: "hidden",
        position: "relative", fontFamily: "'Inter', sans-serif",
    },
    blob: {
        position: "absolute", width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(245, 124, 0, 0.08) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(60px)", zIndex: 1
    },
    glassCard: {
        width: "100%", maxWidth: "520px", background: BRAND.glass,
        backdropFilter: "blur(24px)", borderRadius: "32px",
        border: `1px solid ${BRAND.border}`, padding: "50px 45px",
        textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
        zIndex: 10, display: "flex", flexDirection: "column",
        alignItems: "center", transform: "translateZ(0)", // Electron optimization
    },
    iconWrapper: { marginBottom: "28px" },
    iconCircle: {
        width: "90px", height: "90px", borderRadius: "28px",
        background: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", boxShadow: "0 12px 20px rgba(245, 158, 11, 0.15)",
    },
    title: {
        fontSize: "28px", fontWeight: 800, color: BRAND.primary,
        margin: "0 0 12px 0", letterSpacing: "-0.5px",
    },
    subtitle: {
        fontSize: "15px", color: "#64748B", lineHeight: "1.6",
        margin: "0 0 24px 0", maxWidth: "400px",
    },
    graceBox: {
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 24px", borderRadius: "100px",
        fontSize: "14px", fontWeight: 700, marginBottom: "35px",
        border: "1px solid rgba(0,0,0,0.03)"
    },
    buttonGroup: {
        display: "flex", flexDirection: "column", gap: "14px", width: "100%",
    },
    primaryBtn: {
        background: BRAND.primary, color: "#fff", border: "none",
        padding: "16px", borderRadius: "16px", fontWeight: 700,
        fontSize: "15px", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "12px", cursor: "pointer",
        boxShadow: `0 10px 20px ${BRAND.primary}20`, transition: "0.2s"
    },
    whatsappBtn: {
        background: "#fff", color: "#16A34A", border: "1px solid #BBF7D0",
        padding: "16px", borderRadius: "16px", fontWeight: 700,
        fontSize: "15px", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "12px", cursor: "pointer", transition: "0.2s"
    },
    skipBtn: {
        background: "transparent", color: "#64748B", border: "none",
        padding: "12px", fontSize: "14px", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "8px", cursor: "pointer", marginTop: "8px", opacity: 0.8
    },
    footerNote: {
        marginTop: "30px", display: "flex", alignItems: "center",
        gap: "6px", fontSize: "11px", color: "#94A3B8", fontWeight: 500,
    }
};
import React, { useState } from "react";
import { FiChevronRight, FiPrinter, FiFileText, FiUser, FiShield } from "react-icons/fi";
import PrinterSettings from "../components/settings/PrinterSettings.jsx";
import BillSettings from "../components/settings/BillSettings.jsx";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8",
};

const SettingScreen = () => {
    const [activeTab, setActiveTab] = useState("printer");

    const menuItems = [
        { id: "printer", label: "Printer Setting", icon: <FiPrinter />, desc: "Configure hardware" },
        { id: "bill", label: "Bill Setting", icon: <FiFileText />, desc: "Format & design" },
        { id: "profile", label: "Business Profile", icon: <FiUser />, desc: "Edit info", disabled: true },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>System Settings<span style={{ color: BRAND.accent }}>.</span></h2>
                <p style={styles.subtitle}>Manage your application preferences</p>
            </div>

            <div style={styles.layout}>
                <div style={styles.sidebar}>
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => !item.disabled && setActiveTab(item.id)}
                            style={{
                                ...styles.menuItem,
                                backgroundColor: activeTab === item.id ? BRAND.primary : "#fff",
                                opacity: item.disabled ? 0.5 : 1,
                                cursor: item.disabled ? "not-allowed" : "pointer",
                                border: activeTab === item.id ? `1px solid ${BRAND.primary}` : `1px solid ${BRAND.border}`
                            }}
                        >
                            <div style={{ ...styles.iconBox, color: activeTab === item.id ? BRAND.primary : BRAND.primary, background: activeTab === item.id ? '#fff' : 'rgba(0,0,0,0.03)' }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: activeTab === item.id ? "#fff" : BRAND.text }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: "11px", color: activeTab === item.id ? "rgba(255,255,255,0.7)" : BRAND.textMuted }}>
                                    {item.desc}
                                </div>
                            </div>
                            <FiChevronRight color={activeTab === item.id ? "#fff" : BRAND.border} />
                        </div>
                    ))}
                </div>

                <div style={styles.content}>
                    {activeTab === "printer" && <PrinterSettings />}
                    {activeTab === "bill" && <BillSettings />}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: "32px", background: BRAND.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: "32px" },
    title: { margin: 0, fontSize: "26px", fontWeight: 800, color: BRAND.primary, letterSpacing: "-0.5px" },
    subtitle: { margin: "4px 0 0", color: BRAND.textMuted, fontSize: "14px" },
    layout: { display: "flex", gap: "32px", alignItems: "flex-start" },
    sidebar: { width: "320px", display: "flex", flexDirection: "column", gap: "12px" },
    menuItem: { padding: "16px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px", transition: "0.2s ease" },
    iconBox: { width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
    content: { flex: 1 },
};

export default SettingScreen;
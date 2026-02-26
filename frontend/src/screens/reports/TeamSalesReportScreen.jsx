import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    FiArrowLeft, FiCalendar, FiDownload, FiUsers, 
    FiTrendingUp, FiDollarSign, FiSmartphone, FiCreditCard, FiFilter 
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#334155",
    textMuted: "#94A3B8",
    success: "#10B981",
    info: "#3B82F6"
};

const TeamSalesReportScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    /* ================= STATE ================= */
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(firstDay);
    const [toDate, setToDate] = useState(today);

    /* ================= API CALL ================= */

    const fetchTeamSales = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/reports/team-sales`, {
                params: { fromDate, toDate },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setTeamData(res.data.data);
            }
        } catch (err) {
            console.error("Team Sales Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, token]);

    useEffect(() => {
        fetchTeamSales();
    }, [fetchTeamSales]);

    const handleExport = () => {
        const headers = ["Member Name", "Email", "Total Bills", "Total Revenue", "Cash", "UPI", "Card", "Credit"];
        const rows = teamData.map(m => [
            `"${m.userName}"`,
            m.userEmail,
            m.totalBills,
            m.totalRevenue,
            m.cashTotal,
            m.upiTotal,
            m.cardTotal,
            m.creditTotal
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Team_Sales_${fromDate}_to_${toDate}.csv`;
        link.click();
    };

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: { padding: "32px", background: BRAND.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
        titleGroup: { display: "flex", alignItems: "center", gap: "16px" },
        backBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "#fff", color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
        
        filterBar: { display: "flex", alignItems: "center", gap: "16px", background: "#fff", padding: "14px 24px", borderRadius: "20px", marginBottom: "32px", border: `1px solid ${BRAND.border}` },
        dateInput: { border: "none", background: "#F1F5F9", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: BRAND.text, outline: "none" },
        
        card: { background: "#fff", padding: "24px", borderRadius: "24px", border: `1px solid ${BRAND.border}`, marginBottom: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" },
        memberHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", borderBottom: `1px solid ${BRAND.bg}`, paddingBottom: "16px" },
        avatar: { width: "48px", height: "48px", borderRadius: "14px", background: `${BRAND.primary}10`, color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "18px" },
        
        statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
        miniStat: { padding: "12px", borderRadius: "16px", background: BRAND.bg, textAlign: "center" },
        statLabel: { fontSize: "11px", fontWeight: 700, color: BRAND.textMuted, marginBottom: "4px", textTransform: "uppercase" },
        statValue: { fontSize: "16px", fontWeight: 800, color: BRAND.text }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: BRAND.primary }}>Team Performance</h2>
                        <p style={{ margin: 0, fontSize: "14px", color: BRAND.textMuted }}>Sales breakdown by staff members</p>
                    </div>
                </div>
                <button style={{ ...styles.backBtn, width: "auto", padding: "0 20px", gap: "8px", fontWeight: 700 }} onClick={handleExport}>
                    <FiDownload /> Export CSV
                </button>
            </div>

            {/* FILTER BAR */}
            <div style={styles.filterBar}>
                <FiCalendar color={BRAND.textMuted} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: BRAND.text }}>Period:</span>
                <input type="date" style={styles.dateInput} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <span style={{ fontWeight: 800, color: BRAND.border }}>—</span>
                <input type="date" style={styles.dateInput} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", color: BRAND.primary, fontWeight: 700 }}>
                    <FiUsers /> {teamData.length} Active Members
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "100px", color: BRAND.textMuted }}>Analyzing team sales...</div>
            ) : teamData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "100px", color: BRAND.textMuted }}>No sales recorded for this period.</div>
            ) : (
                <div style={{ paddingBottom: "40px" }}>
                    {teamData.map((member) => (
                        <div key={member._id} style={styles.card}>
                            <div style={styles.memberHeader}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={styles.avatar}>{member.userName[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: "18px", color: BRAND.primary }}>{member.userName}</div>
                                        <div style={{ fontSize: "13px", color: BRAND.textMuted }}>{member.userEmail}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "12px", color: BRAND.textMuted, fontWeight: 700 }}>TOTAL REVENUE</div>
                                    <div style={{ fontSize: "24px", fontWeight: 900, color: BRAND.success }}>₹{member.totalRevenue.toLocaleString()}</div>
                                </div>
                            </div>

                            <div style={styles.statsGrid}>
                                <div style={styles.miniStat}>
                                    <div style={styles.statLabel}>Total Bills</div>
                                    <div style={styles.statValue}>{member.totalBills}</div>
                                </div>
                                <div style={styles.miniStat}>
                                    <div style={styles.statLabel}><FiDollarSign size={10} /> Cash</div>
                                    <div style={{ ...styles.statValue, color: BRAND.success }}>₹{member.cashTotal}</div>
                                </div>
                                <div style={styles.miniStat}>
                                    <div style={styles.statLabel}><FiSmartphone size={10} /> UPI</div>
                                    <div style={{ ...styles.statValue, color: "#8B5CF6" }}>₹{member.upiTotal}</div>
                                </div>
                                <div style={styles.miniStat}>
                                    <div style={styles.statLabel}><FiCreditCard size={10} /> Card</div>
                                    <div style={{ ...styles.statValue, color: BRAND.info }}>₹{member.cardTotal}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamSalesReportScreen;
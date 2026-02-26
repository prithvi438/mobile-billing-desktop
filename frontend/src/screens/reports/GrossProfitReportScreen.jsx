import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiArrowLeft, FiCalendar, FiDownload, FiPieChart,
    FiTrendingUp, FiArrowDownCircle, FiFilter, FiBriefcase
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
    danger: "#EF4444"
};

const GrossProfitReportScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    /* ================= STATE ================= */
    const [summary, setSummary] = useState({ totalRevenue: 0, totalCOGS: 0, grossProfit: 0 });
    const [categories, setCategories] = useState([{ _id: "all", name: "All Categories" }]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    // Date Logic
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(firstDay);
    const [toDate, setToDate] = useState(today);

    /* ================= API CALLS ================= */

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/category?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setCategories([{ _id: "all", name: "All Categories" }, ...res.data.data.data]);
            }
        } catch (e) { console.error(e); }
    }, [token]);

    const fetchProfitReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/reports/gross-profit`, {
                params: {
                    fromDate,
                    toDate,
                    category: selectedCategory === "all" ? "" : selectedCategory
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setSummary(res.data.data);
            }
        } catch (err) {
            console.error("Profit Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, selectedCategory, token]);

    useEffect(() => {
        fetchCategories();
        fetchProfitReport();
    }, [fetchProfitReport, fetchCategories]);

    // Calculate Profit Margin %
    const profitMargin = summary.totalRevenue > 0
        ? ((summary.grossProfit / summary.totalRevenue) * 100).toFixed(2)
        : 0;

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: { padding: "32px", background: BRAND.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
        titleGroup: { display: "flex", alignItems: "center", gap: "16px" },
        backBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "#fff", color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },

        filterBar: { display: "flex", alignItems: "center", gap: "16px", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: "20px", marginBottom: "32px", border: `1px solid ${BRAND.border}` },
        dateInput: { border: "none", background: "#F1F5F9", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: BRAND.text, outline: "none" },
        selectInput: { border: "none", background: "#F1F5F9", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: BRAND.primary, outline: "none", cursor: "pointer" },

        mainStats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" },
        statCard: (bg, color) => ({ background: bg, padding: "32px", borderRadius: "28px", border: `1px solid ${BRAND.border}`, display: "flex", flexDirection: "column", gap: "12px", color: color }),

        analysisSection: { background: "#fff", padding: "40px", borderRadius: "32px", border: `1px solid ${BRAND.border}`, textAlign: "center" },
        marginBadge: { padding: "8px 20px", borderRadius: "100px", background: `${BRAND.success}15`, color: BRAND.success, fontWeight: 800, fontSize: "14px", display: "inline-block", marginBottom: "16px" }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: BRAND.primary }}>Gross Profit Report</h2>
                        <p style={{ margin: 0, fontSize: "14px", color: BRAND.textMuted }}>Profitability analysis after cost of goods</p>
                    </div>
                </div>
                <button style={{ ...styles.backBtn, width: "auto", padding: "0 20px", gap: "8px", fontWeight: 700 }} onClick={() => window.print()}>
                    <FiDownload /> Print PDF
                </button>
            </div>

            {/* FILTER BAR */}
            <div style={styles.filterBar}>
                <FiCalendar color={BRAND.textMuted} />
                <input type="date" style={styles.dateInput} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <span style={{ fontWeight: 800, color: BRAND.border }}>—</span>
                <input type="date" style={styles.dateInput} value={toDate} onChange={(e) => setToDate(e.target.value)} />

                <div style={{ width: "1px", height: "24px", background: BRAND.border, margin: "0 8px" }} />

                <FiFilter color={BRAND.textMuted} />
                <select style={styles.selectInput} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "100px", color: BRAND.textMuted }}>Calculating margins...</div>
            ) : (
                <>
                    {/* TOP STATS */}
                    <div style={styles.mainStats}>
                        <div style={styles.statCard("#fff", BRAND.text)}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, color: BRAND.textMuted, fontSize: "13px" }}>TOTAL REVENUE</span>
                                <FiTrendingUp color={BRAND.success} />
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: 900 }}>₹{summary.totalRevenue.toLocaleString()}</div>
                        </div>

                        <div style={styles.statCard("#fff", BRAND.text)}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, color: BRAND.textMuted, fontSize: "13px" }}>TOTAL COST (COGS)</span>
                                <FiArrowDownCircle color={BRAND.danger} />
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: 900 }}>₹{summary.totalCOGS.toLocaleString()}</div>
                        </div>

                        <div style={styles.statCard(BRAND.primary, "#fff")}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>GROSS PROFIT</span>
                                <FiBriefcase />
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: 900 }}>₹{summary.grossProfit.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* PROFIT ANALYSIS BOX */}
                    <div style={styles.analysisSection}>
                        <div style={styles.marginBadge}>NET PROFIT MARGIN: {profitMargin}%</div>
                        <h1 style={{ fontSize: "48px", fontWeight: 900, color: BRAND.primary, margin: "0 0 10px 0" }}>
                            ₹{summary.grossProfit.toLocaleString()}
                        </h1>
                        <p style={{ maxWidth: "500px", margin: "0 auto", color: BRAND.textMuted, lineHeight: "1.6" }}>
                            Your business earned a gross profit of ₹{summary.grossProfit.toLocaleString()} from
                            {selectedCategory === "all" ? " all categories" : " the selected category"} between
                            {new Date(fromDate).toLocaleDateString()} and {new Date(toDate).toLocaleDateString()}.
                        </p>


                    </div>
                </>
            )}
        </div>
    );
};

export default GrossProfitReportScreen;
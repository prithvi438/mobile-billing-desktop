import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiArrowLeft, FiCalendar, FiDownload, FiFilter,
    FiTrendingUp, FiCreditCard, FiDollarSign, FiSmartphone, FiFileText
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

const SalesSummaryReportScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    // Corrected Date Logic
    const now = new Date();
    // Get the first day of the current month
    const firstDayObj = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDay = firstDayObj.toISOString().split('T')[0];

    // Get today's date
    const today = now.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(firstDay);
    const [toDate, setToDate] = useState(today);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/reports/sales-summary`, {
                params: { fromDate, toDate },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSummary(res.data.data);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, token]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: {
            padding: "32px",
            background: BRAND.bg,
            minHeight: "100vh",
            fontFamily: "'Inter', sans-serif"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px"
        },
        titleGroup: { display: "flex", alignItems: "center", gap: "16px" },
        backBtn: {
            width: "40px", height: "40px", borderRadius: "12px", border: "none",
            background: "#fff", color: BRAND.primary, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "32px"
        },
        filterBar: {
            display: "flex", alignItems: "center", gap: "16px",
            background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)",
            padding: "16px 24px", borderRadius: "20px", marginBottom: "32px",
            border: `1px solid ${BRAND.border}`
        },
        dateInput: {
            border: "none", background: "#F1F5F9", padding: "8px 12px",
            borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: BRAND.text,
            outline: "none"
        },
        sectionCard: {
            background: "#fff", padding: "24px", borderRadius: "24px",
            border: `1px solid ${BRAND.border}`, marginBottom: "24px"
        },
        row: {
            display: "flex", justifyContent: "space-between", padding: "12px 0",
            borderBottom: `1px solid ${BRAND.bg}`, fontSize: "14px"
        },
        exportBtn: {
            background: BRAND.primary, color: "#fff", border: "none",
            padding: "10px 20px", borderRadius: "12px", fontWeight: "600",
            display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"
        }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: BRAND.primary }}>Sales Summary Report</h2>
                        <p style={{ margin: 0, fontSize: "13px", color: BRAND.textMuted }}>Analytics and payment breakdown</p>
                    </div>
                </div>
                <button style={styles.exportBtn} onClick={() => window.print()}>
                    <FiDownload /> Print PDF
                </button>
            </div>

            {/* FILTER BAR */}
            <div style={styles.filterBar}>
                <FiCalendar color={BRAND.textMuted} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: BRAND.textMuted }}>PERIOD:</span>
                <input type="date" style={styles.dateInput} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <span style={{ fontWeight: 800, color: BRAND.border }}>—</span>
                <input type="date" style={styles.dateInput} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <button
                    style={{ ...styles.exportBtn, background: BRAND.accent, marginLeft: "auto" }}
                    onClick={fetchSummary}
                >
                    <FiFilter /> Update Report
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "50px", color: BRAND.textMuted }}>Generating report...</div>
            ) : summary ? (
                <>
                    {/* STATS OVERVIEW */}
                    <div style={styles.statsGrid}>
                        <StatCard icon={<FiTrendingUp />} label="Total Sales" value={`₹${summary.grandTotal}`} color={BRAND.primary} />
                        <StatCard icon={<FiFileText />} label="Invoices Generated" value={summary.totalBills} color={BRAND.info} />
                        <StatCard icon={<FiSmartphone />} label="Digital Collection" value={`₹${summary.upiTotal + summary.cardTotal}`} color={BRAND.success} />
                        <StatCard icon={<FiCreditCard />} label="Total Credit" value={`₹${summary.creditTotal}`} color={BRAND.accent} />
                    </div>

                    <div style={{ display: "flex", gap: "24px" }}>
                        <div style={{ ...styles.sectionCard, flex: 2 }}>
                            <h3 style={{ marginTop: 0, fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Revenue Breakdown</h3>
                            <div style={styles.row}><span>Gross Subtotal</span><span style={{ fontWeight: 700 }}>₹{summary.subTotal}</span></div>
                            <div style={styles.row}><span>Total Tax (GST)</span><span style={{ fontWeight: 700 }}>₹{summary.gstTotal}</span></div>
                            <div style={{ ...styles.row, borderBottom: "none", marginTop: "10px", fontSize: "18px" }}>
                                <span style={{ fontWeight: 800, color: BRAND.primary }}>Net Total</span>
                                <span style={{ fontWeight: 900, color: BRAND.primary }}>₹{summary.grandTotal}</span>
                            </div>
                        </div>

                        <div style={{ ...styles.sectionCard, flex: 1.2 }}>
                            <h3 style={{ marginTop: 0, fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Payment Summary</h3>
                            <PaymentRow icon={<FiDollarSign />} label="Cash" value={summary.cashTotal} color="#10B981" />
                            <PaymentRow icon={<FiSmartphone />} label="UPI" value={summary.upiTotal} color="#8B5CF6" />
                            <PaymentRow icon={<FiCreditCard />} label="Card" value={summary.cardTotal} color="#3B82F6" />
                            <PaymentRow icon={<FiCalendar />} label="Credit" value={summary.creditTotal} color="#F59E0B" />
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: "center", padding: "50px" }}>No data found.</div>
            )}
        </div>
    );
};

/* ---------------- SUB-COMPONENTS ---------------- */

const StatCard = ({ icon, label, value, color }) => (
    <div style={{
        background: "#fff", padding: "24px", borderRadius: "24px", border: `1px solid ${BRAND.border}`,
        display: "flex", flexDirection: "column", gap: "12px"
    }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${color}10`, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: "13px", color: BRAND.textMuted, fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: BRAND.text }}>{value}</div>
        </div>
    </div>
);

const PaymentRow = ({ icon, label, value, color }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: color }}>{icon}</div>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>{label}</span>
        </div>
        <span style={{ fontWeight: 700 }}>₹{value}</span>
    </div>
);

export default SalesSummaryReportScreen;
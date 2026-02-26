import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FiBarChart2, FiPackage, FiCreditCard, FiTrendingUp,
    FiAlertCircle, FiPieChart, FiUsers, FiChevronRight,
    FiPrinter, FiFileText, FiDownload
} from "react-icons/fi";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8"
};

const reports = [
    {
        id: "sales_summary",
        title: "Sales Summary",
        subtitle: "Daily, weekly & monthly revenue",
        icon: <FiBarChart2 />,
        path: "/landing/reports/sales-summary",
        color: "#3B82F6"
    },
    {
        id: "stock_report",
        title: "Stock Report",
        subtitle: "Current inventory valuation",
        icon: <FiPackage />,
        path: "/landing/reports/stock-report",
        color: "#10B981"
    },
    {
        id: "credit_report",
        title: "Credit (Udhar) Report",
        subtitle: "Pending customer payments",
        icon: <FiCreditCard />,
        path: "/landing/reports/credit-report",
        color: "#F59E0B"
    },
    {
        id: "top_selling",
        title: "Top Selling Items",
        subtitle: "Fastest moving products",
        icon: <FiTrendingUp />,
        path: "/landing/reports/top-selling",
        color: "#8B5CF6"
    },
    {
        id: "low_stock",
        title: "Low Stock Alert",
        subtitle: "Items below safety levels",
        icon: <FiAlertCircle />,
        path: "/landing/reports/low-stock",
        color: "#EF4444"
    },
    {
        id: "gross_profit",
        title: "Gross Profit",
        subtitle: "Revenue vs cost analysis",
        icon: <FiPieChart />,
        path: "/landing/reports/gross-profit",
        color: "#06B6D4"
    },
    {
        id: "team_sales",
        title: "Team Sales",
        subtitle: "Staff performance tracking",
        icon: <FiUsers />,
        path: "/landing/reports/team-sales",
        color: "#EC4899"
    }
];

const ReportScreen = () => {
    const navigate = useNavigate();

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: {
            padding: "32px",
            background: BRAND.bg,
            minHeight: "100vh",
            backgroundImage: "radial-gradient(at 0% 0%, rgba(11, 58, 111, 0.03) 0, transparent 50%)",
            fontFamily: "'Inter', sans-serif"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px"
        },
        title: { margin: 0, fontSize: "26px", fontWeight: 800, color: BRAND.primary, letterSpacing: "-0.5px" },
        subtitle: { margin: "4px 0 0", color: BRAND.textMuted, fontSize: "14px", fontWeight: 500 },

        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px"
        },
        reportCard: {
            background: "#fff",
            padding: "24px",
            borderRadius: "20px",
            border: `1px solid ${BRAND.border}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
            position: "relative",
            overflow: "hidden"
        },
        iconCircle: (color) => ({
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: `${color}10`,
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            marginBottom: "16px"
        }),
        cardTitle: {
            fontSize: "17px",
            fontWeight: 700,
            color: BRAND.text,
            marginBottom: "6px"
        },
        cardSubtitle: {
            fontSize: "13px",
            color: BRAND.textMuted,
            marginBottom: "20px",
            lineHeight: "1.4"
        },
        actionArea: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "16px",
            borderTop: `1px solid ${BRAND.bg}`
        },
        btnGroup: {
            display: "flex",
            gap: "8px"
        },
        miniActionBtn: {
            padding: "6px",
            borderRadius: "8px",
            border: `1px solid ${BRAND.border}`,
            background: "#fff",
            color: BRAND.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "0.2s"
        },
        viewBtn: {
            fontSize: "13px",
            fontWeight: 700,
            color: BRAND.primary,
            display: "flex",
            alignItems: "center",
            gap: "4px"
        }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Analytics & Reports<span style={{ color: BRAND.accent }}>.</span></h2>
                    <p style={styles.subtitle}>Download and export your business data in multiple formats</p>
                </div>
            </div>

            {/* REPORTS GRID */}
            <div style={styles.grid}>
                {reports.map((report) => (
                    <div
                        key={report.id}
                        style={styles.reportCard}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-5px)";
                            e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.05)";
                            e.currentTarget.style.borderColor = BRAND.primary + "30";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = styles.reportCard.boxShadow;
                            e.currentTarget.style.borderColor = BRAND.border;
                        }}
                        onClick={() => navigate(report.path)}
                    >
                        <div>
                            <div style={styles.iconCircle(report.color)}>
                                {report.icon}
                            </div>
                            <div style={styles.cardTitle}>{report.title}</div>
                            <div style={styles.cardSubtitle}>{report.subtitle}</div>
                        </div>

                        <div style={styles.actionArea}>
                            <div style={styles.btnGroup}>
                                <button
                                    style={styles.miniActionBtn}
                                    title="Quick Print"
                                    onClick={(e) => { e.stopPropagation(); window.print(); }}
                                >
                                    <FiPrinter size={14} />
                                </button>
                                <button
                                    style={styles.miniActionBtn}
                                    title="Export PDF"
                                    onClick={(e) => { e.stopPropagation(); console.log("PDF Export", report.id); }}
                                >
                                    <FiFileText size={14} />
                                </button>
                                <button
                                    style={styles.miniActionBtn}
                                    title="Export Excel"
                                    onClick={(e) => { e.stopPropagation(); console.log("Excel Export", report.id); }}
                                >
                                    <FiDownload size={14} />
                                </button>
                            </div>

                            <div style={styles.viewBtn}>
                                View Full Report <FiChevronRight />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportScreen;
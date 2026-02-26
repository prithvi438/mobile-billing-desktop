import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiArrowLeft, FiSearch, FiFilter, FiDownload, FiUser,
    FiAlertCircle, FiChevronRight, FiPhone, FiBook
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#334155",
    textMuted: "#94A3B8",
    danger: "#EF4444",
    success: "#10B981"
};

const CreditReportScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const scrollRef = useRef(null);

    /* ================= STATE ================= */
    const [customers, setCustomers] = useState([]);
    const [summary, setSummary] = useState({ totalCredit: 0, customerCount: 0 });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [search, setSearch] = useState("");
    const [minBalance, setMinBalance] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    /* ================= API CALLS ================= */

    const fetchCreditData = useCallback(async (reset = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const currentPage = reset ? 1 : page;
            const res = await axios.get(`${API_BASE_URL}/reports/credit`, {
                params: {
                    page: currentPage,
                    limit: 20,
                    search,
                    minBalance: minBalance || 1, // Only fetch people who owe money
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            const { data, meta, totalOutstanding } = res.data.data;
            setCustomers(prev => reset ? data : [...prev, ...data]);
            setSummary({
                totalCredit: totalOutstanding || 0,
                customerCount: meta.totalDocuments || 0
            });
            setHasNextPage(meta.hasNextPage);
            setPage(currentPage + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [page, search, minBalance, token, loading]);

    useEffect(() => {
        fetchCreditData(true);
    }, [search]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasNextPage) {
            fetchCreditData();
        }
    };

    /* ================= EXPORT ================= */
    const handleExport = () => {
        const headers = ["Customer Name", "Phone", "Email", "Outstanding Balance"];
        const rows = customers.map(c => [
            `"${c.name}"`,
            c.phone || "N/A",
            c.email || "N/A",
            c.openingBalance
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Credit_Report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: { padding: "32px", background: BRAND.bg, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexShrink: 0 },
        titleGroup: { display: "flex", alignItems: "center", gap: "16px" },
        backBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "#fff", color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },

        summaryCard: { background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.dark} 100%)`, padding: "24px 32px", borderRadius: "24px", color: "#fff", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 20px rgba(11, 58, 111, 0.15)" },

        filterBar: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexShrink: 0 },
        searchBox: { flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "12px 16px", borderRadius: "14px", border: `1px solid ${BRAND.border}` },

        listContainer: { flex: 1, overflowY: "auto", background: "#fff", borderRadius: "24px", border: `1px solid ${BRAND.border}` },
        row: { display: "flex", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${BRAND.bg}`, cursor: "pointer" },
        avatar: { width: "40px", height: "40px", borderRadius: "12px", background: BRAND.bg, color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px", fontWeight: 700 },

        balanceText: { fontWeight: 800, color: BRAND.danger, fontSize: "16px" },
        actionBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: BRAND.primary }}>Credit Report</h2>
                        <p style={{ margin: 0, fontSize: "13px", color: BRAND.textMuted }}>Pending customer payments and aging (Udhar)</p>
                    </div>
                </div>
                <button style={styles.actionBtn} onClick={handleExport}>
                    <FiDownload /> Export CSV
                </button>
            </div>

            {/* TOP SUMMARY */}
            {/* TOP SUMMARY */}
            <div style={styles.summaryCard}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: "14px",
                        color: BRAND.primary,
                        fontWeight: 600,
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}>
                        Total Outstanding Balance
                    </div>
                    <div style={{
                        fontSize: "36px",
                        fontWeight: 900,
                        color: BRAND.primary, // Explicitly forced pure white
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        ₹{(summary.totalCredit || 0).toLocaleString()}
                    </div>
                </div>

                <div style={{ textAlign: "right", borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "32px" }}>
                    <div style={{
                        fontSize: "14px",
                        color: BRAND.primary,
                        fontWeight: 600,
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}>
                        Due Customers
                    </div>
                    <div style={{
                        fontSize: "36px",
                        fontWeight: 900,
                        color: BRAND.primary
                    }}>
                        {summary.customerCount || 0}
                    </div>
                </div>
            </div>

            {/* SEARCH BOX */}
            <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                    <FiSearch color={BRAND.textMuted} />
                    <input
                        style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", fontWeight: 500 }}
                        placeholder="Search customer by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* CUSTOMER LIST */}
            <div style={styles.listContainer} onScroll={handleScroll} ref={scrollRef}>
                {initialLoading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: BRAND.textMuted }}>Calculating dues...</div>
                ) : (
                    <>
                        {customers.map((customer, idx) => (
                            <div key={`${customer._id}-${idx}`} style={styles.row} onClick={() => navigate(`/landing/customers/${customer._id}/transactions`)}>
                                <div style={styles.avatar}>{customer.name[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: BRAND.text }}>{customer.name}</div>
                                    <div style={{ fontSize: "12px", color: BRAND.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FiPhone size={10} /> {customer.phone || "No Phone"}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", marginRight: "24px" }}>
                                    <div style={styles.balanceText}>₹{customer.openingBalance.toLocaleString()}</div>
                                    <div style={{ fontSize: "11px", color: BRAND.textMuted, fontWeight: 600 }}>OUTSTANDING</div>
                                </div>
                                <button style={{ ...styles.backBtn, height: '32px', width: '32px' }} title="View Ledger">
                                    <FiBook size={14} />
                                </button>
                            </div>
                        ))}
                        {loading && <div style={{ padding: "20px", textAlign: "center", color: BRAND.textMuted }}>Loading more...</div>}
                        {!hasNextPage && customers.length > 0 && <div style={{ padding: "20px", textAlign: "center", color: BRAND.border, fontSize: "12px" }}>End of Report</div>}
                        {customers.length === 0 && !loading && <div style={{ padding: "40px", textAlign: "center", color: BRAND.textMuted }}>No pending credits found.</div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default CreditReportScreen;
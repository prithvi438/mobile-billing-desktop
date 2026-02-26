import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    FiArrowLeft, FiAlertTriangle, FiDownload, FiFilter, 
    FiPackage, FiShoppingCart, FiChevronRight 
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#334155",
    textMuted: "#94A3B8",
    danger: "#E11D48",
    warning: "#F59E0B"
};

const LowStockReportScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    
    // Pagination control
    const pagination = useRef({
        page: 1,
        isFetching: false,
        hasNextPage: true,
        limit: 20
    });

    /* ================= STATE ================= */
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([{ _id: "all", name: "All Categories" }]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    /* ================= API CALLS ================= */

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/category?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setCategories([{ _id: "all", name: "All Categories" }, ...res.data.data.data]);
            }
        } catch (e) { console.error("Category fetch error", e); }
    }, [token]);

    const fetchLowStock = useCallback(async (reset = false) => {
        if (pagination.current.isFetching) return;
        if (!reset && !pagination.current.hasNextPage) return;

        pagination.current.isFetching = true;
        setLoading(true);

        const targetPage = reset ? 1 : pagination.current.page;

        try {
            const res = await axios.get(`${API_BASE_URL}/reports/low-stock`, {
                params: {
                    page: targetPage,
                    limit: pagination.current.limit,
                    category: selectedCategory === "all" ? "" : selectedCategory
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const fetchedData = res.data.data.data || [];
                setItems(prev => reset ? fetchedData : [...prev, ...fetchedData]);
                
                pagination.current.hasNextPage = res.data.data.meta.hasNextPage;
                if (pagination.current.hasNextPage) {
                    pagination.current.page = targetPage + 1;
                }
            }
        } catch (err) {
            console.error("Low Stock Fetch Error:", err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
            setTimeout(() => { pagination.current.isFetching = false; }, 200);
        }
    }, [selectedCategory, token]);

    useEffect(() => {
        fetchCategories();
        fetchLowStock(true);
    }, [selectedCategory, fetchCategories]);

    /* ================= SCROLL LOGIC ================= */
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 150) {
            fetchLowStock(false);
        }
    };

    const handleExport = () => {
        const headers = ["Item Name", "Current Qty", "Alert Level", "Unit", "Category"];
        const rows = items.map(item => [
            `"${item.name}"`,
            item.quantity,
            item.lowStockAlert,
            item.unit,
            item.category?.name || "N/A"
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Low_Stock_Report_${new Date().toLocaleDateString()}.csv`;
        link.click();
    };

    /* ---------------- STYLES ---------------- */
    const styles = {
        container: { padding: "32px", background: BRAND.bg, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexShrink: 0 },
        titleGroup: { display: "flex", alignItems: "center", gap: "16px" },
        backBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "#fff", color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
        
        filterBar: { display: "flex", alignItems: "center", gap: "16px", background: "#fff", padding: "14px 24px", borderRadius: "20px", marginBottom: "24px", border: `1px solid ${BRAND.border}`, flexShrink: 0 },
        selectInput: { border: "none", background: "#F1F5F9", padding: "10px 16px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", color: BRAND.primary, outline: "none", cursor: "pointer" },
        
        listWrapper: { flex: 1, overflowY: "auto", paddingRight: "8px" },
        card: { background: "#fff", padding: "20px 24px", borderRadius: "20px", border: `1px solid ${BRAND.border}`, marginBottom: "12px", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" },
        warningStrip: { position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: BRAND.danger },
        
        qtyBox: { padding: "10px 16px", borderRadius: "14px", background: `${BRAND.danger}10`, textAlign: "center", minWidth: "100px" },
        actionBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", boxShadow: `0 8px 16px ${BRAND.primary}25` }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: BRAND.primary }}>Low Stock Report</h2>
                        <p style={{ margin: 0, fontSize: "13px", color: BRAND.textMuted }}>Inventory items below critical threshold</p>
                    </div>
                </div>
                <button style={{ ...styles.actionBtn, background: '#fff', color: BRAND.primary, border: `1px solid ${BRAND.border}` }} onClick={handleExport}>
                    <FiDownload /> Export CSV
                </button>
            </div>

            {/* FILTER BAR */}
            <div style={styles.filterBar}>
                <FiFilter color={BRAND.primary} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: BRAND.text }}>Filter Category:</span>
                <select 
                    style={styles.selectInput} 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
                
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", color: BRAND.danger, fontWeight: 700, fontSize: "14px" }}>
                    <FiAlertTriangle /> {items.length} Items need attention
                </div>
            </div>

            {/* CONTENT */}
            <div style={styles.listWrapper} onScroll={handleScroll}>
                {initialLoading ? (
                    <div style={{ textAlign: "center", padding: "50px", color: BRAND.textMuted }}>Scanning inventory levels...</div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px" }}>
                        <div style={{ width: "64px", height: "64px", background: `${BRAND.success}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: BRAND.success }}>
                            <FiPackage size={32} />
                        </div>
                        <h3 style={{ margin: 0, color: BRAND.text }}>All Stock Levels Healthy!</h3>
                        <p style={{ color: BRAND.textMuted }}>No items are below their alert threshold.</p>
                    </div>
                ) : (
                    <>
                        {items.map((item, index) => (
                            <div key={`${item._id}-${index}`} style={styles.card}>
                                <div style={styles.warningStrip} />
                                
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: BRAND.bg, display: "flex", alignItems: "center", justifyContent: "center", marginRight: "20px", color: BRAND.danger }}>
                                    <FiPackage size={24} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: BRAND.text, fontSize: "16px" }}>{item.name}</div>
                                    <div style={{ fontSize: "12px", color: BRAND.textMuted, marginTop: "2px" }}>
                                        Category: <span style={{ fontWeight: 600, color: BRAND.primary }}>{item.category?.name || "Uncategorized"}</span>
                                    </div>
                                </div>

                                <div style={{ textAlign: "right", marginRight: "40px" }}>
                                    <div style={{ fontSize: "11px", color: BRAND.textMuted, fontWeight: 700, letterSpacing: "0.5px" }}>THRESHOLD</div>
                                    <div style={{ fontWeight: 700, color: BRAND.text }}>{item.lowStockAlert} {item.unit}</div>
                                </div>

                                <div style={styles.qtyBox}>
                                    <div style={{ fontSize: "11px", color: BRAND.danger, fontWeight: 800 }}>CURRENT</div>
                                    <div style={{ fontWeight: 900, color: BRAND.danger, fontSize: "18px" }}>{item.quantity} {item.unit}</div>
                                </div>

                                <div style={{ marginLeft: "24px", color: BRAND.border }}>
                                    <FiChevronRight size={24} />
                                </div>
                            </div>
                        ))}
                        
                        {loading && <div style={{ textAlign: "center", padding: "20px", color: BRAND.textMuted }}>Fetching more items...</div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default LowStockReportScreen;
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiArrowLeft, FiSearch, FiFilter, FiDownload, FiPackage,
    FiAlertCircle, FiCheckCircle, FiChevronRight
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

const StockReportScreen = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const scrollRef = useRef(null);

    /* ================= STATE ================= */
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([{ _id: "all", name: "All" }]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [status, setStatus] = useState(""); // LOW, OUT
    const [minQty, setMinQty] = useState("");
    const [maxQty, setMaxQty] = useState("");
    const [showFilters, setShowFilters] = useState(false);


    const handleExport = () => {
        if (items.length === 0) {
            alert("No data available to export");
            return;
        }

        // 1. Define CSV Headers
        const headers = ["Product Name", "SKU", "Category", "Quantity", "Unit", "Selling Price", "Status"];

        // 2. Map items to rows
        const rows = items.map(item => [
            `"${item.name}"`, // Wrap in quotes to handle commas in names
            item.sku || "N/A",
            item.category?.name || "N/A",
            item.quantity,
            item.unit,
            item.sellingPrice,
            item.quantity <= (item.lowStockAlert || 0) ? "Low Stock" : "In Stock"
        ]);

        // 3. Create CSV content
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

        // 4. Create Download Link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Stock_Report_${new Date().toLocaleDateString()}.csv`);

        // 5. Trigger Download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ================= API CALLS ================= */

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/category?page=1&limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setCategories([{ _id: "all", name: "All" }, ...res.data.data.data]);
            }
        } catch (e) { console.error(e); }
    }, [token]);

    const fetchStock = useCallback(async (reset = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const currentPage = reset ? 1 : page;
            const res = await axios.get(`${API_BASE_URL}/reports/stock`, {
                params: {
                    page: currentPage,
                    limit: 20,
                    search,
                    category: selectedCategory === "all" ? "" : selectedCategory,
                    status,
                    minQty,
                    maxQty
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            const { data, meta } = res.data.data;
            setItems(prev => reset ? data : [...prev, ...data]);
            setHasNextPage(meta.hasNextPage);
            setPage(currentPage + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [page, search, selectedCategory, status, minQty, maxQty, token, loading]);

    /* ================= EFFECTS ================= */

    useEffect(() => {
        fetchCategories();
        fetchStock(true);
    }, [fetchCategories]);

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => fetchStock(true), 500);
        return () => clearTimeout(timer);
    }, [search, selectedCategory]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasNextPage) {
            fetchStock();
        }
    };

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        container: { padding: "32px", background: BRAND.bg, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexShrink: 0 },
        titleGroup: { display: "flex", alignItems: "center", gap: "16px" },
        backBtn: { width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "#fff", color: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },

        filterBar: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexShrink: 0 },
        searchBox: { flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "10px 16px", borderRadius: "14px", border: `1px solid ${BRAND.border}` },
        categoryScroll: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" },
        chip: (active) => ({ padding: "8px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, backgroundColor: active ? BRAND.primary : "#fff", color: active ? "#fff" : BRAND.text, transition: "0.2s", whiteSpace: "nowrap", boxShadow: active ? "0 4px 10px rgba(11, 58, 111, 0.2)" : "none" }),

        tableContainer: { flex: 1, overflowY: "auto", background: "#fff", borderRadius: "24px", border: `1px solid ${BRAND.border}`, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" },
        row: { display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${BRAND.bg}`, transition: "0.2s" },
        badge: (isLow) => ({ padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, background: isLow ? "#FFF1F2" : "#ECFDF5", color: isLow ? BRAND.danger : BRAND.success, display: "flex", alignItems: "center", gap: "4px" }),

        filterPanel: { position: "absolute", top: "140px", right: "32px", width: "300px", background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", border: `1px solid ${BRAND.border}`, zIndex: 100, display: showFilters ? "block" : "none" },
        inputField: { width: "100%", padding: "10px", borderRadius: "10px", border: `1px solid ${BRAND.border}`, marginBottom: "12px", outline: "none", fontSize: "13px" }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: BRAND.primary }}>Stock Summary</h2>
                        <p style={{ margin: 0, fontSize: "13px", color: BRAND.textMuted }}>Inventory levels and movement report</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button style={{ ...styles.backBtn, width: "auto", padding: "0 16px", gap: "8px" }} onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Filters
                    </button>
                    <button style={{ ...styles.backBtn, background: BRAND.primary, color: "#fff", width: "auto", padding: "0 16px", gap: "8px" }}
                        onClick={handleExport}
                    >
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            {/* SEARCH & CATEGORIES */}
            <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                    <FiSearch color={BRAND.textMuted} />
                    <input
                        style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", fontWeight: 500 }}
                        placeholder="Search item name or barcode..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div style={styles.categoryScroll}>
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        style={styles.chip(selectedCategory === cat._id)}
                        onClick={() => { setSelectedCategory(cat._id); setPage(1); }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* FILTER PANEL (FLYOUT) */}
            <div style={styles.filterPanel}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700 }}>Advanced Filters</h4>
                <label style={{ fontSize: "11px", fontWeight: 700, color: BRAND.textMuted }}>MIN QUANTITY</label>
                <input type="number" style={styles.inputField} value={minQty} onChange={(e) => setMinQty(e.target.value)} />
                <label style={{ fontSize: "11px", fontWeight: 700, color: BRAND.textMuted }}>MAX QUANTITY</label>
                <input type="number" style={styles.inputField} value={maxQty} onChange={(e) => setMaxQty(e.target.value)} />
                <label style={{ fontSize: "11px", fontWeight: 700, color: BRAND.textMuted }}>STOCK STATUS</label>
                <select style={styles.inputField} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="LOW">Low Stock</option>
                    <option value="OUT">Out of Stock</option>
                </select>
                <button
                    style={{ width: "100%", padding: "12px", background: BRAND.primary, color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => { fetchStock(true); setShowFilters(false); }}
                >
                    Apply Filters
                </button>
            </div>

            {/* ITEM LIST */}
            <div style={styles.tableContainer} onScroll={handleScroll} ref={scrollRef}>
                {initialLoading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: BRAND.textMuted }}>Analyzing inventory...</div>
                ) : (
                    <>
                        {items.map((item, idx) => {
                            const isLow = item.quantity <= (item.lowStockAlert || 0);
                            return (
                                <div key={`${item._id}-${idx}`} style={styles.row}>
                                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: BRAND.bg, display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px", color: BRAND.primary }}>
                                        <FiPackage size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: BRAND.text, fontSize: "15px" }}>{item.name}</div>
                                        <div style={{ fontSize: "12px", color: BRAND.textMuted }}>SKU: {item.sku || "N/A"} • {item.category?.name}</div>
                                    </div>
                                    <div style={{ textAlign: "right", marginRight: "32px" }}>
                                        <div style={{ fontWeight: 800, color: BRAND.primary }}>₹{item.sellingPrice}</div>
                                        <div style={{ fontSize: "11px", color: BRAND.textMuted }}>Unit Price</div>
                                    </div>
                                    <div style={{ width: "140px" }}>
                                        <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>{item.quantity} <span style={{ fontSize: "11px", fontWeight: 500 }}>{item.unit}</span></div>
                                        <div style={styles.badge(isLow)}>
                                            {isLow ? <FiAlertCircle /> : <FiCheckCircle />}
                                            {isLow ? "LOW STOCK" : "IN STOCK"}
                                        </div>
                                    </div>
                                    <FiChevronRight color={BRAND.border} />
                                </div>
                            );
                        })}
                        {loading && <div style={{ padding: "20px", textAlign: "center", color: BRAND.textMuted }}>Loading more...</div>}
                        {!hasNextPage && items.length > 0 && <div style={{ padding: "20px", textAlign: "center", color: BRAND.border, fontSize: "12px" }}>End of report</div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default StockReportScreen;
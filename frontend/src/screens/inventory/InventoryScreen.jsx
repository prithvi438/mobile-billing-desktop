import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    FiRefreshCw, FiPlus, FiSearch, FiEdit2, FiTrash2, FiBox, FiChevronRight, FiPackage
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";
import ConfirmDialogBox from "../../components/ConfirmDialogBox.jsx";
import AddInventoryDialogBox from "../../components/inventory/AddInventoryDialogBox.jsx";
import EditInventoryDialogBox from "../../components/inventory/EditInventoryDialogBox.jsx";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8",
    danger: "#EF4444",
    success: "#10B981"
};

const InventoryScreen = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const limit = 20;
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const token = localStorage.getItem("accessToken");

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/category`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Adjust "res.data.data.data" based on your API response structure
            setCategories(res.data.data.data || []);
        } catch (err) {
            console.error("Category fetch error:", err);
        }
    }, [token]);

    const fetchInventory = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;
            const res = await axios.get(`${API_BASE_URL}/inventory`, {
                params: { page: currentPage, limit, search, category },
                headers: { Authorization: `Bearer ${token}` },
            });

            const payload = res.data.data;
            if (reset) {
                setInventory(payload.data);
                setPage(2);
            } else {
                setInventory((prev) => [...prev, ...payload.data]);
                setPage(currentPage + 1);
            }
            setTotalPages(payload.meta.totalPages);
        } catch (err) {
            console.error("Inventory fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, category, token]);

    useEffect(() => { fetchInventory(true); fetchCategories(); }, []);

    const refreshList = () => fetchInventory(true);

    const confirmDeleteItem = async () => {
        try {
            setLoading(true); // Show loading during deletion
            await axios.delete(`${API_BASE_URL}/inventory/${selectedItemId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setShowConfirm(false);
            setSelectedItemId(null);

            // Refresh the list to remove the deleted item
            fetchInventory(true);
        } catch (err) {
            console.error("Delete inventory error:", err);
            alert(err.response?.data?.message || "Failed to delete item.");
        } finally {
            setLoading(false);
        }
    };

    const askDeleteItem = (id) => {
        setSelectedItemId(id);
        setShowConfirm(true);
    };

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

        filterPanel: {
            display: "flex", alignItems: "center", gap: "24px",
            background: BRAND.glass, backdropFilter: "blur(12px)",
            padding: "14px 24px", borderRadius: "16px", marginBottom: "24px",
            border: `1px solid ${BRAND.border}`, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        },
        searchContainer: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
        searchInput: { border: "none", background: "transparent", outline: "none", width: "100%", fontWeight: 500, color: BRAND.text, fontSize: "14px" },
        categorySelect: {
            border: `1px solid ${BRAND.border}`,
            background: "#fff",
            padding: "8px 12px",
            borderRadius: "10px",
            outline: "none",
            color: BRAND.text,
            fontWeight: 500,
            fontSize: "14px",
            minWidth: "180px",
            cursor: "pointer"
        },
        tableCard: {
            background: "#fff", borderRadius: "20px", overflow: "hidden",
            border: `1px solid ${BRAND.border}`, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
        },
        table: { width: "100%", borderCollapse: "collapse" },
        th: {
            padding: "16px 24px", textAlign: "left", fontSize: "11px", fontWeight: 700,
            color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "1.2px",
            background: "#F8FAFC", borderBottom: `1px solid ${BRAND.border}`
        },
        td: { padding: "16px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "14px", fontWeight: 500, color: BRAND.text },
        tdBold: { padding: "16px 24px", borderTop: `1px solid ${BRAND.border}`, fontSize: "14px", fontWeight: 700, color: BRAND.primary },

        miniAvatar: {
            width: "32px", height: "32px", borderRadius: "10px",
            background: `${BRAND.primary}08`, color: BRAND.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: "12px", fontWeight: 700, border: `1px solid ${BRAND.primary}15`
        },
        primaryBtn: {
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1e4b8a 100%)`,
            color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "8px", fontWeight: 600,
            cursor: "pointer", boxShadow: `0 4px 12px ${BRAND.primary}20`
        },
        secondaryBtn: {
            background: "#fff", color: BRAND.primary, border: `1px solid ${BRAND.border}`,
            padding: "10px 18px", borderRadius: "12px", display: "flex",
            alignItems: "center", gap: "8px", fontWeight: 600, cursor: "pointer"
        },
        applyBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" },

        stockBadge: (qty, low) => ({
            padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: qty <= low ? "#FEF2F2" : "#F0FDF4",
            color: qty <= low ? BRAND.danger : BRAND.success,
            border: `1px solid ${qty <= low ? "#FEE2E2" : "#DCFCE7"}`
        }),
        actionBtn: { border: "none", background: "transparent", color: BRAND.textMuted, padding: "8px", borderRadius: "8px", cursor: "pointer", transition: '0.2s', display: 'inline-flex', alignItems: 'center' },
        deleteBtn: { border: "none", background: "transparent", color: "#FDA4AF", padding: "8px", borderRadius: "8px", cursor: "pointer", display: 'inline-flex', alignItems: 'center' },
        loadMoreBox: { padding: "24px", textAlign: "center", borderTop: `1px solid ${BRAND.border}` }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Inventory Stock<span style={{ color: BRAND.accent }}>.</span></h2>
                    <p style={styles.subtitle}>Track products, SKUs and real-time availability</p>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button style={styles.secondaryBtn} onClick={refreshList}>
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                    <button style={styles.primaryBtn} onClick={() => setOpen(true)}>
                        <FiPlus size={18} /> Add New Item
                    </button>
                </div>
            </div>

            {/* FILTER BAR */}
            <div style={styles.filterPanel}>
                <div style={styles.searchContainer}>
                    <FiSearch size={18} color={BRAND.textMuted} />
                    <input
                        placeholder="Search product name, SKU or scan barcode..."
                        style={styles.searchInput}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: BRAND.textMuted }}>CATEGORY:</span>
                    <select
                        style={styles.categorySelect}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button style={styles.applyBtn} onClick={() => fetchInventory(true)}>Apply Filters</button>
            </div>

            {/* TABLE */}
            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Product Details</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>SKU / Barcode</th>
                            <th style={styles.th}>Selling Price</th>
                            <th style={styles.th}>Current Stock</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {inventory.map((item) => (
                            <tr key={item._id}>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={styles.miniAvatar}><FiPackage size={14} /></div>
                                        <span style={{ fontWeight: 600, color: BRAND.primary }}>{item.name}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                        {item.category?.name || "General"}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.sku || "N/A"}</div>
                                    <div style={{ fontSize: 11, color: BRAND.textMuted }}>{(item.barcodes || []).join(", ")}</div>
                                </td>
                                <td style={styles.tdBold}>₹ {item.sellingPrice.toLocaleString()}</td>
                                <td style={styles.td}>
                                    <span style={styles.stockBadge(item.quantity, item.lowStockAlert)}>
                                        ● {item.quantity} {item.quantity <= item.lowStockAlert ? '(Low)' : '(In Stock)'}
                                    </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                        <button
                                            style={styles.actionBtn}
                                            title="Edit Product"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setOpenEdit(true);
                                            }}
                                        >
                                            <FiEdit2 size={16} />
                                        </button>

                                        <button
                                            style={styles.deleteBtn}
                                            title="Remove Item"
                                            onClick={() => askDeleteItem(item._id)}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && <div style={{ padding: 24, textAlign: 'center', color: BRAND.textMuted }}>Loading products...</div>}

                {!loading && page <= totalPages && (
                    <div style={styles.loadMoreBox}>
                        <button
                            style={styles.secondaryBtn}
                            onClick={() => fetchInventory()}
                        >
                            Load More Products <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialogBox
                open={showConfirm}
                title="Delete Inventory Item"
                type="destructive"
                message="Are you sure you want to delete this product? This will remove it from future sales entries."
                onConfirm={confirmDeleteItem}
                onCancel={() => setShowConfirm(false)}
            />

            <AddInventoryDialogBox
                open={open}
                onClose={() => setOpen(false)}
                onSuccess={refreshList}
            />

            <EditInventoryDialogBox
                open={openEdit}
                item={selectedItem}
                onClose={() => {
                    setOpenEdit(false);
                    setSelectedItem(null);
                }}
                onSuccess={refreshList}
            />
        </div>
    );
};

export default InventoryScreen;
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronRight, FiLayers
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";
import ConfirmDialogBox from "../../components/ConfirmDialogBox.jsx";
import InformationDialogBox from "../../components/InformationDialogBox.jsx";
import AddEditCategoryModal from "../../components/category/AddEditCategoryModal"; // You will need to create this

const LIMIT = 20;

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8"
};

const CategoryScreen = () => {
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, category: null });
    const [confirm, setConfirm] = useState({ open: false, categoryId: null });
    const [info, setInfo] = useState({ open: false, title: "", message: "", type: "info" });

    const token = localStorage.getItem("accessToken");

    const fetchCategories = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;

            const res = await axios.get(`${API_BASE_URL}/category`, {
                params: { page: currentPage, limit: LIMIT, search },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            });

            const payload = res.data.data;

            if (reset) {
                setCategories(payload.data);
                setPage(2);
            } else {
                setCategories((prev) => [...prev, ...payload.data]);
                setPage(currentPage + 1);
            }
            setTotalPages(payload.meta.totalPages);
        } catch (err) {
            console.error("Category fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, token]);

    useEffect(() => {
        fetchCategories(true);
    }, []);

    const handleConfirmDelete = async () => {
        try {
            const res = await axios.delete(`${API_BASE_URL}/category/${confirm.categoryId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res?.data?.success === false) {
                setInfo({
                    open: true,
                    title: "Delete Error",
                    message: res.data.message || "Cannot delete category.",
                    type: "error"
                });
            } else {
                setConfirm({ open: false, categoryId: null });
                fetchCategories(true); // Refresh list
            }
        } catch (err) {
            setInfo({
                open: true,
                title: "Delete Error",
                message: err?.response?.data?.message || "Failed to delete category.",
                type: "error"
            });
        } finally {
            setConfirm({ open: false, categoryId: null });
        }
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
        applyBtn: {
            background: BRAND.primary, color: "#fff", border: "none",
            padding: "10px 24px", borderRadius: "10px", fontWeight: 600, cursor: "pointer"
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
        miniAvatar: {
            width: "36px", height: "36px", borderRadius: "10px",
            background: `${BRAND.primary}08`, color: BRAND.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${BRAND.primary}15`
        },
        primaryBtn: {
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1e4b8a 100%)`,
            color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "8px", fontWeight: 600,
            cursor: "pointer", boxShadow: `0 4px 12px ${BRAND.primary}20`
        },
        actionBtn: {
            border: "none", background: "transparent", color: BRAND.textMuted,
            padding: "8px", borderRadius: "8px", cursor: "pointer", transition: '0.2s'
        },
        deleteBtn: {
            border: "none", background: "transparent", color: "#FDA4AF",
            padding: "8px", borderRadius: "8px", cursor: "pointer"
        },
        loadMoreBox: { padding: "24px", textAlign: "center", borderTop: `1px solid ${BRAND.border}` },
        secondaryBtn: {
            background: "#fff", color: BRAND.primary, border: `1px solid ${BRAND.border}`,
            padding: "10px 24px", borderRadius: "12px", fontWeight: 600, cursor: "pointer",
            display: 'inline-flex', alignItems: 'center', gap: 8
        }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Categories<span style={{ color: BRAND.accent }}>.</span></h2>
                    <p style={styles.subtitle}>Organize your products into logical groups</p>
                </div>

                <button
                    style={styles.primaryBtn}
                    onClick={() => setModal({ open: true, category: null })}
                >
                    <FiPlus size={18} /> Add New Category
                </button>
            </div>

            {/* FILTER PANEL */}
            <div style={styles.filterPanel}>
                <div style={styles.searchContainer}>
                    <FiSearch size={18} color={BRAND.textMuted} />
                    <input
                        placeholder="Search category by name..."
                        style={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button style={styles.applyBtn} onClick={() => fetchCategories(true)}>Apply</button>
            </div>

            {/* TABLE */}
            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Category Name</th>
                            <th style={styles.th}>Created On</th>
                            <th style={styles.th}>Items Count</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id}>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={styles.miniAvatar}><FiLayers size={18} /></div>
                                        <span style={{ fontWeight: 600, color: BRAND.primary }}>{cat.name}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    {new Date(cat.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td style={styles.td}>
                                    {/* If your API doesn't provide item count, you can replace this with a status badge */}
                                    <span style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                        In Use
                                    </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                        <button
                                            style={styles.actionBtn}
                                            title="Edit"
                                            onClick={() => setModal({ open: true, category: cat })}
                                        >
                                            <FiEdit2 size={16} />
                                        </button>

                                        <button
                                            style={styles.deleteBtn}
                                            title="Delete"
                                            onClick={() => setConfirm({ open: true, categoryId: cat._id })}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && <div style={{ padding: 24, textAlign: 'center', color: BRAND.textMuted }}>Loading categories...</div>}

                {!loading && page <= totalPages && (
                    <div style={styles.loadMoreBox}>
                        <button style={styles.secondaryBtn} onClick={() => fetchCategories()}>
                            Load More <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <AddEditCategoryModal
                open={modal.open}
                category={modal.category}
                onClose={() => setModal({ open: false, category: null })}
                onSuccess={() => fetchCategories(true)}
            />

            <ConfirmDialogBox
                open={confirm.open}
                title="Delete Category"
                type="destructive"
                message="Are you sure you want to delete this category? Products in this category will become uncategorized."
                onCancel={() => setConfirm({ open: false, categoryId: null })}
                onConfirm={handleConfirmDelete}
            />

            <InformationDialogBox
                open={info.open}
                title={info.title}
                message={info.message}
                type={info.type}
                onClose={() => setInfo({ ...info, open: false })}
            />
        </div>
    );
};

export default CategoryScreen;
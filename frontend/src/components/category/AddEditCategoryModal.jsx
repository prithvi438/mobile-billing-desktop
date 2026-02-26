import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiX, FiLayers, FiInfo, FiSave, FiEdit3 } from "react-icons/fi";
import { API_BASE_URL } from "../../constants";
import InformationDialogBox from "../InformationDialogBox.jsx";

const BRAND = {
    primary: "#0B3A6F",
    dark: "#082E57",
    accent: "#F57C00",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    danger: "#EF4444"
};

const AddEditCategoryModal = ({ open, onClose, category, onSuccess }) => {
    const isEdit = !!category;
    const token = localStorage.getItem("accessToken");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [dialog, setDialog] = useState({ open: false, type: "success", title: "", message: "" });

    useEffect(() => {
        if (category && open) {
            setName(category.name || "");
            setDescription(category.description || "");
        } else if (open) {
            setName("");
            setDescription("");
            setError("");
        }
    }, [category, open]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Category name is required");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: name.trim(),
                description: description.trim()
            };

            if (isEdit) {
                await axios.patch(`${API_BASE_URL}/category/${category._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE_URL}/category`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            onSuccess();
            onClose();
        } catch (err) {
            setDialog({
                open: true,
                type: "error",
                title: "Operation Failed",
                message: err.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                `}
            </style>
            <div style={styles.overlay}>
                <div style={{ ...styles.modal, animation: "modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>

                    {/* HEADER */}
                    <div style={styles.header}>
                        <div style={styles.headerTextWrapper}>
                            <div style={styles.iconCircle}>
                                {isEdit ? <FiEdit3 size={22} color={BRAND.primary} /> : <FiLayers size={22} color={BRAND.primary} />}
                            </div>
                            <div>
                                <h3 style={styles.title}>{isEdit ? "Update Category" : "New Category"}</h3>
                                <p style={styles.subtitle}>{isEdit ? "Modify group details" : "Create a new product group"}</p>
                            </div>
                        </div>
                        <button style={styles.closeBtn} onClick={onClose}><FiX size={20} /></button>
                    </div>

                    {/* CONTENT */}
                    <div style={styles.content}>
                        <div style={styles.formGroup}>
                            <label style={styles.labelStyle}>Category Name *</label>
                            <div style={{ ...styles.fieldWrapper, borderColor: error ? BRAND.danger : BRAND.border }}>
                                <FiLayers style={styles.fieldIcon} />
                                <input
                                    style={styles.fieldInput}
                                    placeholder="e.g. Beverages, Electronics..."
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (error) setError("");
                                    }}
                                />
                            </div>
                            {error && <span style={styles.errorText}>{error}</span>}
                        </div>

                        {/* <div style={styles.formGroup}>
                            <label style={styles.labelStyle}>Description (Optional)</label>
                            <div style={styles.fieldWrapper}>
                                <textarea
                                    style={{ ...styles.fieldInput, height: "80px", resize: "none", paddingTop: "10px" }}
                                    placeholder="Brief details about items in this category"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div> */}

                        <div style={styles.infoBox}>
                            <FiInfo style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>Categories help you filter inventory and generate department-wise sales reports.</span>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div style={styles.footer}>
                        <button style={styles.cancelBtn} onClick={onClose}>Discard</button>
                        <button
                            style={{
                                ...styles.primaryBtn,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? "not-allowed" : "pointer"
                            }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            <FiSave size={18} />
                            {loading ? "Saving..." : isEdit ? "Update Category" : "Save Category"}
                        </button>
                    </div>
                </div>
            </div>

            <InformationDialogBox
                open={dialog.open}
                type={dialog.type}
                title={dialog.title}
                message={dialog.message}
                onClose={() => setDialog({ ...dialog, open: false })}
            />
        </>
    );
};

/* ---------- INLINE STYLES ---------- */

const styles = {
    overlay: {
        position: "fixed", inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3000,
    },
    modal: {
        width: 480,
        background: "#fff",
        borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
        overflow: "hidden",
    },
    header: {
        padding: "24px 30px",
        background: `linear-gradient(135deg, #fff 0%, #F8FAFC 100%)`,
        borderBottom: `1px solid ${BRAND.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    headerTextWrapper: { display: "flex", alignItems: "center", gap: 16 },
    iconCircle: {
        width: 48, height: 48, borderRadius: 14,
        background: `${BRAND.primary}10`,
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    title: { margin: 0, fontSize: "20px", fontWeight: 800, color: BRAND.dark, letterSpacing: "-0.5px" },
    subtitle: { margin: "2px 0 0", fontSize: "13px", color: BRAND.textMuted, fontWeight: 500 },
    closeBtn: {
        background: "transparent", border: "none", color: BRAND.textMuted,
        cursor: "pointer", padding: 8, borderRadius: "50%", display: "flex",
    },
    content: { padding: "30px", display: "flex", flexDirection: "column", gap: 20 },
    formGroup: { display: "flex", flexDirection: "column" },
    labelStyle: { fontSize: "11px", fontWeight: 700, color: BRAND.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" },
    fieldWrapper: {
        display: "flex", alignItems: "center", gap: 12,
        border: `1.5px solid ${BRAND.border}`, padding: "10px 16px",
        borderRadius: "14px", transition: "all 0.2s ease",
        background: "#F8FAFC"
    },
    fieldIcon: { color: BRAND.primary, fontSize: "18px" },
    fieldInput: { border: "none", outline: "none", flex: 1, fontSize: "15px", fontWeight: 600, color: BRAND.text, background: "transparent" },
    errorText: { marginTop: 6, fontSize: "12px", color: BRAND.danger, fontWeight: 600 },
    infoBox: {
        padding: "12px 16px", borderRadius: "14px", background: "#F1F5F9",
        color: BRAND.textMuted, fontSize: "12px", display: "flex", gap: 12, lineHeight: "1.5", fontWeight: 500,
        border: "1px solid #E2E8F0"
    },
    footer: {
        padding: "20px 30px", background: "#F8FAFC", borderTop: `1px solid ${BRAND.border}`,
        display: "flex", justifyContent: "flex-end", gap: 12,
    },
    cancelBtn: {
        background: "transparent", color: BRAND.textMuted, border: "none",
        padding: "12px 20px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", fontSize: "14px"
    },
    primaryBtn: {
        background: BRAND.primary, color: "#fff", border: "none",
        padding: "12px 28px", borderRadius: "12px", fontWeight: 700, fontSize: "15px",
        boxShadow: `0 8px 16px ${BRAND.primary}30`, display: "flex", alignItems: "center", gap: 10
    },
};

export default AddEditCategoryModal;
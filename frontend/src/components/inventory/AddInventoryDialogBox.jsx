import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FiX, FiSave, FiBox, FiDollarSign, FiPercent,
    FiLayers, FiAlertTriangle, FiInfo, FiTag, FiFileText
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants";
import InformationDialogBox from "../InformationDialogBox.jsx";

const BRAND = {
    primary: "#0B3A6F",
    dark: "#082E57",
    accent: "#F57C00",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    glass: "rgba(255, 255, 255, 0.75)",
};

const AddInventoryDialogBox = ({ open, onClose, onSuccess }) => {
    const token = localStorage.getItem("accessToken");

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [unit, setUnit] = useState("PCS");
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        title: "",
        message: "",
        type: "info",
    });

    const [form, setForm] = useState({
        name: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
        gstRate: "",
        quantity: "",
        lowStockAlert: "",
        sku: "",
        barcodes: "",
        category: "",
    });

    useEffect(() => {
        if (open) fetchCategories();
    }, [open]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/category?page=1&limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data.data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const submit = async () => {
        if (!form.name || !form.category || !form.costPrice || !form.sellingPrice || !form.quantity) {
            setInfoDialog({
                open: true,
                title: "Missing Required Fields",
                message: "Please fill all mandatory fields (marked with *) before saving.",
                type: "warning",
            });
            return;
        }

        setLoading(true);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            category: form.category,
            costPrice: Number(form.costPrice),
            sellingPrice: Number(form.sellingPrice),
            gstRate: Number(form.gstRate || 0),
            quantity: Number(form.quantity),
            lowStockAlert: Number(form.lowStockAlert || 0),
            unit,
            isActive: true,
        };

        if (form.sku.trim()) payload.sku = form.sku.trim();
        if (form.barcodes.trim()) {
            payload.barcodes = form.barcodes.split(",").map((b) => b.trim()).filter(Boolean);
        }

        try {
            await axios.post(`${API_BASE_URL}/inventory`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setInfoDialog({
                open: true,
                title: "Failed to Add Inventory",
                message: err.response?.data?.message || "Something went wrong while saving inventory.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <>
            <style>
                {`
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.95) translateY(20px); }
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
                                <FiBox size={22} color={BRAND.primary} />
                            </div>
                            <div>
                                <h2 style={styles.title}>Add Inventory Item</h2>
                                <p style={styles.subtitle}>Register product & initialize stock levels</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={styles.closeBtn}>
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* BODY */}
                    <div style={styles.grid}>
                        {/* LEFT COLUMN */}
                        <div style={styles.column}>
                            <SectionTitle icon={<FiTag />} title="Basic Details" />
                            <div style={styles.card}>
                                <Field label="Product Name *">
                                    <input 
                                        style={styles.input} 
                                        placeholder="Enter item name"
                                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                    />
                                </Field>

                                <Field label="Category *">
                                    <select
                                        style={styles.input}
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </Field>

                                <div style={styles.row}>
                                    <Field label="SKU Code" style={{ flex: 1 }}>
                                        <input style={styles.input} placeholder="Auto-gen if empty" onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                                    </Field>
                                    <Field label="Unit Type" style={{ flex: 1 }}>
                                        <div style={styles.unitToggle}>
                                            {["PCS", "KG", "LTR"].map((u) => (
                                                <button
                                                    key={u}
                                                    onClick={() => setUnit(u)}
                                                    style={{
                                                        ...styles.unitBtn,
                                                        background: unit === u ? BRAND.primary : "transparent",
                                                        color: unit === u ? "#fff" : BRAND.textMuted,
                                                    }}
                                                >
                                                    {u}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                </div>

                                <Field label="Description">
                                    <textarea
                                        rows={3}
                                        placeholder="Additional product details..."
                                        style={{ ...styles.input, resize: "none" }}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div style={styles.column}>
                            <SectionTitle icon={<FiDollarSign />} title="Pricing & Inventory" />
                            <div style={styles.card}>
                                <div style={styles.row}>
                                    <Field label="Cost Price *" style={{ flex: 1 }}>
                                        <div style={styles.inputWithIcon}>
                                            <FiDollarSign size={14} color={BRAND.textMuted} />
                                            <input type="number" style={styles.borderlessInput} placeholder="0.00" onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
                                        </div>
                                    </Field>
                                    <Field label="Selling Price *" style={{ flex: 1 }}>
                                        <div style={styles.inputWithIcon}>
                                            <FiDollarSign size={14} color={BRAND.primary} />
                                            <input type="number" style={styles.borderlessInput} placeholder="0.00" onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
                                        </div>
                                    </Field>
                                </div>

                                <div style={styles.row}>
                                    <Field label="Tax (GST %)" style={{ flex: 1 }}>
                                        <div style={styles.inputWithIcon}>
                                            <FiPercent size={14} color={BRAND.textMuted} />
                                            <input type="number" style={styles.borderlessInput} placeholder="0" onChange={(e) => setForm({ ...form, gstRate: e.target.value })} />
                                        </div>
                                    </Field>
                                    <Field label="Initial Stock *" style={{ flex: 1 }}>
                                        <div style={styles.inputWithIcon}>
                                            <FiLayers size={14} color={BRAND.textMuted} />
                                            <input type="number" style={styles.borderlessInput} placeholder="Qty" onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                                        </div>
                                    </Field>
                                </div>

                                <Field label="Low Stock Alert">
                                    <div style={styles.inputWithIcon}>
                                        <FiAlertTriangle size={14} color={BRAND.accent} />
                                        <input type="number" style={styles.borderlessInput} placeholder="Notify when below..." onChange={(e) => setForm({ ...form, lowStockAlert: e.target.value })} />
                                    </div>
                                </Field>

                                <Field label="Barcodes (Optional)">
                                    <div style={styles.inputWithIcon}>
                                        <FiTag size={14} color={BRAND.textMuted} />
                                        <input style={styles.borderlessInput} placeholder="Scan or type comma separated" onChange={(e) => setForm({ ...form, barcodes: e.target.value })} />
                                    </div>
                                </Field>
                            </div>
                            
                            <div style={styles.infoBox}>
                                <FiInfo size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                                <span>Initial stock cannot be changed here once saved. Use Purchase/Adjustments later.</span>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div style={styles.footer}>
                        <button style={styles.cancelBtn} onClick={onClose}>Discard</button>
                        <button style={styles.primaryBtn} onClick={submit} disabled={loading}>
                            <FiSave size={18} /> {loading ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </div>
            </div>

            <InformationDialogBox
                open={infoDialog.open}
                title={infoDialog.title}
                message={infoDialog.message}
                type={infoDialog.type}
                onClose={() => setInfoDialog({ ...infoDialog, open: false })}
            />
        </>
    );
};

/* ================= SUB-COMPONENTS ================= */

const SectionTitle = ({ icon, title }) => (
    <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>
        <span style={styles.sectionText}>{title}</span>
    </div>
);

const Field = ({ label, children, style }) => (
    <div style={{ marginBottom: 16, ...style }}>
        <div style={styles.labelStyle}>{label}</div>
        {children}
    </div>
);

/* ================= STYLES ================= */

const styles = {
    overlay: {
        position: "fixed", inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(6px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 2000,
    },
    modal: {
        width: 860,
        background: "#fff",
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
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
    title: { margin: 0, fontSize: 22, fontWeight: 800, color: BRAND.dark, letterSpacing: "-0.5px" },
    subtitle: { margin: "2px 0 0", fontSize: 13, color: BRAND.textMuted, fontWeight: 500 },
    closeBtn: {
        background: "transparent", border: "none", color: BRAND.textMuted,
        cursor: "pointer", padding: 8, borderRadius: "50%", transition: "0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    grid: { padding: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", background: "#FDFDFD" },
    column: { display: "flex", flexDirection: "column", gap: 8 },
    sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingLeft: 4 },
    sectionIcon: { color: BRAND.primary, fontSize: 16, display: "flex" },
    sectionText: { fontSize: 12, fontWeight: 800, color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "1px" },
    card: {
        background: "#fff", borderRadius: "20px", padding: "24px",
        border: `1.5px solid ${BRAND.border}`,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
    },
    labelStyle: { fontSize: 11, fontWeight: 700, color: BRAND.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" },
    input: {
        width: "100%", padding: "12px 16px", borderRadius: "12px",
        border: `1.5px solid ${BRAND.border}`, outline: "none",
        fontSize: "14px", fontWeight: 600, color: BRAND.text,
        background: "#F8FAFC", boxSizing: "border-box"
    },
    inputWithIcon: {
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "12px 16px", borderRadius: "12px",
        border: `1.5px solid ${BRAND.border}`, background: "#F8FAFC",
        boxSizing: "border-box"
    },
    borderlessInput: { border: "none", outline: "none", background: "transparent", fontSize: "14px", fontWeight: 600, color: BRAND.text, width: "100%" },
    row: { display: "flex", gap: 16 },
    unitToggle: { display: "flex", background: "#F1F5F9", padding: 4, borderRadius: 12, border: `1px solid ${BRAND.border}` },
    unitBtn: { flex: 1, border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", transition: "0.2s" },
    infoBox: {
        marginTop: 12, padding: "12px 16px", borderRadius: "14px", background: "#EFF6FF",
        color: BRAND.primary, fontSize: "11px", display: "flex", gap: 12, lineHeight: "1.5", fontWeight: 600,
        border: "1px solid #DBEAFE"
    },
    footer: {
        padding: "20px 30px", background: "#F8FAFC", borderTop: `1px solid ${BRAND.border}`,
        display: "flex", justifyContent: "flex-end", gap: 12,
    },
    cancelBtn: {
        background: "transparent", color: BRAND.textMuted, border: "none",
        padding: "12px 24px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", fontSize: "14px"
    },
    primaryBtn: {
        background: BRAND.primary, color: "#fff", border: "none",
        padding: "12px 32px", borderRadius: "12px", fontWeight: 700, fontSize: "15px",
        cursor: "pointer", boxShadow: `0 8px 16px ${BRAND.primary}30`, 
        display: "flex", alignItems: "center", gap: 10, transition: "0.2s",
    },
};

export default AddInventoryDialogBox;
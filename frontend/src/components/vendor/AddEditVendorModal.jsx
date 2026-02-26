import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiX, FiTruck, FiPhone, FiMail, FiDollarSign, FiSave, FiActivity } from "react-icons/fi";
import { API_BASE_URL } from "../../constants";
import InformationDialogBox from "../InformationDialogBox.jsx";

const BRAND = {
    primary: "#0B3A6F",
    dark: "#082E57",
    accent: "#F57C00",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    success: "#10B981",
    danger: "#EF4444"
};

const AddEditVendorModal = ({ open, onClose, vendor, onSuccess }) => {
    const isEdit = !!vendor;
    const token = localStorage.getItem("accessToken");

    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState({ open: false, type: "success", title: "", message: "" });

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        openingBalance: 0,
        isActive: true
    });

    useEffect(() => {
        if (vendor && open) {
            setForm({
                name: vendor.name || "",
                phone: vendor.phone || "",
                email: vendor.email || "",
                // Using creditBalance for PATCH as per your API reference
                creditBalance: vendor.openingBalance || 0, 
                isActive: vendor.isActive ?? true
            });
        } else if (open) {
            setForm({ name: "", phone: "", email: "", openingBalance: 0, isActive: true });
        }
    }, [vendor, open]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!form.name || !form.phone) {
            setDialog({ open: true, type: "error", title: "Required Fields", message: "Please enter at least the vendor name and phone number." });
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                // PATCH API - Using data structure from your curl example
                const patchPayload = {
                    name: form.name,
                    email: form.email,
                    creditBalance: form.openingBalance, // Mapping to creditBalance for update
                    isActive: form.isActive
                };
                await axios.patch(`${API_BASE_URL}/vendor/${vendor._id}`, patchPayload, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
                });
            } else {
                // POST API
                await axios.post(`${API_BASE_URL}/vendor`, form, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
                });
            }

            onSuccess();
            onClose();
        } catch (err) {
            setDialog({
                open: true,
                type: "error",
                title: "Operation Failed",
                message: err.response?.data?.message || "Something went wrong while saving the vendor.",
            });
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- INLINE STYLES ---------------- */
    const styles = {
        overlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 },
        modal: { width: "520px", background: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)", overflow: "hidden", animation: "modalPop 0.3s ease-out" },
        header: { padding: "24px 30px", background: "linear-gradient(135deg, #fff 0%, #F8FAFC 100%)", borderBottom: `1px solid ${BRAND.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
        headerTextWrapper: { display: "flex", alignItems: "center", gap: 16 },
        iconCircle: { width: 48, height: 48, borderRadius: 14, background: `${BRAND.primary}10`, display: "flex", alignItems: "center", justifyContent: "center" },
        title: { margin: 0, fontSize: "20px", fontWeight: 800, color: BRAND.dark },
        subtitle: { margin: "2px 0 0", fontSize: "13px", color: BRAND.textMuted, fontWeight: 500 },
        closeBtn: { background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer", padding: 8 },
        content: { padding: "30px", display: "flex", flexDirection: "column", gap: 18 },
        labelStyle: { fontSize: "11px", fontWeight: 700, color: BRAND.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" },
        fieldWrapper: { display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${BRAND.border}`, padding: "12px 16px", borderRadius: "14px", background: "#F8FAFC" },
        fieldIcon: { color: BRAND.primary, display: "flex", fontSize: "18px" },
        fieldInput: { border: "none", outline: "none", flex: 1, fontSize: "15px", fontWeight: 600, color: BRAND.text, background: "transparent" },
        footer: { padding: "20px 30px", background: "#F8FAFC", borderTop: `1px solid ${BRAND.border}`, display: "flex", justifyContent: "flex-end", gap: 12 },
        cancelBtn: { background: "transparent", color: BRAND.textMuted, border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: 600, cursor: "pointer" },
        primaryBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "12px 28px", borderRadius: "12px", fontWeight: 700, fontSize: "15px", boxShadow: `0 8px 16px ${BRAND.primary}30`, display: "flex", alignItems: "center", gap: 10 },
        statusToggle: { display: "flex", alignItems: "center", padding: "14px 20px", borderRadius: "16px", background: "#F8FAFC", border: `1px solid ${BRAND.border}`, cursor: "pointer" },
        toggleBadge: (active) => ({ padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, background: active ? BRAND.success : BRAND.danger, color: "#fff" })
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* HEADER */}
                <div style={styles.header}>
                    <div style={styles.headerTextWrapper}>
                        <div style={styles.iconCircle}>
                            <FiTruck size={22} color={BRAND.primary} />
                        </div>
                        <div>
                            <h3 style={styles.title}>{isEdit ? "Edit Vendor" : "New Vendor"}</h3>
                            <p style={styles.subtitle}>{isEdit ? "Update supplier information" : "Add a new procurement partner"}</p>
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}><FiX size={20} /></button>
                </div>

                {/* FORM CONTENT */}
                <div style={styles.content}>
                    <div>
                        <label style={styles.labelStyle}>Vendor / Company Name *</label>
                        <div style={styles.fieldWrapper}>
                            <FiTruck style={styles.fieldIcon} />
                            <input 
                                style={styles.fieldInput} 
                                value={form.name} 
                                placeholder="e.g. Shree Traders"
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={styles.labelStyle}>Phone Number *</label>
                            <div style={styles.fieldWrapper}>
                                <FiPhone style={styles.fieldIcon} />
                                <input 
                                    style={styles.fieldInput} 
                                    value={form.phone} 
                                    placeholder="9876543210"
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ flex: 1.2 }}>
                            <label style={styles.labelStyle}>Email Address</label>
                            <div style={styles.fieldWrapper}>
                                <FiMail style={styles.fieldIcon} />
                                <input 
                                    style={styles.fieldInput} 
                                    value={form.email} 
                                    placeholder="vendor@example.com"
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={styles.labelStyle}>Opening / Credit Balance (₹)</label>
                        <div style={styles.fieldWrapper}>
                            <FiDollarSign style={styles.fieldIcon} />
                            <input 
                                type="number"
                                style={styles.fieldInput} 
                                value={form.openingBalance} 
                                placeholder="0.00"
                                onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={styles.statusToggle} onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: BRAND.text }}>Vendor Status</div>
                            <div style={{ fontSize: "12px", color: BRAND.textMuted }}>Inactive vendors cannot be used in new purchases</div>
                        </div>
                        <div style={styles.toggleBadge(form.isActive)}>
                            {form.isActive ? "ACTIVE" : "INACTIVE"}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Discard</button>
                    <button 
                        style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }} 
                        onClick={handleSubmit} 
                        disabled={loading}
                    >
                        <FiSave size={18} /> {loading ? "Saving..." : isEdit ? "Update Vendor" : "Add Vendor"}
                    </button>
                </div>
            </div>

            <InformationDialogBox 
                open={dialog.open} 
                type={dialog.type} 
                title={dialog.title} 
                message={dialog.message} 
                onClose={() => setDialog({ ...dialog, open: false })} 
            />
        </div>
    );
};

export default AddEditVendorModal;
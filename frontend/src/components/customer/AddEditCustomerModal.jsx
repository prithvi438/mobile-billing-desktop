import React, { useEffect, useState } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiInfo } from "react-icons/fi";
import { addCustomer, updateCustomer } from "../../services/customer.service";
import InformationDialogBox from "../InformationDialogBox";

// Brand Colors
const BRAND = {
    primary: "#0B3A6F",
    dark: "#082E57",
    accent: "#F57C00",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    danger: "#EF4444"
};

const initialForm = {
    name: "",
    email: "",
    phone: "",
    creditBalance: "0",
    isActive: true,
};

const AddEditCustomerModal = ({ open, onClose, customer, onSuccess }) => {
    const isEdit = !!customer;
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState({ open: false, type: "success", title: "", message: "" });

    useEffect(() => {
        if (customer && open) {
            setForm({
                name: customer.name || "",
                email: customer.email || "",
                phone: customer.phone || "",
                creditBalance: customer.creditBalance ?? "0",
                isActive: customer.isActive ?? true,
            });
        } else if (open) {
            setForm(initialForm);
            setErrors({});
        }
    }, [customer, open]);

    if (!open) return null;

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Customer name is required";
        if (!form.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(form.phone)) {
            newErrors.phone = "Enter valid 10 digit number";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            if (isEdit) {
                await updateCustomer(customer._id, { ...form, creditBalance: Number(form.creditBalance) });
            } else {
                await addCustomer({ ...form, creditBalance: Number(form.creditBalance) });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setDialog({
                open: true,
                type: "error",
                title: "Error",
                message: err?.response?.data?.message || "Something went wrong.",
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
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                `}
            </style>
            <div style={{
                position: "fixed", inset: 0,
                background: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2000,
            }}>
                <div style={{
                    width: "100%",
                    maxWidth: "520px",
                    background: "#fff",
                    borderRadius: "24px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    overflow: "hidden",
                    animation: "modalPop 0.3s ease-out",
                    margin: "20px"
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "24px 30px",
                        background: `linear-gradient(135deg, #fff 0%, #F8FAFC 100%)`,
                        borderBottom: `1px solid ${BRAND.border}`,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "14px",
                                background: `${BRAND.primary}10`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <FiUser size={22} color={BRAND.primary} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: BRAND.dark, letterSpacing: "-0.5px" }}>
                                    {isEdit ? "Update Profile" : "New Customer"}
                                </h3>
                                <p style={{ margin: "2px 0 0", fontSize: "13px", color: BRAND.textMuted, fontWeight: 500 }}>
                                    {isEdit ? "Modify existing client records" : "Register a new client to Daksh"}
                                </p>
                            </div>
                        </div>
                        <button style={{
                            background: "transparent", border: "none", color: BRAND.textMuted,
                            cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex"
                        }} onClick={onClose}>
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <FormGroup label="Full Name" error={errors.name}>
                            <Field
                                icon={<FiUser />}
                                placeholder="Enter customer name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </FormGroup>

                        {/* Row with fixed layout to prevent overflow */}
                        <div style={{ display: "flex", gap: "16px", width: "100%" }}>
                            <FormGroup label="Phone Number" error={errors.phone} style={{ flex: 1 }}>
                                <Field
                                    icon={<FiPhone />}
                                    placeholder="10-digit mobile"
                                    disabled={isEdit}
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup label="Email (Optional)" error={errors.email} style={{ flex: 1 }}>
                                <Field
                                    icon={<FiMail />}
                                    placeholder="email@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </FormGroup>
                        </div>

                        <div style={{
                            padding: "12px 16px", borderRadius: "12px", background: "#F1F5F9",
                            color: BRAND.textMuted, fontSize: "12px", display: "flex", gap: "10px", lineHeight: "1.5", fontWeight: 500
                        }}>
                            <FiInfo style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>Ensure mobile number is correct for sending automated digital invoices via WhatsApp/SMS.</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                        padding: "20px 30px", background: "#F8FAFC", borderTop: `1px solid ${BRAND.border}`,
                        display: "flex", justifyContent: "flex-end", gap: "12px",
                    }}>
                        <button style={{
                            background: "transparent", color: BRAND.textMuted, border: "none",
                            padding: "12px 20px", borderRadius: "12px", fontWeight: 600, cursor: "pointer",
                        }} onClick={onClose}>Discard</button>
                        <button style={{
                            background: BRAND.primary, color: "#fff", border: "none",
                            padding: "12px 28px", borderRadius: "12px", fontWeight: 700, fontSize: "15px",
                            cursor: loading ? "not-allowed" : "pointer", 
                            boxShadow: `0 4px 12px ${BRAND.primary}40`, transition: "0.2s",
                        }} onClick={submit} disabled={loading}>
                            {loading ? "Processing..." : isEdit ? "Update Changes" : "Save Customer"}
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

/* ---------- REUSABLE SUB-COMPONENTS (With Inline Styles) ---------- */

const FormGroup = ({ label, error, children, style }) => (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
        <label style={{ fontSize: "12px", fontWeight: 700, color: BRAND.text, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {label}
        </label>
        {children}
        {error && <div style={{ marginTop: "6px", fontSize: "12px", color: BRAND.danger, fontWeight: 600 }}>{error}</div>}
    </div>
);

const Field = ({ icon, type = "text", value, onChange, disabled, placeholder }) => (
    <div style={{ 
        display: "flex", alignItems: "center", gap: "12px",
        border: `1.5px solid ${BRAND.border}`, padding: "12px 16px",
        borderRadius: "14px", transition: "0.2s ease",
        background: disabled ? "#F8FAFC" : "#fff",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden" // Fixes the overflow issue
    }}>
        <span style={{ color: BRAND.primary, display: "flex", fontSize: "18px", flexShrink: 0 }}>{icon}</span>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{ 
                border: "none", outline: "none", flex: 1, fontSize: "15px", 
                fontWeight: 500, color: BRAND.text, background: "transparent",
                width: "100%", minWidth: 0 // Ensures input stays inside flexbox
            }}
        />
    </div>
);

export default AddEditCustomerModal;
import React, { useState, useEffect } from 'react';
import {
    FiSave, FiRefreshCw, FiPlus, FiTrash2,
    FiCheckCircle, FiPrinter, FiHash
} from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../../constants";

// Importing the global handle for printing
// Note: Ensure this variable is exported or accessible from your printer settings file
// Or defined in a global state/window object.
let GLOBAL_PRINTER_HANDLE = window.GLOBAL_PRINTER_HANDLE || null;

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#334155",
    textMuted: "#94A3B8",
    success: "#10B981",
    danger: "#EF4444",
};

const BillSettings = () => {
    const token = localStorage.getItem("accessToken");
    const isDesktop = window.electronAPI?.isDesktop; // Check if platform is Desktop

    const [config, setConfig] = useState({
        businessName: "",
        businessAddress: "",
        phone: "",
        footer: "",
        invoicePrefix: "SAL-",
        showPhone: true,
        showQR: true,
        showPaymentMode: true,
        showPrintedBy: true,
        showGST: true,
        showTerms: true,
        showDate: true,
        showTime: true,
        terms: []
    });

    const [newTerm, setNewTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [printing, setPrinting] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const localData = localStorage.getItem("billSettings");
            if (localData) applyDataToState(JSON.parse(localData));

            try {
                const res = await axios.get(`${API_BASE_URL}/bill-settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data?.success) {
                    applyDataToState(res.data.data);
                    localStorage.setItem("billSettings", JSON.stringify(res.data.data));
                }
            } catch (e) { console.error("Background sync failed", e); }
        };
        loadSettings();
    }, [token]);

    const applyDataToState = (data) => {
        setConfig({
            businessName: data.businessName || "",
            businessAddress: data.businessAddress || "",
            phone: data.phone || "",
            footer: data.footer || "",
            invoicePrefix: data.invoicePrefix || "SAL-",
            showPhone: data.showPhone ?? true,
            showQR: data.showQR ?? true,
            showPaymentMode: data.showPaymentMode ?? true,
            showPrintedBy: data.showPrintedBy ?? true,
            showGST: data.showGST ?? true,
            showTerms: data.showTerms ?? true,
            showDate: data.showDate ?? true,
            showTime: data.showTime ?? true,
            terms: data.terms || []
        });
    };

    // --- SAMPLE PRINTING LOGIC ---
    const printSampleBill = async () => {
        let printer = window.GLOBAL_PRINTER_HANDLE;

        if (!printer) {
            const savedName = localStorage.getItem("printer_name");
            const savedId = localStorage.getItem("printer_id");

            if (savedName && savedId) {
                try {
                    setPrinting(true); // Show loading state during reconnect
                    printer = await performSilentReconnect(savedName, savedId);
                } catch (err) {
                    return alert("Could not auto-connect to printer. Please open Printer Settings.");
                }
            } else {
                return alert("No printer configured. Please go to Printer Settings first.");
            }
        }

        setPrinting(true);
        try {
            const enc = new TextEncoder();
            const line = "--------------------------------\n";

            // Constructing a preview receipt based on current state
            let commands = [
                0x1B, 0x40, // Initialize
                0x1B, 0x61, 0x01, // Center Align
                ...enc.encode(`${config.businessName || "Your Business"}\n`),
                ...enc.encode(`${config.businessAddress || "Address here"}\n`),
                ...enc.encode(line),
                ...enc.encode("SAMPLE INVOICE\n"),
                ...enc.encode(line),
            ];

            if (config.showDate) commands.push(...enc.encode(`Date: ${new Date().toLocaleDateString()}\n`));
            if (config.showTime) commands.push(...enc.encode(`Time: ${new Date().toLocaleTimeString()}\n`));

            commands.push(
                ...enc.encode(line),
                ...enc.encode("Item Total: ₹1,200.00\n"),
                ...enc.encode(line)
            );

            if (config.showTerms && config.terms.length > 0) {
                commands.push(...enc.encode("Terms:\n"));
                config.terms.forEach((t, i) => {
                    commands.push(...enc.encode(`${i + 1}. ${t}\n`));
                });
            }

            commands.push(
                ...enc.encode(`\n${config.footer || "Thank You!"}\n`),
                0x0A, 0x0A, 0x0A, 0x0A // Feed lines
            );

            const data = new Uint8Array(commands);
            // await window.GLOBAL_PRINTER_HANDLE.writeValue(data);
            await printer.writeValue(data);
        } catch (e) {
            alert("Printing failed. Ensure printer is connected.");
        } finally {
            setPrinting(false);
        }
    };

    const performSilentReconnect = async (name, id) => {
        // Talk to Electron to "select" the device for Bluetooth permission
        await window.electronAPI.selectDevice(id);

        // Mac/Desktop stabilization delay
        await new Promise(r => setTimeout(r, 600));

        const hardware = await navigator.bluetooth.requestDevice({
            filters: [{ name: name }],
            optionalServices: ['00001101-0000-1000-8000-00805f9b34fb', '000018f0-0000-1000-8000-00805f9b34fb']
        });

        const server = await hardware.gatt.connect();
        const services = await server.getPrimaryServices();

        let writeChar = null;
        for (const service of services) {
            const chars = await service.getCharacteristics();
            writeChar = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
            if (writeChar) break;
        }

        if (writeChar) {
            window.GLOBAL_PRINTER_HANDLE = writeChar; // Save back to window
            return writeChar;
        }
        throw new Error("Handle missing");
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/bill-settings`, config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                localStorage.setItem("billSettings", JSON.stringify(res.data.data));
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) { alert("Error updating settings"); }
        finally { setLoading(false); }
    };

    const handleReset = async () => {
        if (!window.confirm("Reset all billing formats to default?")) return;
        try {
            const res = await axios.delete(`${API_BASE_URL}/bill-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                applyDataToState(res.data.data);
                localStorage.setItem("billSettings", JSON.stringify(res.data.data));
            }
        } catch (e) { alert("Reset failed"); }
    };

    const addTerm = () => {
        if (!newTerm.trim()) return;
        setConfig({ ...config, terms: [...config.terms, newTerm] });
        setNewTerm("");
    };

    const removeTerm = (index) => {
        const updated = config.terms.filter((_, i) => i !== index);
        setConfig({ ...config, terms: updated });
    };

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <div>
                    <h3 style={styles.cardTitle}>Bill Customization</h3>
                    <p style={styles.cardSubtitle}>Configure how your printed and digital invoices look</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Only show Print Sample button if on Desktop */}
                    {isDesktop && (
                        <button
                            style={styles.printBtn}
                            onClick={printSampleBill}
                            disabled={printing}
                        >
                            <FiPrinter /> {printing ? "Printing..." : "Print Sample Bill"}
                        </button>
                    )}
                    <button
                        style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : saved ? <><FiCheckCircle /> Saved</> : <><FiSave /> Save Changes</>}
                    </button>
                </div>
            </div>

            <div style={styles.contentGrid}>
                <div style={styles.section}>
                    <h4 style={styles.sectionHeader}>Business Details</h4>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Business Name</label>
                        <input style={styles.input} value={config.businessName} onChange={(e) => setConfig({ ...config, businessName: e.target.value })} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Address</label>
                        <textarea style={{ ...styles.input, height: 60 }} value={config.businessAddress} onChange={(e) => setConfig({ ...config, businessAddress: e.target.value })} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Invoice Prefix</label>
                        <input style={styles.input} value={config.invoicePrefix} onChange={(e) => setConfig({ ...config, invoicePrefix: e.target.value.toUpperCase() })} />
                    </div>
                </div>

                <div style={styles.section}>
                    <h4 style={styles.sectionHeader}>Visibility Toggles</h4>
                    <div style={styles.toggleGrid}>
                        <Toggle label="Show Phone" value={config.showPhone} onChange={(v) => setConfig({ ...config, showPhone: v })} />
                        <Toggle label="Show QR Code" value={config.showQR} onChange={(v) => setConfig({ ...config, showQR: v })} />
                        <Toggle label="Payment Mode" value={config.showPaymentMode} onChange={(v) => setConfig({ ...config, showPaymentMode: v })} />
                        <Toggle label="GST Details" value={config.showGST} onChange={(v) => setConfig({ ...config, showGST: v })} />
                        <Toggle label="Show Date" value={config.showDate} onChange={(v) => setConfig({ ...config, showDate: v })} />
                        <Toggle label="Show Time" value={config.showTime} onChange={(v) => setConfig({ ...config, showTime: v })} />
                    </div>
                </div>
            </div>

            <div style={{ ...styles.section, marginTop: 24 }}>
                <h4 style={styles.sectionHeader}>Terms & Conditions</h4>
                <div style={styles.termsBox}>
                    {config.terms.map((t, i) => (
                        <div key={i} style={styles.termItem}>
                            <span>{i + 1}. {t}</span>
                            <FiTrash2 color={BRAND.danger} cursor="pointer" onClick={() => removeTerm(i)} />
                        </div>
                    ))}
                    <div style={styles.addTermRow}>
                        <input
                            style={styles.input}
                            placeholder="Add new policy..."
                            value={newTerm}
                            onChange={(e) => setNewTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTerm()}
                        />
                        <button style={styles.addBtn} onClick={addTerm}><FiPlus /></button>
                    </div>
                </div>
            </div>

            <div style={{ ...styles.formGroup, marginTop: 24 }}>
                <label style={styles.label}>Footer Message</label>
                <input style={styles.input} value={config.footer} onChange={(e) => setConfig({ ...config, footer: e.target.value })} />
            </div>

            <div style={styles.footerActions}>
                <button style={styles.resetBtn} onClick={handleReset}>
                    <FiRefreshCw /> Reset to Defaults
                </button>
            </div>
        </div>
    );
};

const Toggle = ({ label, value, onChange }) => (
    <label style={styles.toggleRow}>
        <span style={styles.toggleLabel}>{label}</span>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={styles.checkbox} />
    </label>
);

const styles = {
    // ... all existing styles ...
    card: { background: "#fff", padding: "32px", borderRadius: "24px", border: `1px solid ${BRAND.border}`, boxShadow: "0 10px 20px rgba(0,0,0,0.02)" },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    cardTitle: { margin: 0, fontSize: "20px", fontWeight: 800, color: BRAND.primary },
    cardSubtitle: { margin: "4px 0 0", color: BRAND.textMuted, fontSize: "13px" },
    contentGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 40 },
    section: { display: 'flex', flexDirection: 'column', gap: 16 },
    sectionHeader: { fontSize: "11px", fontWeight: 800, color: BRAND.accent, textTransform: "uppercase", letterSpacing: '1px', marginBottom: 8 },
    formGroup: { marginBottom: "16px" },
    label: { display: "block", fontSize: "12px", fontWeight: 700, color: BRAND.text, marginBottom: "8px" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1px solid ${BRAND.border}`, outline: "none", fontSize: "14px", background: "#F8FAFC" },
    toggleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', cursor: 'pointer' },
    toggleLabel: { fontSize: '13px', fontWeight: 600, color: BRAND.text },
    checkbox: { width: 18, height: 18, cursor: 'pointer', accentColor: BRAND.primary },
    termsBox: { background: '#F8FAFC', borderRadius: '16px', padding: '16px', border: `1px solid ${BRAND.border}` },
    termItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.03)', fontSize: '13px', color: BRAND.text },
    addTermRow: { display: 'flex', gap: 10, marginTop: 12 },
    addBtn: { background: BRAND.primary, color: '#fff', border: 'none', borderRadius: '10px', width: 45, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    // NEW PRINT BUTTON STYLE
    printBtn: { background: "#F1F5F9", color: BRAND.primary, border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", transition: '0.2s' },

    saveBtn: { background: BRAND.primary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", transition: '0.2s' },
    resetBtn: { background: 'transparent', color: BRAND.danger, border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    footerActions: { marginTop: 32, paddingTop: 20, borderTop: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'flex-end' }
};

export default BillSettings;
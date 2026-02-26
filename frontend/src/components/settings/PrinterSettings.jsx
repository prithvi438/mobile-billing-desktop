import React, { useState, useEffect, useRef } from 'react';
import { FiPrinter, FiSearch, FiCheckCircle, FiRefreshCw, FiBluetooth, FiInfo, FiTrash2, FiZap } from "react-icons/fi";

// ⭐ GLOBAL REFERENCE: Keeps the connection alive even when navigating between screens
let GLOBAL_PRINTER_HANDLE = null;

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    border: "#E2E8F0",
    success: "#10B981",
    danger: "#EF4444"
};

const PrinterSettings = () => {
    const [devices, setDevices] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const deviceBuffer = useRef([]);
    const scanActive = useRef(false);

    // 1. Initial Load: Restore from storage and global handle
    useEffect(() => {
        if (!window.electronAPI?.isDesktop) return;

        const restoreConnection = async () => {
            const savedName = localStorage.getItem("printer_name");
            const savedId = localStorage.getItem("printer_id");

            if (savedName && savedId) {
                const savedObj = { deviceName: savedName, deviceId: savedId };
                setConnectedDevice(savedObj);
                setDevices([savedObj]);

                // Check if we already have a live handle globally
                if (GLOBAL_PRINTER_HANDLE) {
                    console.log("Restoring active global handle...");
                    setIsReady(true);
                } else {
                    // Try to re-establish the bridge silently
                    console.log("Attempting silent background reconnect...");
                    await attemptConnection(savedName, savedId, true);
                }
            }
        };

        const removeListener = window.electronAPI.onDevicesFound((list) => {
            deviceBuffer.current = list;
            if (scanActive.current) setDevices([...list]);
        });

        restoreConnection();
        return () => { if (removeListener) removeListener(); };
    }, []);

    const attemptConnection = async (name, id, isSilent = false) => {
        const performConnect = async () => {
            await window.electronAPI.selectDevice(id);
            // Mac-specific stabilization delay
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
                // ⭐ SAVE TO GLOBAL & LOCAL STORAGE
                window.GLOBAL_PRINTER_HANDLE = writeChar;
                GLOBAL_PRINTER_HANDLE = writeChar;
                localStorage.setItem("printer_name", name);
                localStorage.setItem("printer_id", id);

                // ⭐ UPDATE UI STATE FIRST
                setConnectedDevice({ deviceName: name, deviceId: id });
                setIsReady(true);
                return true;
            }
            return false;
        };

        try {
            if (!isSilent) setIsConnecting(true);

            const success = await performConnect();

            if (success && !isSilent) {
                // ⭐ THE FIX: Delay the alert so React can render the Footer UI first
                setTimeout(() => {
                    alert(`✅ ${name} Connected Successfully!`);
                }, 300);
                setIsReady(true);
                setConnectedDevice(true);
            }
        } catch (err) {
            try {
                // One-click Auto-Retry logic for Mac
                const retrySuccess = await performConnect();
                if (retrySuccess && !isSilent) {
                    setTimeout(() => {
                        alert(`✅ ${name} Connected Successfully!`);
                    }, 300);
                    setIsReady(true);
                setConnectedDevice(true);
                }
            } catch (retryErr) {
                setIsReady(false);
                if (!isSilent) console.error("Final connection failure", retryErr);
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const scanForPrinters = async () => {
        setScanning(true);
        scanActive.current = true;
        setDevices([]);
        deviceBuffer.current = [];

        try {
            await window.printerAPI.startScan();
            navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
            }).catch(() => { });

            setTimeout(() => {
                const list = [...deviceBuffer.current];
                // Persist the current device in the list view during scan
                if (connectedDevice && !list.find(d => d.deviceId === connectedDevice.deviceId)) {
                    list.unshift(connectedDevice);
                }
                setDevices(list);
                setScanning(false);
                scanActive.current = false;
            }, 6000);
        } catch (e) {
            setScanning(false);
            scanActive.current = false;
        }
    };

    const forgetPrinter = () => {
        localStorage.removeItem("printer_name");
        localStorage.removeItem("printer_id");
        window.GLOBAL_PRINTER_HANDLE = null;
        GLOBAL_PRINTER_HANDLE = null;
        setConnectedDevice(null);
        setIsReady(false);
    };

    const printTest = async () => {
        // Validation: If handle died, reconnect once
        if (!GLOBAL_PRINTER_HANDLE) {
            const reconnected = await attemptConnection(connectedDevice.deviceName, connectedDevice.deviceId, true);
            if (!reconnected) return alert("Connection lost. Please ensure printer is ON.");
        }

        try {
            const enc = new TextEncoder();
            const data = new Uint8Array([
                0x1B, 0x40, 0x1B, 0x61, 0x01,
                ...enc.encode("EasyHai Ranchi\n"),
                ...enc.encode("System: PERSISTENT CONNECT\n"),
                ...enc.encode("--------------------------------\n"),
                ...enc.encode("Status: READY\n"),
                0x0A, 0x0A, 0x0A, 0x0A
            ]);
            await GLOBAL_PRINTER_HANDLE.writeValue(data);
        } catch (e) {
            GLOBAL_PRINTER_HANDLE = null;
            setIsReady(false);
            printTest(); // Recursive retry
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerIcon}><FiBluetooth /></div>
                <div style={{ flex: 1 }}>
                    <h2 style={styles.title}>Printer Settings</h2>
                    <p style={styles.subtitle}>Setup and manage your thermal printers</p>
                </div>
                <button
                    style={scanning ? styles.scanBtnDisabled : styles.scanBtn}
                    onClick={scanForPrinters}
                    disabled={scanning}
                >
                    {scanning ? <FiRefreshCw className="spin" /> : <FiSearch />}
                    {scanning ? "Searching..." : "Find Printers"}
                </button>
            </div>

            <hr style={styles.divider} />

            <div style={styles.contentBody}>
                {scanning && (
                    <div style={styles.loadingArea}>
                        <div className="pulsate" style={styles.pulseCircle}><FiPrinter /></div>
                        <p style={styles.loadingText}>Searching for Devices...</p>
                    </div>
                )}

                <div style={styles.grid}>
                    {devices.map((d, i) => (
                        <div key={i} style={{
                            ...styles.deviceCard,
                            borderColor: connectedDevice?.deviceId === d.deviceId ? BRAND.primary : BRAND.border,
                            background: connectedDevice?.deviceId === d.deviceId ? '#F1F5F9' : '#fff',
                            cursor: isConnecting ? 'wait' : 'pointer'
                        }} onClick={() => !isConnecting && attemptConnection(d.deviceName, d.deviceId)}>
                            <div style={styles.deviceCardIcon}>
                                {connectedDevice?.deviceId === d.deviceId && isReady ? <FiZap color={BRAND.accent} /> : <FiPrinter />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={styles.deviceName}>{d.deviceName}</div>
                                <div style={styles.deviceStatus}>{connectedDevice?.deviceId === d.deviceId && isReady ? 'Completely Connected' : 'Available'}</div>
                            </div>
                            {connectedDevice?.deviceId === d.deviceId && isReady && <FiCheckCircle color={BRAND.success} size={20} />}
                        </div>
                    ))}
                </div>
            </div>

            {isReady && connectedDevice && (
                <div style={styles.footer}>
                    <div style={styles.connectedInfo}>
                        <FiCheckCircle color={BRAND.success} />
                        <span>Active: <strong>{connectedDevice.deviceName}</strong></span>
                        <button style={styles.forgetBtn} onClick={forgetPrinter}><FiTrash2 /> Forget</button>
                    </div>
                    <button style={styles.testBtn} onClick={printTest} disabled={isConnecting}>
                        Print Test Receipt
                    </button>
                </div>
            )}
        </div>
    );
};

/* --- STYLES --- */
const styles = {
    container: { background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: `1px solid ${BRAND.border}`, maxWidth: '850px', margin: '20px auto', overflow: 'hidden' },
    header: { padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' },
    headerIcon: { width: '52px', height: '52px', background: BRAND.primary, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px' },
    title: { margin: 0, fontSize: '22px', fontWeight: 800, color: '#0F172A' },
    subtitle: { margin: 0, fontSize: '14px', color: '#64748B' },
    scanBtn: { background: BRAND.primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' },
    scanBtnDisabled: { background: '#CBD5E1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' },
    divider: { margin: 0, border: 0, borderTop: `1px solid ${BRAND.border}` },
    contentBody: { padding: '32px', minHeight: '250px' },
    loadingArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0' },
    pulseCircle: { width: '64px', height: '64px', borderRadius: '50%', background: '#0B3A6F10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.primary, fontSize: '28px', marginBottom: '16px' },
    loadingText: { color: BRAND.primary, fontWeight: 700, fontSize: '15px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
    deviceCard: { border: '2.5px solid', padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '16px', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)' },
    deviceCardIcon: { width: '42px', height: '42px', background: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' },
    deviceName: { fontWeight: 750, color: '#1E293B', fontSize: '15.5px' },
    deviceStatus: { fontSize: '12px', color: '#94A3B8', fontWeight: 500 },
    footer: { padding: '24px 32px', background: '#F8FAFC', borderTop: `1px solid ${BRAND.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    connectedInfo: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#475569' },
    forgetBtn: { background: 'none', border: 'none', color: BRAND.danger, cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' },
    testBtn: { background: BRAND.accent, color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 124, 0, 0.2)' },
};

export default PrinterSettings;
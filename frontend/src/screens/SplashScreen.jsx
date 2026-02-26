import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import logo from "../assets/logo.svg";

const BRAND = {
  primary: "#0B3A6F",
  dark: "#082E57",
  accent: "#F57C00",
};

export default function SplashScreen() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const animationTimer = setTimeout(() => setAnimate(true), 50);

    const handleNavigation = async () => {
      // 1. Initial visual delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const refreshToken = localStorage.getItem("refreshToken");

      // 2. Auth Check
      if (!refreshToken || refreshToken === "null") {
        _goTo("/login");
        return;
      }

      const tokenRefreshed = await attemptTokenRefresh(refreshToken);
      if (!tokenRefreshed) {
        localStorage.clear();
        _goTo("/login");
        return;
      }

      // ⭐ FIXED SILENT HANDSHAKE: Logic moved inside handleNavigation
      const savedPrinterId = localStorage.getItem("printer_id");
      const savedPrinterName = localStorage.getItem("printer_name");

      if (window.electronAPI?.isDesktop && savedPrinterId && savedPrinterName) {
        console.log("EasyHai: Re-establishing printer handshake...");
        // Use the helper to re-establish the GLOBAL_PRINTER_HANDLE
        performSilentReconnect(savedPrinterName, savedPrinterId)
          .then(() => console.log("✅ Printer reconnected successfully"))
          .catch(err => console.warn("⚠️ Silent handshake failed:", err));
      }

      // 3. Sync Settings & Check Subscription
      await fetchAndSaveBillSettings();
      const subscriptionData = await checkSubscription();

      if (!subscriptionData) {
        _goTo("/landing/dashboard");
        return;
      }

      const { isExpired, isAccessAllowed } = subscriptionData.subscription || {};

      // 4. Final Navigation with transition delay
      setTimeout(() => {
        if (isAccessAllowed === false) {
          _goTo("/subscription-end");
        } else if (isExpired) {
          _goTo("/subscription-renew", { subscriptionData });
        } else {
          _goTo("/landing/dashboard");
        }
      }, 1500); 
    };

    handleNavigation();
    return () => clearTimeout(animationTimer);
  }, [navigate]);

  // ================= HELPERS (SAME AS WORKING BILL SETTINGS) =================

  const performSilentReconnect = async (name, id) => {
    try {
      // 1. Approve device in Electron
      if (window.electronAPI?.setSelectedPrinter) {
        window.electronAPI.setSelectedPrinter(id);
    }
      
      // 2. Stabilization delay
      await new Promise(r => setTimeout(r, 800));

      // 3. Request the device via Web Bluetooth
      const hardware = await navigator.bluetooth.requestDevice({
        filters: [{ name: name }],
        optionalServices: ['00001101-0000-1000-8000-00805f9b34fb', '000018f0-0000-1000-8000-00805f9b34fb']
      });

      // 4. Connect to GATT Server
      const server = await hardware.gatt.connect();
      const services = await server.getPrimaryServices();

      // 5. Find the Write Characteristic
      let writeChar = null;
      for (const service of services) {
        const chars = await service.getCharacteristics();
        writeChar = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
        if (writeChar) break;
      }

      if (writeChar) {
        // ⭐ SAVE TO GLOBAL WINDOW OBJECT
        window.GLOBAL_PRINTER_HANDLE = writeChar;
        return true;
      }
    } catch (e) {
      throw e;
    }
  };

  const _goTo = (path, state = null) => {
    navigate(path, { replace: true, state });
  };

  const attemptTokenRefresh = async (token) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/user/refresh-token`, { refreshToken: token });
      if (res.data?.success) {
        localStorage.setItem("accessToken", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
        return true;
      }
    } catch (e) { return false; }
  };

  const fetchAndSaveBillSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_BASE_URL}/bill-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        localStorage.setItem("billSettings", JSON.stringify(res.data.data));
        if (res.data.data.businessName) localStorage.setItem("businessName", res.data.data.businessName);
        if (res.data.data.businessAddress) localStorage.setItem("businessAddress", res.data.data.businessAddress);
      }
    } catch (e) { console.error("Bill settings sync failed"); }
  };

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_BASE_URL}/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data?.success ? res.data.data : null;
    } catch (e) { return null; }
  };

  return (
    <div style={styles.container}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: animate ? 'scale(1)' : 'scale(0.9)', opacity: animate ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={styles.logoCard}>
          <img src={logo} alt="EasyHai Logo" style={{ width: 85, height: 85 }} />
        </div>
        <div style={styles.textGroup}>
          <h1 style={styles.brandTitle}>EasyHai<span style={{ color: BRAND.accent }}>.</span></h1>
          <p style={styles.tagline}>EVERYTHING EASY</p>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 60, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16, opacity: animate ? 0.6 : 0, transition: 'opacity 1s ease 0.4s'
      }}>
        <div style={styles.loaderLine}><div style={styles.loaderProgress} /></div>
        <span style={styles.footerNote}>Innovation by Daksh Labs</span>
      </div>
    </div>
  );
}

const styles = {
  container: { height: "100vh", width: "100vw", background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.dark} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", position: 'relative' },
  logoCard: { height: 140, width: 140, backgroundColor: "#FFFFFF", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0px 20px 40px rgba(0,0,0,0.3)", marginBottom: 24 },
  brandTitle: { fontSize: 36, fontWeight: 900, color: "#FFFFFF", letterSpacing: -1, margin: 0 },
  tagline: { fontSize: 12, fontWeight: 700, color: BRAND.accent, letterSpacing: 4, marginTop: 4, textTransform: 'uppercase' },
  loaderLine: { width: 140, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: 'hidden' },
  loaderProgress: { width: '60%', height: '100%', background: BRAND.accent, borderRadius: 10, animation: 'shimmer 1.5s infinite ease-in-out' },
  footerNote: { fontSize: 10, color: "#FFFFFF", fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.8 }
};
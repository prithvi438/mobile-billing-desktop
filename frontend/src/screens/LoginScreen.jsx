import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../constants.js";
import logo from "../assets/logo.svg";

const BRAND = {
    primary: "#0B3A6F",
    dark: "#082E57",
    accent: "#F57C00",
    text: "#1E293B",
    muted: "#64748B",
    border: "#E2E8F0"
};

export default function LoginScreen() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ================= NEW HELPERS (Same as Splash) =================

    const fetchAndSaveBillSettings = async (token) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/bill-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.success) {
                localStorage.setItem("billSettings", JSON.stringify(res.data.data));
            }
        } catch (e) { console.error("Bill settings fetch failed"); }
    };

    const checkSubscription = async (token) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/subscription`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.success) {
                return res.data.data;
            }
        } catch (e) { console.error("Subscription check failed"); }
        return null;
    };

    // ================= LOGIN LOGIC =================

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await axios.post(`${API_BASE_URL}/user/login`, { email, password });
            const payload = res.data;

            if (payload.success) {
                const { accessToken, refreshToken, user, business } = payload.data;

                if (window.electronAPI?.isDesktop) {
                    const savedAddress = localStorage.getItem("printer_id");
                    if (savedAddress) {
                        console.log("Attempting to auto-connect to printer...");
                        window.printerAPI.autoConnect(savedAddress)
                            .then(res => {
                                if (res.success) {
                                    console.log("Printer ready in background");
                                }
                            })
                            .catch(err => console.log("Silent auto-connect failed"));
                    }
                }

                // 1. Store Auth Data
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("userId", user._id);
                localStorage.setItem("userName", user.name);
                localStorage.setItem("userRole", user.role);
                localStorage.setItem("businessId", business._id);
                localStorage.setItem("businessName", business.name);

                // 2. Fetch Bill Settings (For Offline/Fast access)
                await fetchAndSaveBillSettings(accessToken);

                // 3. Evaluate Subscription (Same Logic as Splash)
                const subscriptionData = await checkSubscription(accessToken);

                if (!subscriptionData) {
                    navigate("/landing/dashboard", { replace: true });
                    return;
                }

                const subscription = subscriptionData.subscription;
                const isExpired = subscription?.isExpired ?? false;
                const isAccessAllowed = subscription?.isAccessAllowed ?? true;

                // 4. Decisive Navigation
                if (!isAccessAllowed) {
                    navigate("/subscription-end", { replace: true });
                } else if (isExpired) {
                    navigate("/subscription-renew", {
                        replace: true,
                        state: { subscriptionData }
                    });
                } else {
                    navigate("/landing/dashboard", { replace: true });
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials or server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.mainCard}>
                {/* LEFT – LOGIN FORM */}
                <div style={styles.formSection}>
                    <div style={{ maxWidth: 400, width: "100%" }}>
                        <h2 style={styles.title}>Welcome Back<span style={{ color: BRAND.accent }}>.</span></h2>
                        <p style={styles.subtitle}>Enter details to access your dashboard</p>

                        {error && <div style={styles.errorBadge}>{error}</div>}

                        <form onSubmit={handleLogin} style={{ marginTop: 32 }}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@business.com"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={styles.label}>Password</label>
                                    <span onClick={() => navigate("/forgot-password")} style={styles.forgotLink}>Forgot?</span>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={styles.input}
                                    />
                                    <span onClick={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                                        {showPassword ? "Hide" : "Show"}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.loginBtn,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? "not-allowed" : "pointer"
                                }}
                            >
                                {loading ? "Authenticating..." : "Sign In"}
                            </button>
                        </form>

                        <div style={styles.signupText}>
                            New to EasyHai? <span onClick={() => navigate("/signup")} style={styles.signupLink}>Create an account</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT – BRAND PANEL */}
                <div style={styles.brandSection}>
                    <div style={styles.logoContainer}>
                        <img src={logo} alt="EasyHai" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 30 }}>
                        <h1 style={styles.brandName}>EasyHai</h1>
                        <p style={styles.brandTagline}>EVERYTHING EASY</p>
                        <div style={styles.divider} />
                        <p style={styles.brandDescription}>The complete ERP solution for Inventory, <br /> Billing, and Growth.</p>
                    </div>
                    <div style={styles.footerNote}>Powered by Daksh Innovation Labs</div>
                </div>
            </div>
        </div>
    );
}

// ... styles object remains exactly the same as provided in your prompt ...
const styles = {
    pageWrapper: { minHeight: "100vh", background: `radial-gradient(at 0% 0%, #F8FAFC 0%, #E2E8F0 100%)`, display: "flex", justifyContent: "center", alignItems: "center", padding: 20, fontFamily: "'Inter', sans-serif" },
    mainCard: { width: "100%", maxWidth: 1050, minHeight: 640, background: "#fff", borderRadius: 32, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)", display: "flex", overflow: "hidden" },
    formSection: { flex: 1.2, padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
    brandSection: { flex: 1, background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.dark} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative", color: "#fff" },
    title: { fontSize: 32, fontWeight: 800, color: BRAND.primary, letterSpacing: "-1px", margin: 0 },
    subtitle: { color: BRAND.muted, fontSize: 16, marginTop: 8, fontWeight: 500 },
    errorBadge: { marginTop: 20, background: "#FFF1F2", color: "#E11D48", padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, border: "1px solid #FFE4E6" },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: 700, color: BRAND.text, marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${BRAND.border}`, fontSize: 15, outline: "none", transition: "0.2s", background: "#F8FAFC", boxSizing: "border-box" },
    passwordToggle: { position: "absolute", right: 16, top: 14, cursor: "pointer", fontSize: 12, color: BRAND.primary, fontWeight: 700, textTransform: 'uppercase' },
    forgotLink: { fontSize: 13, color: BRAND.accent, cursor: "pointer", fontWeight: 700 },
    loginBtn: { marginTop: 12, width: "100%", height: 56, background: BRAND.primary, color: "#fff", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, boxShadow: `0 10px 15px -3px rgba(11, 58, 111, 0.3)`, transition: "transform 0.2s ease" },
    signupText: { marginTop: 32, fontSize: 14, color: BRAND.muted, textAlign: 'center', fontWeight: 500 },
    signupLink: { color: BRAND.primary, fontWeight: 700, cursor: "pointer", textDecoration: 'underline' },
    logoContainer: { width: 130, height: 130, background: "rgba(255, 255, 255, 1)", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" },
    brandName: { fontSize: 38, fontWeight: 900, letterSpacing: 1, margin: 0 },
    brandTagline: { fontSize: 12, fontWeight: 700, letterSpacing: 4, color: BRAND.accent, margin: "8px 0" },
    divider: { width: 40, height: 4, background: BRAND.accent, borderRadius: 2, margin: "20px auto" },
    brandDescription: { fontSize: 15, lineHeight: 1.6, opacity: 0.8, fontWeight: 400 },
    footerNote: { position: "absolute", bottom: 30, fontSize: 11, opacity: 0.5, letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase' }
};
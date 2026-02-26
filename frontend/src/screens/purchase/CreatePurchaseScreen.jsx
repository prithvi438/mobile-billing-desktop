import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiSearch, FiPlus, FiMinus, FiTruck, FiUser,
    FiSave, FiX, FiPackage, FiPrinter, FiCheckCircle, FiDollarSign
} from "react-icons/fi";
import { API_BASE_URL } from "../../constants.js";
import InformationDialogBox from "../../components/InformationDialogBox.jsx";
import AddEditVendorModal from "../../components/vendor/AddEditVendorModal.jsx";

const BRAND = {
    primary: "#0B3A6F",
    accent: "#F57C00",
    bg: "#F8FAFC",
    border: "#CBD5E1",
    white: "#FFFFFF",
    text: "#1E293B",
    textMuted: "#64748B"
};

export default function CreatePurchaseScreen() {
    const token = localStorage.getItem("accessToken");
    const navigate = useNavigate();
    const inventoryScrollRef = useRef(null);
    const vendorDropdownRef = useRef(null);

    /* ================= STATE ================= */
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([{ _id: "all", name: "All Items" }]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState({});

    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorPage, setVendorPage] = useState(1);
    const [vendorTotalPages, setVendorTotalPages] = useState(1);
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [vendorLoading, setVendorLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [paidAmount, setPaidAmount] = useState(0);
    const [narration, setNarration] = useState("");
    const [infoDialog, setInfoDialog] = useState({ open: false, type: "info", title: "", message: "" });
    const [showVendorModal, setShowVendorModal] = useState(false);

    /* ================= FETCHING LOGIC ================= */

    const fetchVendors = useCallback(async (reset = false) => {
        try {
            setVendorLoading(true);
            const currentPage = reset ? 1 : vendorPage;
            const res = await axios.get(`${API_BASE_URL}/vendor`, {
                params: {
                    page: currentPage,
                    limit: 15,
                    search: vendorSearch // This now correctly uses the state
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            const payload = res.data.data;

            if (reset) {
                setVendors(payload.data);
                setVendorPage(2);
                setVendorTotalPages(payload.meta.totalPages);
            } else {
                setVendors(prev => [...prev, ...payload.data]);
                setVendorPage(currentPage + 1);
            }
        } catch (err) {
            console.error("Vendor error:", err);
        } finally {
            setVendorLoading(false);
        }
    }, [vendorSearch, vendorPage, token]);


    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/category?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.data?.data) {
                setCategories([{ _id: "all", name: "All Items" }, ...res.data.data.data]);
            }
        } catch (e) { console.error("Category error:", e); }
    }, [token]);

    const fetchInventory = useCallback(async (reset = false) => {
        if (loading || (!hasMore && !reset)) return;
        setLoading(true);

        try {
            const currentPage = reset ? 1 : page;
            const res = await axios.get(`${API_BASE_URL}/inventory`, {
                params: {
                    page: currentPage,
                    limit: 24,
                    search: search, // Correctly passing search from state
                    category: selectedCategory === "all" ? "" : selectedCategory, // Correctly passing category
                    isActive: true
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            const newData = res.data?.data?.data || [];

            if (reset) {
                setInventory(newData);
                setPage(2);
                setHasMore(newData.length === 24);
            } else {
                setInventory(prev => [...prev, ...newData]);
                setPage(currentPage + 1);
                setHasMore(newData.length === 24);
            }
        } catch (e) {
            setInfoDialog({
                open: true,
                type: "error",
                title: "Inventory Error",
                message: "Failed to load products. Please try again."
            });
        } finally {
            setLoading(false);
        }
    }, [token, page, loading, hasMore, search, selectedCategory]);

    /* ================= EFFECTS ================= */

    useEffect(() => {
        fetchCategories();
        fetchVendors(true);
    }, [fetchCategories, fetchVendors]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (showVendorDropdown || vendorSearch.length > 0) {
                fetchVendors(true);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [vendorSearch]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInventory(true);
            if (inventoryScrollRef.current) inventoryScrollRef.current.scrollTop = 0;
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, selectedCategory]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target)) {
                setShowVendorDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ================= EVENT HANDLERS ================= */

    const addToCart = (item) => {
        // Validation: Ensure item has an ID before adding to cart
        if (!item._id) {
            setInfoDialog({
                open: true,
                type: "error",
                title: "Invalid Item",
                message: "This item cannot be added because it lacks a valid ID."
            });
            return;
        }

        setCart((prev) => {
            const current = prev[item._id] || { ...item, quantity: 0 };
            return {
                ...prev,
                [item._id]: {
                    ...current,
                    // Explicitly mapping _id to 'inventory' as required by your API
                    inventory: item._id,
                    name: item.name,
                    rate: item.costPrice || 0,
                    quantity: current.quantity + 1
                }
            };
        });
    };

    const updateCartQty = (id, delta) => {
        setCart(prev => {
            const item = prev[id];
            if (!item) return prev;
            const newQty = item.quantity + delta;
            if (newQty <= 0) { const newState = { ...prev }; delete newState[id]; return newState; }
            return { ...prev, [id]: { ...item, quantity: newQty } };
        });
    };

    const totalAmount = Object.values(cart).reduce((s, i) => s + (i.rate * i.quantity), 0);

    const handleSave = async () => {
        const cartItems = Object.values(cart);

        if (cartItems.length === 0) {
            setInfoDialog({ open: true, type: "error", title: "Empty Cart", message: "Please add at least one item to record a purchase." });
            return;
        }

        if (!selectedVendor && !vendorSearch) {
            setInfoDialog({ open: true, type: "error", title: "Vendor Required", message: "Please select a vendor or enter a supplier name to continue." });
            return;
        }

        try {
            const payload = {
                supplierName: selectedVendor ? selectedVendor.name : vendorSearch,
                vendor: selectedVendor?._id || null,
                notes: narration,
                // Ensure paidAmount is a valid number, fallback to 0
                paidAmount: Number(paidAmount) || 0,
                items: cartItems.map(i => ({
                    // Re-verifying the inventory ID field
                    inventory: i.inventory || i._id,
                    quantity: Number(i.quantity),
                    rate: Number(i.rate)
                }))
            };

            // Log payload for debugging (optional: remove in production)
            console.log("Sending Purchase Payload:", payload);

            const res = await axios.post(`${API_BASE_URL}/voucher/purchase`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInfoDialog({
                open: true,
                type: "success",
                title: "Purchase Recorded",
                message: "The purchase has been saved and stock has been updated successfully!"
            });

            // Reset Form
            setCart({});
            setSelectedVendor(null);
            setVendorSearch("");
            setPaidAmount(0);
            setNarration("");
        } catch (e) {
            console.error("Save Error:", e.response?.data);
            setInfoDialog({
                open: true,
                type: "error",
                title: "Save Failed",
                message: e.response?.data?.message || "Inventory item not found or is inactive. Please refresh and try again."
            });
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: BRAND.bg, fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

            {/* LEFT: ITEM BROWSER */}
            <div style={{ flex: 2, display: "flex", flexDirection: "column", height: "100vh", borderRight: `1px solid ${BRAND.border}` }}>
                <div style={{ padding: "16px 30px", background: "#fff", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <h2 style={{ margin: 0, color: BRAND.primary, fontSize: "22px", fontWeight: 800 }}>Create Purchase</h2>
                    <div style={{ display: "flex", background: BRAND.bg, padding: "8px 16px", borderRadius: "10px", border: `1px solid ${BRAND.border}`, width: "40%" }}>
                        <FiSearch style={{ marginTop: "3px", marginRight: "10px", color: BRAND.textMuted }} />
                        <input
                            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px" }}
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ padding: "12px 30px", background: "#fff", borderBottom: `1px solid ${BRAND.border}`, display: "flex", gap: "10px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)} // Clicking resets through the useEffect above
                            style={{
                                padding: "8px 18px",
                                borderRadius: "10px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 700,
                                backgroundColor: selectedCategory === cat._id ? BRAND.primary : BRAND.bg,
                                color: selectedCategory === cat._id ? "#fff" : BRAND.text,
                                transition: "0.2s"
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div ref={inventoryScrollRef} onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasMore) fetchInventory();
                }} style={{ flex: 1, overflowY: "auto", padding: "20px 30px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "16px" }}>
                        {inventory.map((item) => (
                            <div key={item._id} onClick={() => addToCart(item)} style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "14px", border: `1px solid ${BRAND.border}`, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "110px" }}>
                                <div>
                                    <div style={{ fontSize: "10px", fontWeight: 800, color: BRAND.accent }}>COST: ₹{item.costPrice || 0}</div>
                                    <div style={{ fontWeight: 700, fontSize: "14px", color: BRAND.text }}>{item.name}</div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "11px", color: BRAND.textMuted }}>Current: {item.quantity}</span>
                                    {cart[item._id] && <div style={{ background: BRAND.accent, color: "#FFFFFF", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>{cart[item._id].quantity}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: PROCUREMENT PANEL */}
            <div style={{ flex: 1.1, backgroundColor: "#fff", display: "flex", flexDirection: "column", height: "100vh", boxShadow: "-5px 0 20px rgba(0,0,0,0.05)" }}>

                <div style={{ padding: "20px 25px", borderBottom: `1px solid ${BRAND.border}`, flexShrink: 0, position: "relative" }} ref={vendorDropdownRef}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>Vendor / Supplier</h4>

                    {selectedVendor ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `${BRAND.primary}08`, padding: "10px 15px", borderRadius: "12px", border: `1px solid ${BRAND.primary}20` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <FiTruck color={BRAND.primary} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "14px", color: BRAND.text }}>{selectedVendor.name}</div>
                                    <div style={{ fontSize: "11px", color: BRAND.textMuted }}>{selectedVendor.phone}</div>
                                </div>
                            </div>
                            <FiX onClick={() => { setSelectedVendor(null); setVendorSearch(""); }} style={{ cursor: "pointer", color: BRAND.textMuted }} />
                        </div>
                    ) : (
                        <div style={{ position: "relative" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <div style={{ flex: 1, display: "flex", background: BRAND.bg, padding: "10px 12px", borderRadius: "10px", border: `1px solid ${BRAND.border}`, alignItems: "center" }}>
                                    <FiTruck style={{ marginRight: "8px", color: BRAND.textMuted }} />
                                    <input
                                        style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", width: "100%" }}
                                        placeholder="Search Vendor or enter Supplier Name..."
                                        value={vendorSearch}
                                        onFocus={() => setShowVendorDropdown(true)}
                                        onChange={(e) => setVendorSearch(e.target.value)}
                                    />
                                </div>
                                <button onClick={() => setShowVendorModal(true)} style={{ background: BRAND.primary, color: "#fff", border: "none", borderRadius: "10px", padding: "0 12px", cursor: "pointer" }}><FiPlus /></button>
                            </div>

                            {showVendorDropdown && (
                                <div style={styles.dropdownMenu}>
                                    <div style={styles.dropdownContent} onScroll={(e) => {
                                        const { scrollTop, scrollHeight, clientHeight } = e.target;
                                        if (scrollHeight - scrollTop <= clientHeight + 5 && !vendorLoading && vendorPage <= vendorTotalPages) fetchVendors();
                                    }}>
                                        {vendors.length > 0 ? vendors.map(v => (
                                            <div key={v._id} style={styles.dropdownItem} onClick={() => { setSelectedVendor(v); setShowVendorDropdown(false); }}>
                                                <div style={{ fontWeight: 600 }}>{v.name}</div>
                                                <div style={{ fontSize: "11px", color: BRAND.textMuted }}>{v.phone}</div>
                                            </div>
                                        )) : !vendorLoading && <div style={{ padding: 15, textAlign: "center", fontSize: "13px" }}>No vendors found</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "0 25px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", borderBottom: `1px solid ${BRAND.bg}`, fontSize: "10px", color: BRAND.textMuted, zIndex: 10 }}>
                            <tr><th style={{ textAlign: "left", padding: "12px 0" }}>ITEM</th><th style={{ textAlign: "center" }}>QTY</th><th style={{ textAlign: "right" }}>AMOUNT</th></tr>
                        </thead>
                        <tbody>
                            {Object.values(cart).map(item => (
                                <tr key={item.inventory} style={{ borderBottom: `1px solid ${BRAND.bg}` }}>
                                    <td style={{ padding: "12px 0" }}><div style={{ fontWeight: 700, fontSize: "13px" }}>{item.name}</div><div style={{ fontSize: "10px", color: BRAND.textMuted }}>Rate: ₹{item.rate}</div></td>
                                    <td style={{ textAlign: "center" }}><div style={{ display: "inline-flex", alignItems: "center", background: BRAND.bg, borderRadius: "6px", padding: "2px" }}><button onClick={() => updateCartQty(item.inventory, -1)} style={styles.qtyBtn}><FiMinus size={10} /></button><span style={{ margin: "0 8px", fontWeight: 700, fontSize: "12px" }}>{item.quantity}</span><button onClick={() => updateCartQty(item.inventory, 1)} style={styles.qtyBtn}><FiPlus size={10} /></button></div></td>
                                    <td style={{ textAlign: "right", fontWeight: 700, fontSize: "13px" }}>₹{(item.rate * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* BILL SUMMARY */}
                <div style={{ padding: "20px 25px", backgroundColor: BRAND.white, borderTop: `1px solid ${BRAND.border}`, flexShrink: 0 }}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ fontSize: "11px", color: BRAND.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: "8px", display: "block" }}>Amount Paid (₹)</label>
                        <input
                            type="number"
                            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${BRAND.border}`, background: BRAND.bg, outline: "none", fontWeight: 700 }}
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                        />
                    </div>

                    <div style={{ background: BRAND.primary, color: "#fff", padding: "16px", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div><div style={{ fontSize: "10px", opacity: 0.8 }}>Total Purchase Value</div><div style={{ fontSize: "28px", fontWeight: 900 }}>₹{totalAmount.toFixed(2)}</div></div>
                        <FiPackage size={28} style={{ opacity: 0.3 }} />
                    </div>

                    <button onClick={handleSave} disabled={Object.keys(cart).length === 0} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: Object.keys(cart).length > 0 ? BRAND.primary : "#CBD5E1", color: "#FFFFFF", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <FiSave /> Record Purchase
                    </button>
                </div>
            </div>

            <InformationDialogBox
                open={infoDialog.open} type={infoDialog.type} title={infoDialog.title} message={infoDialog.message}
                onClose={() => { setInfoDialog(p => ({ ...p, open: false })); if (infoDialog.type === "success") navigate("/landing/purchase"); }}
            />

            <AddEditVendorModal
                open={showVendorModal}
                onClose={() => setShowVendorModal(false)}
                onSuccess={() => { fetchVendors(true); }}
            />
        </div>
    );
}

const styles = {
    dropdownMenu: { position: "absolute", top: "105%", left: 0, right: 0, backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 100, border: `1px solid ${BRAND.border}`, overflow: "hidden" },
    dropdownContent: { maxHeight: "200px", overflowY: "auto" },
    dropdownItem: { padding: "12px 15px", borderBottom: `1px solid ${BRAND.bg}`, cursor: "pointer" },
    qtyBtn: { border: "none", background: "#FFFFFF", borderRadius: "4px", width: "22px", height: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
};
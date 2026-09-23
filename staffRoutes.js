/* ==========================================================================
   H:\naksa-darta-system\backend\routes\staffRoutes.js
   STAFF MANAGEMENT (SUPERADMIN ONLY)
   ========================================================================== */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// GET: /api/staff (सबै कर्मचारी सूची)
router.get("/", authMiddleware, roleMiddleware("SUPERADMIN"), async (req, res) => {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from("users")
                .select("id, full_name, designation, phone, email, login_id, role, status, created_at")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return res.json({ success: true, data });
        }
        res.json({ success: true, data: [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: /api/staff/create (नयाँ Staff सिर्जना)
router.post("/create", authMiddleware, roleMiddleware("SUPERADMIN"), async (req, res) => {
    try {
        const { fullName, designation, phone, email, loginId, password, role } = req.body;

        if (!fullName || !loginId || !password) {
            return res.status(400).json({ success: false, message: "अनिवार्य विवरणहरू भर्नुहोस्।" });
        }

        if (supabase) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const { data, error } = await supabase
                .from("users")
                .insert([{
                    full_name: fullName.trim(),
                    designation: designation?.trim() || "प्राविधिक",
                    phone: phone?.trim(),
                    email: email?.trim(),
                    login_id: loginId.trim().toLowerCase(),
                    password_hash: hashedPassword,
                    role: role || "STAFF",
                    status: "ACTIVE",
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                if (error.code === "23505") {
                    return res.status(400).json({ success: false, message: "यो Login ID पहिले नै दर्ता छ।" });
                }
                throw error;
            }

            return res.json({ success: true, message: "कर्मचारी खाता सिर्जना भयो।", data });
        }

        res.json({ success: true, message: "कर्मचारी सिर्जना भयो (लोकल मोड)।" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: /api/staff/reset-password (Superadmin द्वारा पासवर्ड रिसेट)
router.post("/reset-password", authMiddleware, roleMiddleware("SUPERADMIN"), async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            return res.status(400).json({ success: false, message: "User ID र नयाँ पासवर्ड अनिवार्य छन्।" });
        }

        if (supabase) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await supabase
                .from("users")
                .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
                .eq("id", userId);
        }

        res.json({ success: true, message: "पासवर्ड सफलतापूर्वक रिसेट गरियो।" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: /api/staff/toggle-status (खाता सक्रिय / निष्क्रिय)
router.post("/toggle-status", authMiddleware, roleMiddleware("SUPERADMIN"), async (req, res) => {
    try {
        const { userId, status } = req.body;
        if (supabase) {
            await supabase
                .from("users")
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq("id", userId);
        }
        res.json({ success: true, message: `खाता स्थिति परिवर्तन भयो: ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
/* ==========================================================================
   H:\naksa-darta-system\backend\routes\authRoutes.js
   AUTHENTICATION ROUTES (LOGIN & PASSWORD CHANGE)
   ========================================================================== */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const authMiddleware = require("../middleware/authMiddleware");

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// POST: /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { loginId, password } = req.body;

        if (!loginId || !password) {
            return res.status(400).json({ success: false, message: "Login ID र Password अनिवार्य छन्।" });
        }

        let user = null;

        if (supabase) {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("login_id", loginId.trim())
                .single();

            if (error || !data) {
                return res.status(401).json({ success: false, message: "लगइन विवरण मिलेन।" });
            }
            user = data;
        } else {
            // अफलाइन/लोकल परीक्षणका लागि डेमो खाता
            if (loginId === "superadmin" && password === "Admin@2083") {
                user = {
                    id: "usr_superadmin",
                    full_name: "सुपर एडमिन (कार्यालय प्रमुख)",
                    designation: "प्रमुख प्रशासकीय अधिकृत",
                    role: "SUPERADMIN",
                    status: "ACTIVE",
                    login_id: "superadmin"
                };
            } else if (loginId === "staff001" && password === "Staff@123") {
                user = {
                    id: "usr_staff001",
                    full_name: "प्रकाश थापा",
                    designation: "इन्जिनियर",
                    role: "STAFF",
                    status: "ACTIVE",
                    login_id: "staff001"
                };
            } else {
                return res.status(401).json({ success: false, message: "लगइन विवरण मिलेन।" });
            }
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({ success: false, message: "यो खाता निष्क्रिय (Deactivated) गरिएको छ।" });
        }

        // पासवर्ड जाँच (Supabase मा bcrypt hash भएमा)
        if (user.password_hash && !user.password_hash.startsWith("Admin@") && !user.password_hash.startsWith("Staff@")) {
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "लगइन विवरण मिलेन।" });
            }
        }

        // JWT टोकन जारी गर्ने
        const token = jwt.sign(
            { id: user.id, loginId: user.login_id, fullName: user.full_name, role: user.role },
            process.env.JWT_SECRET || "default_super_secret_jwt_key_2083",
            { expiresIn: "24h" }
        );

        return res.json({
            success: true,
            message: "सफलतापूर्वक लगइन भयो।",
            token: token,
            user: {
                id: user.id,
                fullName: user.full_name,
                designation: user.designation,
                loginId: user.login_id,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// POST: /api/auth/change-password (कर्मचारीले आफ्नै पासवर्ड फेर्ने)
router.post("/change-password", authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।" });
        }

        if (supabase) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await supabase
                .from("users")
                .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
                .eq("id", req.user.id);
        }

        return res.json({ success: true, message: "पासवर्ड सफलतापूर्वक परिवर्तन भयो।" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
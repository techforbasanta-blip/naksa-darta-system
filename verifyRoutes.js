/* ==========================================================================
   H:\naksa-darta-system\backend\routes\verifyRoutes.js
   PUBLIC QR CODE VERIFICATION ENDPOINT
   ========================================================================== */

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// GET: /api/verify?token=... वा /api/verify/:dartaNo
router.get("/:query?", async (req, res) => {
    try {
        const searchToken = req.params.query || req.query.token || req.query.darta;
        if (!searchToken) {
            return res.status(400).json({ success: false, message: "प्रमाणीकरण टोकन प्राप्त भएन।" });
        }

        if (supabase) {
            const { data, error } = await supabase
                .from("records")
                .select("darta_no, cert_no, darta_date, homeowner_name, landowner_name, ward, kitta, approved_area, building_class, height_floor, is_temporary, created_at")
                .or(`darta_no.ilike.%${searchToken}%,cert_no.eq.${searchToken}`)
                .limit(1)
                .single();

            if (error || !data) {
                return res.status(404).json({ success: false, message: "कार्यालय अभिलेखमा दर्ता फेला परेन।" });
            }

            return res.json({
                success: true,
                status: "VERIFIED",
                municipality: "मायादेवी गाउँपालिका, बरेवा, रुपन्देही",
                record: data
            });
        }

        // डेमो रेकर्ड
        res.json({
            success: true,
            status: "VERIFIED",
            municipality: "मायादेवी गाउँपालिका, बरेवा, रुपन्देही",
            record: {
                darta_no: "२८/२०८३/०८४",
                cert_no: "१०१",
                darta_date: "२०८३/०६/०७",
                homeowner_name: "मायादेवी गाउँपालिका",
                ward: "०१",
                kitta: "१९२९",
                approved_area: "१७१९.४९",
                building_class: "(ख)",
                height_floor: "२ तला"
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
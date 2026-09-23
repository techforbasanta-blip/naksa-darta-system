/* ==========================================================================
   H:\naksa-darta-system\backend\routes\recordRoutes.js
   HOUSE MAP REGISTRATION & ARCHIVE ROUTES
   ========================================================================== */

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const authMiddleware = require("../middleware/authMiddleware");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// GET: /api/records (अभिलेख खोजी र सूची)
router.get("/", authMiddleware, async (req, res) => {
    try {
        if (supabase) {
            let query = supabase.from("records").select("*").order("created_at", { ascending: false });

            if (req.query.ward) query = query.eq("ward", req.query.ward);
            if (req.query.fiscal_year) query = query.eq("fiscal_year", req.query.fiscal_year);
            if (req.query.darta_no) query = query.ilike("darta_no", `%${req.query.darta_no}%`);

            const { data, error } = await query;
            if (error) throw error;
            return res.json({ success: true, data });
        }
        res.json({ success: true, data: [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: /api/records/save (नयाँ नक्सा दर्ता सेभ गर्ने)
router.post("/save", authMiddleware, async (req, res) => {
    try {
        const formData = req.body;
        const isTemporary = (formData.in_record_status === "TEMPORARY");

        const recordPayload = {
            fiscal_year: formData.in_fiscal_year,
            patra_no: formData.in_patra_no,
            darta_no: formData.in_darta_no,
            cert_no: formData.in_cert_no,
            darta_date: formData.in_darta_date,
            landowner_name: formData.in_landowner_name,
            landowner_cit: formData.in_landowner_cit,
            homeowner_name: formData.in_homeowner_name,
            homeowner_cit: formData.in_homeowner_cit,
            sabik_address: formData.in_sabik_address,
            ward: formData.in_ward,
            kitta: formData.in_kitta,
            land_area: formData.in_land_area,
            approved_area: formData.in_approved_area,
            land_use: formData.in_land_use,
            east: formData.in_east,
            west: formData.in_west,
            north: formData.in_north,
            south: formData.in_south,
            building_class: formData.in_building_class,
            struct_system: formData.in_struct_system,
            completion_date: formData.in_completion_date,
            height_floor: formData.in_height_floor,
            plinth_area: formData.in_plinth,
            total_area: formData.in_total_area,
            floor_details: {
                b1: formData.in_b1_area,
                b2: formData.in_b2_area,
                ground: formData.in_ground_area,
                first: formData.in_first_area,
                second: formData.in_second_area,
                third: formData.in_third_area,
                fourth: formData.in_fourth_area,
                fifth: formData.in_fifth_area
            },
            road_distance: formData.in_road_dist,
            electric_distance: formData.in_electric_dist,
            river_distance: formData.in_river_dist,
            septic_tank: formData.in_septic,
            decision_date: formData.in_decision_date,
            eng1_name: formData.in_eng1,
            eng1_role: formData.in_eng1_role,
            eng2_name: formData.in_eng2,
            eng2_role: formData.in_eng2_role,
            officer_name: formData.in_officer,
            relation: formData.in_relation,
            phone: formData.in_phone,
            is_temporary: isTemporary,
            created_by: req.user.fullName || "Staff",
            created_by_id: req.user.id,
            created_at: new Date().toISOString()
        };

        if (supabase) {
            const { data, error } = await supabase.from("records").insert([recordPayload]).select().single();
            if (error) throw error;
            return res.json({ success: true, message: "दर्ता सुरक्षित भयो।", data });
        }

        res.json({ success: true, message: "दर्ता सुरक्षित भयो (लोकल मोड)।", data: recordPayload });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE: /api/records/:id (रेकर्ड मेटाउने)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (supabase) {
            await supabase.from("records").delete().eq("id", id);
        }
        res.json({ success: true, message: "अभिलेख सफलतापूर्वक मेटाइयो।" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
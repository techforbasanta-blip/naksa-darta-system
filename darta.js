/* ==========================================================================
   H:\naksa-darta-system\frontend\js\darta.js
   FORM LIVE PREVIEW, AUTO ITI SAMBAT & ROJ CALCULATION, AUTO SUM & DRAFT
   ========================================================================== */

(function () {
    "use strict";

    const RECORDS_KEY = "mayadevi_naksa_darta_records";
    const DRAFT_KEY = "mayadevi_naksa_darta_draft";
    const LAST_ID_KEY = "mayadevi_naksa_last_saved_id";

    const FIELD_IDS = [
        "in_fiscal_year", "in_patra_no", "in_darta_no", "in_cert_no", "in_darta_date",
        "in_record_status",
        "in_landowner_name", "in_landowner_cit", "in_homeowner_name", "in_homeowner_cit",
        "in_sabik_address", "in_ward", "in_kitta", "in_land_area", "in_relation", "in_phone",
        "in_approved_area", "in_land_use", "in_east", "in_west", "in_north", "in_south",
        "in_building_class", "in_struct_system", "in_completion_date", "in_height_floor",
        "in_b1_area", "in_b2_area", "in_ground_area", "in_first_area", "in_second_area",
        "in_third_area", "in_fourth_area", "in_fifth_area", "in_total_area",
        "in_plinth", "in_road_dist", "in_electric_dist", "in_river_dist", "in_septic",
        "in_decision_date", "in_eng1_role", "in_eng1", "in_eng2_role", "in_eng2", "in_officer"
    ];

    const FLOOR_IDS = [
        "in_b1_area", "in_b2_area", "in_ground_area", "in_first_area",
        "in_second_area", "in_third_area", "in_fourth_area", "in_fifth_area"
    ];

    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    function toEnglishDigits(str) {
        if (!str) return "0";
        let s = str.toString();
        for (let i = 0; i < 10; i++) {
            s = s.split(nepaliDigits[i]).join(englishDigits[i]);
        }
        return s.replace(/[^0-9.]/g, '');
    }

    function toNepaliDigits(str) {
        if (str === null || str === undefined || str === "") return "-";
        let s = str.toString();
        for (let i = 0; i < 10; i++) {
            s = s.split(englishDigits[i]).join(nepaliDigits[i]);
        }
        return s;
    }

    function getEl(id) {
        return document.getElementById(id);
    }

    function getValue(id) {
        const el = getEl(id);
        if (!el) return "";
        return String(el.value ?? "").trim();
    }

    function setValue(id, value) {
        const el = getEl(id);
        if (!el) return;
        el.value = (value === null || value === undefined) ? "" : value;
    }

    function getDartaRecords() {
        try {
            const raw = localStorage.getItem(RECORDS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveDartaRecords(records) {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }

    function collectDartaFormData() {
        const data = {};
        FIELD_IDS.forEach(function (id) {
            data[id] = getValue(id);
        });
        return data;
    }

    function validateDartaForm() {
        const required = [
            ["in_fiscal_year", "आर्थिक वर्ष"],
            ["in_darta_no", "दर्ता नं."],
            ["in_darta_date", "दर्ता मिति"],
            ["in_landowner_name", "जग्गा धनीको नामथर"],
            ["in_ward", "वडा नं."],
            ["in_kitta", "कित्ता नं."]
        ];

        const missing = [];
        required.forEach(function (item) {
            if (!getValue(item[0])) missing.push(item[1]);
        });

        if (missing.length) {
            alert("कृपया निम्न विवरण अनिवार्य भर्नुहोस्:\n\n" + missing.join("\n"));
            const first = required.find(item => !getValue(item[0]));
            if (first && getEl(first[0])) getEl(first[0]).focus();
            return false;
        }
        return true;
    }

    function validateDuplicate(showAlert = true) {
        const fiscal = getValue("in_fiscal_year");
        const darta = getValue("in_darta_no");
        const errorBox = getEl("duplicateError");

        if (!fiscal || !darta) {
            if (errorBox) errorBox.style.display = "none";
            return true;
        }

        const records = getDartaRecords();
        const duplicate = records.some(r => String(r.in_fiscal_year || "").trim() === fiscal && String(r.in_darta_no || "").trim() === darta);

        if (duplicate) {
            const msg = "यो आर्थिक वर्ष र दर्ता नं. पहिले नै दर्ता भइसकेको छ।";
            if (errorBox) { errorBox.textContent = msg; errorBox.style.display = "block"; }
            if (showAlert) alert(msg);
            return false;
        }

        if (errorBox) { errorBox.textContent = ""; errorBox.style.display = "none"; }
        return true;
    }

    function autoSumFloors() {
        let total = 0;
        FLOOR_IDS.forEach(function (id) {
            const raw = getValue(id);
            const eng = parseFloat(toEnglishDigits(raw)) || 0;
            total += eng;
        });

        const totalFormatted = total > 0 ? total.toFixed(2) : "0.00";
        const totalEl = getEl("in_total_area");
        if (totalEl) totalEl.value = toNepaliDigits(totalFormatted);

        const groundRaw = getValue("in_ground_area");
        const groundEng = parseFloat(toEnglishDigits(groundRaw)) || 0;
        const plinthEl = getEl("in_plinth");
        if (groundEng > 0 && plinthEl) {
            plinthEl.value = `${toNepaliDigits(groundEng.toFixed(2))} / ५३.५७%`;
        }

        updateCertificateLive();
    }

    function updateCertificateLive() {
        const dartaNo = toNepaliDigits(getValue("in_darta_no") || "२८/२०८३/०८४");
        const patraNo = toNepaliDigits(getValue("in_patra_no") || "०८३/८४");
        const certNo = toNepaliDigits(getValue("in_cert_no") || "१०१");
        const dartaDate = toNepaliDigits(getValue("in_darta_date") || "२०८३/०६/०७");

        const landowner = getValue("in_landowner_name") || "....................";
        const landownerCit = toNepaliDigits(getValue("in_landowner_cit") || "....................");
        const homeowner = getValue("in_homeowner_name") || "....................";
        const homeownerCit = toNepaliDigits(getValue("in_homeowner_cit") || "....................");

        const sabik = getValue("in_sabik_address") || "....................";
        const ward = toNepaliDigits(getValue("in_ward") || "०१");
        const kitta = toNepaliDigits(getValue("in_kitta") || "....");
        const landArea = toNepaliDigits(getValue("in_land_area") || "....");
        const apprArea = toNepaliDigits(getValue("in_approved_area") || "....");
        const landUse = getValue("in_land_use") || "आवासीय / संस्थागत";

        const east = getValue("in_east") || "....";
        const west = getValue("in_west") || "....";
        const north = getValue("in_north") || "....";
        const south = getValue("in_south") || "....";

        const bClass = getValue("in_building_class") || "(ख)";
        const structSystem = getValue("in_struct_system") || "फ्रेम स्ट्रक्चर";
        const compDate = toNepaliDigits(getValue("in_completion_date") || "....");
        const decisionDate = toNepaliDigits(getValue("in_decision_date") || "२०८३/०६/०६");

        const relationName = getValue("in_relation") || "....................";
        const phone = toNepaliDigits(getValue("in_phone") || "....................");

        const eng1 = getValue("in_eng1") || "............................";
        const eng1Role = getValue("in_eng1_role") || "इन्जिनियर";
        const eng2 = getValue("in_eng2") || "............................";
        const eng2Role = getValue("in_eng2_role") || "इन्जिनियर";
        const officer = getValue("in_officer") || "............................";

        if (getEl("out_patra")) getEl("out_patra").innerText = patraNo;
        if (getEl("out_darta_no")) getEl("out_darta_no").innerText = dartaNo;
        if (getEl("out_cert_no")) getEl("out_cert_no").innerText = certNo;
        if (getEl("out_date")) getEl("out_date").innerText = dartaDate;

        if (getEl("out_cert_name")) getEl("out_cert_name").innerText = landowner;
        if (getEl("out_cert_ward")) getEl("out_cert_ward").innerText = ward;

        if (getEl("out_landowner")) getEl("out_landowner").innerText = landowner;
        if (getEl("out_landowner_cit")) getEl("out_landowner_cit").innerText = landownerCit;
        if (getEl("out_homeowner")) getEl("out_homeowner").innerText = homeowner;
        if (getEl("out_homeowner_cit")) getEl("out_homeowner_cit").innerText = homeownerCit;

        if (getEl("out_sabik")) getEl("out_sabik").innerText = sabik;
        if (getEl("out_ward_tbl")) getEl("out_ward_tbl").innerText = ward;
        if (getEl("out_kitta_tbl")) getEl("out_kitta_tbl").innerText = kitta;
        if (getEl("out_kitta_tbl2")) getEl("out_kitta_tbl2").innerText = kitta;
        if (getEl("out_land_area_tbl")) getEl("out_land_area_tbl").innerText = landArea;

        if (getEl("out_appr_area")) getEl("out_appr_area").innerText = apprArea;
        if (getEl("out_land_use")) getEl("out_land_use").innerText = landUse;

        if (getEl("out_east")) getEl("out_east").innerText = east;
        if (getEl("out_west")) getEl("out_west").innerText = west;
        if (getEl("out_north")) getEl("out_north").innerText = north;
        if (getEl("out_south")) getEl("out_south").innerText = south;

        if (getEl("out_b_class")) getEl("out_b_class").innerText = bClass;
        if (getEl("out_struct")) getEl("out_struct").innerText = structSystem;
        if (getEl("out_comp_date")) getEl("out_comp_date").innerText = compDate;
        if (getEl("out_decision_date")) getEl("out_decision_date").innerText = decisionDate;

        const formatFloor = (id) => {
            const raw = getValue(id);
            const num = parseFloat(toEnglishDigits(raw)) || 0;
            return num > 0 ? toNepaliDigits(num.toFixed(2)) : "-";
        };

        if (getEl("out_b1")) getEl("out_b1").innerText = formatFloor("in_b1_area");
        if (getEl("out_b2")) getEl("out_b2").innerText = formatFloor("in_b2_area");
        if (getEl("out_ground")) getEl("out_ground").innerText = formatFloor("in_ground_area");
        if (getEl("out_first")) getEl("out_first").innerText = formatFloor("in_first_area");
        if (getEl("out_second")) getEl("out_second").innerText = formatFloor("in_second_area");
        if (getEl("out_third")) getEl("out_third").innerText = formatFloor("in_third_area");
        if (getEl("out_fourth")) getEl("out_fourth").innerText = formatFloor("in_fourth_area");
        if (getEl("out_fifth")) getEl("out_fifth").innerText = formatFloor("in_fifth_area");
        if (getEl("out_total")) getEl("out_total").innerText = toNepaliDigits(getValue("in_total_area") || "०.००");

        const plinthVal = getValue("in_plinth");
        if (plinthVal.includes('/')) {
            const parts = plinthVal.split('/');
            if (getEl("out_plinth")) getEl("out_plinth").innerText = toNepaliDigits(parts[0].trim());
            if (getEl("out_coverage")) getEl("out_coverage").innerText = toNepaliDigits(parts[1].trim());
        } else {
            if (getEl("out_plinth")) getEl("out_plinth").innerText = toNepaliDigits(plinthVal || "....");
            if (getEl("out_coverage")) getEl("out_coverage").innerText = "....";
        }

        if (getEl("out_height_floor")) getEl("out_height_floor").innerText = toNepaliDigits(getValue("in_height_floor") || "....");
        if (getEl("out_rd_dist")) getEl("out_rd_dist").innerText = toNepaliDigits(getValue("in_road_dist") || "....");
        if (getEl("out_elec_dist")) getEl("out_elec_dist").innerText = toNepaliDigits(getValue("in_electric_dist") || "....");
        if (getEl("out_riv_dist")) getEl("out_riv_dist").innerText = toNepaliDigits(getValue("in_river_dist") || "....");
        if (getEl("out_sep")) getEl("out_sep").innerText = getValue("in_septic") || "भएको";

        if (getEl("out_eng1")) getEl("out_eng1").innerText = eng1;
        if (getEl("out_eng1_lbl")) getEl("out_eng1_lbl").innerText = eng1Role;
        if (getEl("out_eng2")) getEl("out_eng2").innerText = eng2;
        if (getEl("out_eng2_lbl")) getEl("out_eng2_lbl").innerText = eng2Role;
        if (getEl("out_off")) getEl("out_off").innerText = officer;

        // Page 2: Bindings
        if (getEl("back_applicant_name")) getEl("back_applicant_name").innerText = landowner;
        if (getEl("back_cit_no")) getEl("back_cit_no").innerText = landownerCit;
        if (getEl("back_relation_name")) getEl("back_relation_name").innerText = relationName;
        if (getEl("back_cit_issue")) getEl("back_cit_issue").innerText = landownerCit;
        if (getEl("back_phone")) getEl("back_phone").innerText = phone;

        // =========================================================
        // AUTO ITI SAMBAT & EXACT ROJ CALCULATION FROM DARTA DATE
        // =========================================================
        const dartaDateStr = getValue("in_darta_date") || "२०८३/०६/०७";
        const engDateStr = toEnglishDigits(dartaDateStr);
        const parts = engDateStr.split(/[\/\-\.]/);

        if (parts.length === 3) {
            const yr = parts[0];
            const mo = String(parts[1]).padStart(2, "0");
            const da = String(parts[2]).padStart(2, "0");

            if (getEl("back_iti_year")) getEl("back_iti_year").innerText = toNepaliDigits(yr);
            if (getEl("back_iti_month")) getEl("back_iti_month").innerText = toNepaliDigits(mo);
            if (getEl("back_iti_day")) getEl("back_iti_day").innerText = toNepaliDigits(da);

            // B.S. 2083 Calendar Mapping: बैशाख १ = मंगलबार (३ रोज)
            const bs2083Days = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
            const yNum = parseInt(yr, 10);
            const mNum = parseInt(mo, 10) - 1;
            const dNum = parseInt(da, 10);

            if (yNum === 2083 && mNum >= 0 && mNum < 12 && dNum > 0) {
                let totalPassedDays = 0;
                for (let i = 0; i < mNum; i++) {
                    totalPassedDays += bs2083Days[i];
                }
                totalPassedDays += (dNum - 1);

                // बैशाख १ गते = मंगलबार (३ रोज -> आइतबार=१, सोमबार=२, मंगलबार=३, बुधबार=४)
                const dayIndex = (2 + (totalPassedDays % 7)) % 7; // ०=आइतबार
                const rojNumber = dayIndex + 1; // १ देखि ७
                const rojFormatted = String(rojNumber).padStart(2, "0");

                const rojEl = getEl("back_iti_roj");
                if (rojEl) {
                    rojEl.innerText = toNepaliDigits(rojFormatted);
                }
            }
        }

        if (typeof window.generateVerificationQR === "function") {
            window.generateVerificationQR();
        }
    }

    function saveNaksaRecord() {
        if (!validateDartaForm()) return false;
        autoSumFloors();
        if (!validateDuplicate(true)) return false;

        const session = window.getCurrentSession ? window.getCurrentSession() : null;
        const data = collectDartaFormData();
        const now = new Date().toISOString();

        const isTemporary = (getValue("in_record_status") === "TEMPORARY");

        const record = {
            id: "MD-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
            createdAt: now,
            updatedAt: now,
            isTemporary: isTemporary,
            createdByStaff: session ? session.fullName : "Staff",
            createdByLoginId: session ? session.loginId : "staff",
            ...data
        };

        const records = getDartaRecords();
        records.unshift(record);
        saveDartaRecords(records);

        try {
            localStorage.setItem(LAST_ID_KEY, record.id);
            localStorage.removeItem(DRAFT_KEY);
        } catch (e) {}

        if (window.logAudit) {
            window.logAudit("RECORD_CREATED", `नयाँ नक्सा दर्ता गरियो: दर्ता नं. ${record.in_darta_no} (${record.isTemporary ? 'अस्थायी' : 'स्थायी'})`);
        }

        updateCertificateLive();
        alert(`दर्ता सफलतापूर्वक सुरक्षित भयो!\n\nदर्ता नं.: ${data.in_darta_no || "—"}\nस्थिति: ${isTemporary ? "अस्थायी (७ दिन पछि स्वतः सफा हुने)" : "स्थायी (Permanent)"}`);
        return true;
    }

    function resetDartaForm() {
        if (!confirm("के तपाईं फारम खाली गर्न चाहनुहुन्छ?")) return;
        const form = getEl("dartaForm");
        if (form) form.reset();

        if (typeof window.removePassportPhoto === "function") {
            window.removePassportPhoto();
        }

        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch (e) {}

        autoSumFloors();
        updateCertificateLive();
    }

    function saveDartaDraft() {
        const data = collectDartaFormData();
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: new Date().toISOString(), data: data }));
        } catch (e) {}
    }

    function loadDartaDraft() {
        let raw = null;
        try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) { return; }
        if (!raw) return;

        let draft;
        try { draft = JSON.parse(raw); } catch (e) { return; }
        if (!draft || !draft.data) return;

        FIELD_IDS.forEach(function (id) {
            if (Object.prototype.hasOwnProperty.call(draft.data, id)) {
                setValue(id, draft.data[id]);
            }
        });

        autoSumFloors();
        updateCertificateLive();
    }

    function attachEvents() {
        const form = getEl("dartaForm");
        if (!form) return;

        form.addEventListener("input", function (event) {
            const id = event.target && event.target.id;
            if (FLOOR_IDS.includes(id)) {
                autoSumFloors();
            } else {
                updateCertificateLive();
            }

            if (id === "in_fiscal_year" || id === "in_darta_no") {
                validateDuplicate(false);
            }
        });

        form.addEventListener("change", function (event) {
            const id = event.target && event.target.id;
            if (FLOOR_IDS.includes(id)) {
                autoSumFloors();
            } else {
                updateCertificateLive();
            }
        });

        document.addEventListener("keydown", function (event) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                saveNaksaRecord();
            }
        });
    }

    window.getDartaRecords = getDartaRecords;
    window.saveDartaRecords = saveDartaRecords;
    window.collectDartaFormData = collectDartaFormData;
    window.validateDartaForm = validateDartaForm;
    window.validateDuplicate = validateDuplicate;
    window.autoSumFloors = autoSumFloors;
    window.saveNaksaRecord = saveNaksaRecord;
    window.resetDartaForm = resetDartaForm;
    window.saveDartaDraft = saveDartaDraft;
    window.loadDartaDraft = loadDartaDraft;
    window.updateCertificateLive = updateCertificateLive;

    function init() {
        attachEvents();
        autoSumFloors();
        loadDartaDraft();
        setInterval(saveDartaDraft, 15000);
        updateCertificateLive();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
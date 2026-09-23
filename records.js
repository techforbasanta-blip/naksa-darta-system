/* ==========================================================================
   H:\naksa-darta-system\frontend\js\records.js
   RECORD SEARCH, FILTERING, CSV EXPORT & SUPERADMIN ACTIONS
   ========================================================================== */

(function () {
    "use strict";

    const RECORDS_KEY = "mayadevi_naksa_darta_records";
    let allRecords = [];

    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    function toNepaliDigits(str) {
        if (!str && str !== 0) return "—";
        let s = str.toString();
        for (let i = 0; i < 10; i++) {
            s = s.split(englishDigits[i]).join(nepaliDigits[i]);
        }
        return s;
    }

    function toEnglishDigits(str) {
        if (!str) return "";
        let s = str.toString();
        for (let i = 0; i < 10; i++) {
            s = s.split(nepaliDigits[i]).join(englishDigits[i]);
        }
        return s.replace(/[^0-9.]/g, '');
    }

    function getStoredRecords() {
        try {
            const raw = localStorage.getItem(RECORDS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveStoredRecords(recs) {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(recs));
    }

    function populateStaffFilter() {
        const select = document.getElementById("filterStaff");
        if (!select) return;

        const staffSet = new Set();
        allRecords.forEach(r => {
            if (r.createdByStaff) staffSet.add(r.createdByStaff);
        });

        select.innerHTML = `<option value="">सबै कर्मचारी</option>`;
        staffSet.forEach(staff => {
            select.innerHTML += `<option value="${staff}">${staff}</option>`;
        });
    }

    function renderRecords(records) {
        const tbody = document.getElementById("recordsTableBody");
        const empty = document.getElementById("emptyState");
        const countSpan = document.getElementById("totalRecordCount");

        if (!tbody) return;

        tbody.innerHTML = "";
        if (countSpan) countSpan.textContent = toNepaliDigits(records.length);

        if (!records || records.length === 0) {
            if (empty) empty.style.display = "block";
            return;
        }

        if (empty) empty.style.display = "none";

        records.forEach((rec, idx) => {
            const tr = document.createElement("tr");

            const dartaNo = toNepaliDigits(rec.in_darta_no || "—");
            const certNo = toNepaliDigits(rec.in_cert_no || "—");
            const dartaDate = toNepaliDigits(rec.in_darta_date || "—");
            const name = rec.in_homeowner_name || rec.in_landowner_name || "—";
            const ward = toNepaliDigits(rec.in_ward || "—");
            const kitta = toNepaliDigits(rec.in_kitta || "—");
            const area = `${toNepaliDigits(rec.in_approved_area || rec.in_total_area || "—")} वर्गफिट`;
            const staffName = rec.createdByStaff || "फाँट कर्मचारी";
            const isTemp = rec.isTemporary || false;

            tr.innerHTML = `
                <td>${toNepaliDigits(idx + 1)}</td>
                <td><strong>${dartaNo}</strong></td>
                <td>${certNo}</td>
                <td>${dartaDate}</td>
                <td><strong>${name}</strong></td>
                <td>${ward}</td>
                <td>${kitta}</td>
                <td>${area}</td>
                <td><small>${staffName}</small></td>
                <td><span class="status-pill ${isTemp ? 'status-temp' : 'status-permanent'}">${isTemp ? 'अस्थायी (7-Day)' : 'स्थायी (Permanent)'}</span></td>
                <td style="text-align: center;">
                    <div class="record-action-btns">
                        <button type="button" class="btn-sm btn-view" onclick="openAndPrintRecord('${rec.id}')">
                            🖨️ हेर्नुस् / प्रिन्ट
                        </button>
                        <button type="button" class="btn-sm btn-del" onclick="deleteRecord('${rec.id}')">
                            🗑️
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    window.filterRecords = function () {
        const keywordInput = document.getElementById("filterKeyword");
        const wardInput = document.getElementById("filterWard");
        const fiscalInput = document.getElementById("filterFiscal");
        const staffInput = document.getElementById("filterStaff");

        const keyword = (keywordInput?.value || "").trim().toLowerCase();
        const ward = wardInput?.value || "";
        const fiscal = fiscalInput?.value || "";
        const staff = staffInput?.value || "";

        const engKeyword = toEnglishDigits(keyword);

        const filtered = allRecords.filter(r => {
            const darta = (r.in_darta_no || "").toLowerCase();
            const dartaEng = toEnglishDigits(darta);
            const name = (r.in_homeowner_name || r.in_landowner_name || "").toLowerCase();
            const kitta = (r.in_kitta || "").toLowerCase();
            const recWard = (r.in_ward || "");
            const recFiscal = (r.in_fiscal_year || "");
            const recStaff = (r.createdByStaff || "");

            const matchesKeyword = !keyword || 
                                   darta.includes(keyword) || 
                                   (engKeyword && dartaEng.includes(engKeyword)) ||
                                   name.includes(keyword) || 
                                   kitta.includes(keyword);

            const matchesWard = !ward || recWard === ward || toNepaliDigits(recWard) === ward;
            const matchesFiscal = !fiscal || recFiscal.includes(fiscal);
            const matchesStaff = !staff || recStaff === staff;

            return matchesKeyword && matchesWard && matchesFiscal && matchesStaff;
        });

        renderRecords(filtered);
    };

    window.resetFilters = function () {
        if (document.getElementById("filterKeyword")) document.getElementById("filterKeyword").value = "";
        if (document.getElementById("filterWard")) document.getElementById("filterWard").value = "";
        if (document.getElementById("filterFiscal")) document.getElementById("filterFiscal").value = "";
        if (document.getElementById("filterStaff")) document.getElementById("filterStaff").value = "";
        renderRecords(allRecords);
    };

    window.openAndPrintRecord = function (id) {
        const target = allRecords.find(r => r.id === id);
        if (!target) return;

        try {
            localStorage.setItem("mayadevi_naksa_darta_draft", JSON.stringify({
                savedAt: new Date().toISOString(),
                data: target
            }));
            window.location.href = "darta.html";
        } catch (e) {
            console.error(e);
        }
    };

    window.deleteRecord = function (id) {
        const session = window.getCurrentSession ? window.getCurrentSession() : null;
        if (!session) {
            alert("लगइन गर्नुहोस्।");
            return;
        }

        const target = allRecords.find(r => r.id === id);
        if (!target) return;

        if (session.role !== "SUPERADMIN" && target.createdByLoginId !== session.loginId) {
            alert("तपाईँले अन्य कर्मचारीले दर्ता गरेको रेकर्ड मेटाउन पाउनुहुन्न।");
            return;
        }

        if (!confirm(`के तपाईं दर्ता नं. ${target.in_darta_no || ""} को नक्सा अभिलेख मेटाउन निश्चित हुनुहुन्छ?`)) return;

        allRecords = allRecords.filter(r => r.id !== id);
        saveStoredRecords(allRecords);
        if (window.logAudit) {
            window.logAudit("RECORD_DELETED", `नक्सा दर्ता नं. ${target.in_darta_no} मेटाइयो।`);
        }
        filterRecords();
    };

    window.exportRecordsToCSV = function () {
        if (!allRecords || allRecords.length === 0) {
            alert("एक्सपोर्ट गर्नको लागि कुनै पनि अभिलेख छैन।");
            return;
        }

        let csv = "\uFEFFक्र.सं.,दर्ता नं.,प्रमाण-पत्र नं.,दर्ता मिति,घरधनी,जग्गाधनी,वडा,कित्ता,क्षेत्रफल,दर्ता गर्ने कर्मचारी,स्थिति\n";
        allRecords.forEach((r, i) => {
            csv += `"${i+1}","${r.in_darta_no || ''}","${r.in_cert_no || ''}","${r.in_darta_date || ''}","${r.in_homeowner_name || ''}","${r.in_landowner_name || ''}","${r.in_ward || ''}","${r.in_kitta || ''}","${r.in_approved_area || ''}","${r.createdByStaff || ''}","${r.isTemporary ? 'अस्थायी' : 'स्थायी'}"\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Mayadevi_Naksa_Records_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.openSuperadminModal = function () {
        const modal = document.getElementById("superadminControlModal");
        if (modal) {
            modal.style.display = "flex";
            renderAdminStaffList();
        }
    };

    window.closeSuperadminModal = function () {
        const modal = document.getElementById("superadminControlModal");
        if (modal) modal.style.display = "none";
    };

    window.showAdminTab = function (tabId) {
        ["staffListTab", "addStaffTab", "auditLogTab"].forEach(t => {
            const el = document.getElementById(t);
            if (el) el.style.display = t === tabId ? "block" : "none";
        });
        if (tabId === "staffListTab") renderAdminStaffList();
        if (tabId === "auditLogTab") renderAdminAuditLogs();
    };

    function renderAdminStaffList() {
        const tbody = document.getElementById("adminStaffTableBody");
        if (!tbody || !window.getAllStaff) return;
        const staff = window.getAllStaff();
        tbody.innerHTML = "";

        staff.forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${s.fullName}</strong></td>
                <td>${s.designation}</td>
                <td><code>${s.loginId}</code></td>
                <td>${s.email}</td>
                <td>${s.phone}</td>
                <td><strong>${s.role}</strong></td>
                <td><span class="status-pill ${s.status === 'ACTIVE' ? 'status-permanent' : 'status-temp'}">${s.status}</span></td>
                <td>
                    ${s.role !== 'SUPERADMIN' ? `
                        <button class="btn-sm btn-del" onclick="handleToggleStatus('${s.id}')">${s.status === 'ACTIVE' ? 'बन्द' : 'खुला'}</button>
                        <button class="btn-sm btn-view" onclick="handleAdminResetPass('${s.id}')">Reset Pass</button>
                    ` : '—'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.handleToggleStatus = function (id) {
        if (window.toggleStaffStatus) {
            window.toggleStaffStatus(id);
            renderAdminStaffList();
        }
    };

    window.handleAdminResetPass = function (id) {
        const newPass = prompt("नयाँ Password राख्नुहोस्:");
        if (newPass && newPass.trim() && window.resetStaffPasswordByAdmin) {
            window.resetStaffPasswordByAdmin(id, newPass.trim());
            alert("पासवर्ड सफलतापूर्वक परिवर्तन भयो।");
        }
    };

    window.handleCreateStaffForm = function (e) {
        e.preventDefault();
        const data = {
            fullName: document.getElementById("adm_name").value,
            designation: document.getElementById("adm_desig").value,
            phone: document.getElementById("adm_phone").value,
            email: document.getElementById("adm_email").value,
            loginId: document.getElementById("adm_login_id").value,
            initialPassword: document.getElementById("adm_pass").value
        };

        if (window.createNewStaff && window.createNewStaff(data)) {
            alert("कर्मचारी खाता सफलतापूर्वक सिर्जना भयो!");
            document.getElementById("adm_name").value = "";
            document.getElementById("adm_desig").value = "";
            document.getElementById("adm_phone").value = "";
            document.getElementById("adm_email").value = "";
            document.getElementById("adm_login_id").value = "";
            document.getElementById("adm_pass").value = "";
            window.showAdminTab("staffListTab");
        }
    };

    function renderAdminAuditLogs() {
        const tbody = document.getElementById("adminAuditTableBody");
        if (!tbody || !window.getAuditLogs) return;
        const logs = window.getAuditLogs();
        tbody.innerHTML = "";

        logs.forEach(l => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><small>${new Date(l.timestamp).toLocaleString("ne-NP")}</small></td>
                <td><strong>${l.performedBy}</strong></td>
                <td><code>${l.action}</code></td>
                <td>${l.details}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        allRecords = getStoredRecords();
        populateStaffFilter();
        renderRecords(allRecords);
    });
})();


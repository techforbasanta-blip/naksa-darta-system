// मास्टर सुपरएडमिन खाता
const defaultMasterAdmin = {
    id: 1,
    full_name: "सुपर एडमिन",
    post: "कम्प्युटर अपरेटर",
    phone: "९७४३६५३६४४",
    email: "basantabashyalo@gmail.com",
    login_id: "superadmin",
    password: "Admin@2083",
    remarks: "प्रणाली व्यवस्थापक (Master Admin)"
};

// डाटा सुरक्षित लोड गर्ने (डाटा कहिल्यै नउड्ने फङ्सन)
function getSafeStaffList() {
    let list = [];
    try {
        const stored = localStorage.getItem("mayadevi_staff_list");
        if (stored) {
            list = JSON.parse(stored);
        }
    } catch (e) {
        console.error("डाटा लोड त्रुटि:", e);
    }

    if (!Array.isArray(list) || list.length === 0) {
        list = [defaultMasterAdmin];
        localStorage.setItem("mayadevi_staff_list", JSON.stringify(list));
    } else {
        // सुपरएडमिनको पद कम्प्युटर अपरेटर र इमेल सधैं सुरक्षित राख्ने
        const sIdx = list.findIndex(u => u.login_id && u.login_id.toLowerCase() === "superadmin");
        if (sIdx !== -1) {
            list[sIdx].post = "कम्प्युटर अपरेटर";
            list[sIdx].email = "basantabashyalo@gmail.com";
            list[sIdx].phone = "९७४३६५३६४४";
        } else {
            list.unshift(defaultMasterAdmin);
        }
        localStorage.setItem("mayadevi_staff_list", JSON.stringify(list));
    }
    return list;
}

let staffMembers = getSafeStaffList();

document.addEventListener("DOMContentLoaded", () => {
    staffMembers = getSafeStaffList();
    renderStaffTable();
});

// तालिका देखाउने
function renderStaffTable() {
    const tbody = document.getElementById("userTableBody");
    const badge = document.getElementById("slotStatusBadge");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (badge) badge.textContent = `कुल एडमिन/कर्मचारी: ${staffMembers.length} / १०`;

    staffMembers.forEach((u, idx) => {
        const isMaster = (u.login_id.toLowerCase() === "superadmin");
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="text-align:center; font-weight:bold;">${idx + 1}</td>
            <td><input type="text" class="table-input" id="row-name-${u.id}" value="${u.full_name}"></td>
            <td><input type="text" class="table-input" id="row-post-${u.id}" value="${u.post}"></td>
            <td><input type="text" class="table-input" id="row-phone-${u.id}" value="${u.phone}"></td>
            <td><input type="email" class="table-input" id="row-email-${u.id}" value="${u.email}"></td>
            <td><input type="text" class="table-input" id="row-loginid-${u.id}" value="${u.login_id}" ${isMaster ? 'readonly style="background:#f1f5f9;"' : ''}></td>
            <td>
                <div class="pwd-td-box" style="display:flex; align-items:center; gap:4px;">
                    <input type="password" class="table-input" id="row-pwd-${u.id}" value="${u.password}" style="width: 100px;">
                    <span style="cursor:pointer;" onclick="toggleRowPassword('row-pwd-${u.id}')">👁️</span>
                </div>
            </td>
            <td><input type="text" class="table-input" id="row-remarks-${u.id}" value="${u.remarks || ''}"></td>
            <td style="text-align: center; white-space: nowrap;">
                <button type="button" class="btn-update" onclick="saveUpdatedRow(${u.id})">अपडेट</button>
                ${!isMaster ? `<button type="button" class="btn-del" onclick="removeStaffRow(${u.id})">हटाउने</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// नयाँ कर्मचारी सुरक्षित गर्ने
function createNewAdminUser() {
    staffMembers = getSafeStaffList();

    if (staffMembers.length >= 10) {
        alert("अधिकतम १० जना सम्म मात्र एडमिन/कर्मचारी सिर्जना गर्न मिल्छ!");
        return;
    }

    const name = document.getElementById("new_name").value.trim();
    const post = document.getElementById("new_post").value.trim();
    const phone = document.getElementById("new_phone").value.trim();
    const email = document.getElementById("new_email").value.trim();
    const loginId = document.getElementById("new_loginid").value.trim();
    const pwd = document.getElementById("new_password").value.trim();
    const remarks = document.getElementById("new_remarks").value.trim();

    if (!name || !post || !phone || !email || !loginId || !pwd) {
        alert("कृपया सबै अनिवार्य विवरणहरू (नाम, पद, फोन, इमेल, Login ID र पासवर्ड) भर्नुहोस्!");
        return;
    }

    const isDuplicate = staffMembers.some(u => u.login_id.toLowerCase() === loginId.toLowerCase());
    if (isDuplicate) {
        alert(`यो Login ID (${loginId}) पहिले नै दर्ता भइसकेको छ!`);
        return;
    }

    const newStaff = {
        id: Date.now(),
        full_name: name,
        post: post,
        phone: phone,
        email: email,
        login_id: loginId,
        password: pwd,
        remarks: remarks
    };

    staffMembers.push(newStaff);
    localStorage.setItem("mayadevi_staff_list", JSON.stringify(staffMembers));

    document.getElementById("newAdminForm").reset();
    alert(`कर्मचारी "${name}" (Login ID: ${loginId}) सफलतापूर्वक सुरक्षित भयो! अब यो आइडीबाट लगइन गर्न सकिन्छ।`);
    renderStaffTable();
}

// विवरण सम्पादन गर्ने
function saveUpdatedRow(id) {
    staffMembers = getSafeStaffList();
    const target = staffMembers.find(u => u.id === id);
    if (target) {
        target.full_name = document.getElementById(`row-name-${id}`).value.trim();
        target.post = document.getElementById(`row-post-${id}`).value.trim();
        target.phone = document.getElementById(`row-phone-${id}`).value.trim();
        target.email = document.getElementById(`row-email-${id}`).value.trim();
        target.login_id = document.getElementById(`row-loginid-${id}`).value.trim();
        target.password = document.getElementById(`row-pwd-${id}`).value.trim();
        target.remarks = document.getElementById(`row-remarks-${id}`).value.trim();

        localStorage.setItem("mayadevi_staff_list", JSON.stringify(staffMembers));
        alert("विवरण सफलतापूर्वक सुरक्षित (Update) भयो!");
        renderStaffTable();
    }
}

// कर्मचारी हटाउने
function removeStaffRow(id) {
    staffMembers = getSafeStaffList();
    const target = staffMembers.find(u => u.id === id);
    if (!target) return;

    if (confirm(`के तपाईं "${target.full_name}" लाई हटाउन निश्चित हुनुहुन्छ?`)) {
        staffMembers = staffMembers.filter(u => u.id !== id);
        localStorage.setItem("mayadevi_staff_list", JSON.stringify(staffMembers));
        renderStaffTable();
    }
}

function toggleRowPassword(id) {
    const el = document.getElementById(id);
    if (el) el.type = (el.type === 'password') ? 'text' : 'password';
}

// सुरक्षित लगआउट (कर्मचारीको लिष्ट कहिल्यै नमेटाउने)
window.handleLogout = function() {
    sessionStorage.clear();
    localStorage.removeItem("user"); // यहाँ केवल हालको सेसन मात्र हट्छ
    alert("सफलतापूर्वक लगआउट भयो!");
    window.location.href = "login.html";
};

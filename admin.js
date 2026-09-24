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

// लोकल स्टोरेजबाट डाटा लोड गर्ने
function getStoredStaffList() {
    try {
        const stored = localStorage.getItem('mayadevi_staff_list');
        if (stored) {
            let list = JSON.parse(stored);
            if (Array.isArray(list) && list.length > 0) {
                // सुपरएडमिनको विवरण सधैं अद्यावधिक राख्ने
                const sIdx = list.findIndex(u => u.login_id && u.login_id.toLowerCase() === 'superadmin');
                if (sIdx !== -1) {
                    list[sIdx].post = "कम्प्युटर अपरेटर";
                    list[sIdx].email = "basantabashyalo@gmail.com";
                    list[sIdx].phone = "९७४३६५३६४४";
                } else {
                    list.unshift(defaultMasterAdmin);
                }
                localStorage.setItem('mayadevi_staff_list', JSON.stringify(list));
                return list;
            }
        }
    } catch (e) {
        console.error("डाटा लोड त्रुटि:", e);
    }

    localStorage.setItem('mayadevi_staff_list', JSON.stringify([defaultMasterAdmin]));
    return [defaultMasterAdmin];
}

let usersList = getStoredStaffList();

document.addEventListener("DOMContentLoaded", () => {
    // सेसन जाँच
    const rawUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!rawUser) {
        alert("कृपया पहिले लगइन गर्नुहोस्!");
        window.location.href = "login.html";
        return;
    }

    usersList = getStoredStaffList();
    renderTable();
});

// तालिका देखाउने
function renderTable() {
    const tbody = document.getElementById("userTableBody");
    const badge = document.getElementById("slotStatusBadge");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (badge) badge.textContent = `कुल एडमिन/कर्मचारी: ${usersList.length} / १०`;

    usersList.forEach((u, idx) => {
        const isMaster = (u.login_id.toLowerCase() === "superadmin");
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="text-align:center; font-weight:bold;">${idx + 1}</td>
            <td><input type="text" class="table-input" id="tbl-name-${u.id}" value="${u.full_name}"></td>
            <td><input type="text" class="table-input" id="tbl-post-${u.id}" value="${u.post}"></td>
            <td><input type="text" class="table-input" id="tbl-phone-${u.id}" value="${u.phone}"></td>
            <td><input type="email" class="table-input" id="tbl-email-${u.id}" value="${u.email}"></td>
            <td><input type="text" class="table-input" id="tbl-loginid-${u.id}" value="${u.login_id}" ${isMaster ? 'readonly style="background:#f1f5f9;"' : ''}></td>
            <td>
                <div class="pwd-td-box">
                    <input type="password" class="table-input" id="tbl-pwd-${u.id}" value="${u.password}" style="width: 100px;">
                    <span class="eye-icon" onclick="toggleTblPassword('tbl-pwd-${u.id}')" title="पासवर्ड हेर्नुहोस्">👁️</span>
                </div>
            </td>
            <td><input type="text" class="table-input" id="tbl-remarks-${u.id}" value="${u.remarks || ''}"></td>
            <td style="text-align: center; white-space: nowrap;">
                <button type="button" class="btn-update" onclick="updateExistingUser(${u.id})">अपडेट</button>
                ${!isMaster ? `<button type="button" class="btn-del" onclick="deleteUser(${u.id})">हटाउने</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// नयाँ एडमिन/कर्मचारी सुरक्षित गर्ने
function createNewAdminUser() {
    usersList = getStoredStaffList();

    if (usersList.length >= 10) {
        alert("अधिकतम १० जना सम्म मात्र एडमिन/कर्मचारी राख्न मिल्छ!");
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
        alert("कृपया सबै विवरणहरू (नाम, पद, फोन, इमेल, Login ID र पासवर्ड) अनिवार्य भर्नुहोस्!");
        return;
    }

    // डुप्लिकेट जाँच
    const exists = usersList.some(u => u.login_id.toLowerCase() === loginId.toLowerCase());
    if (exists) {
        alert(`यो Login ID (${loginId}) पहिले नै दर्ता भइसकेको छ। कृपया फरक Login ID राख्नुहोस्!`);
        return;
    }

    const newUser = {
        id: Date.now(),
        full_name: name,
        post: post,
        phone: phone,
        email: email,
        login_id: loginId,
        password: pwd,
        remarks: remarks
    };

    usersList.push(newUser);
    localStorage.setItem('mayadevi_staff_list', JSON.stringify(usersList));

    document.getElementById("newAdminForm").reset();
    alert(`कर्मचारी "${name}" (Login ID: ${loginId}) सुरक्षित भयो! अब यो आइडीबाट सिधै लगइन गर्न सकिन्छ।`);
    renderTable();
}

// तालिकाबाट विवरण सम्पादन
function updateExistingUser(id) {
    const name = document.getElementById(`tbl-name-${id}`).value.trim();
    const post = document.getElementById(`tbl-post-${id}`).value.trim();
    const phone = document.getElementById(`tbl-phone-${id}`).value.trim();
    const email = document.getElementById(`tbl-email-${id}`).value.trim();
    const loginId = document.getElementById(`tbl-loginid-${id}`).value.trim();
    const pwd = document.getElementById(`tbl-pwd-${id}`).value.trim();
    const remarks = document.getElementById(`tbl-remarks-${id}`).value.trim();

    usersList = getStoredStaffList();
    const user = usersList.find(u => u.id === id);
    if (user) {
        user.full_name = name;
        user.post = post;
        user.phone = phone;
        user.email = email;
        user.login_id = loginId;
        user.password = pwd;
        user.remarks = remarks;

        localStorage.setItem('mayadevi_staff_list', JSON.stringify(usersList));
        alert("विवरण सफलतापूर्वक अद्यावधिक (Update) भयो!");
        renderTable();
    }
}

// कर्मचारी हटाउने
function deleteUser(id) {
    usersList = getStoredStaffList();
    const target = usersList.find(u => u.id === id);
    if (!target) return;

    if (confirm(`के तपाईं "${target.full_name}" लाई हटाउन निश्चित हुनुहुन्छ?`)) {
        usersList = usersList.filter(u => u.id !== id);
        localStorage.setItem('mayadevi_staff_list', JSON.stringify(usersList));
        renderTable();
    }
}

// पासवर्ड देखाउने
function toggleTblPassword(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) input.type = (input.type === 'password') ? 'text' : 'password';
}

// सुरक्षित लगआउट (डाटा कहिल्यै नमेटिने गरी)
window.handleLogout = function() {
    sessionStorage.clear();
    localStorage.removeItem('user');
    alert("लगआउट सफल भयो!");
    window.location.href = "login.html";
};

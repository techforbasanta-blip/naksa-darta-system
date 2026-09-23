document.addEventListener("DOMContentLoaded", () => {
    // सुपरएडमिन सेसन प्रमाणीकरण
    const rawUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!rawUser) {
        alert("कृपया पहिले लगइन गर्नुहोस्!");
        window.location.href = "login.html";
        return;
    }

    try {
        const currentUser = JSON.parse(rawUser);
        const nameBadge = document.getElementById("loggedUserName");
        if (nameBadge && currentUser.full_name) {
            nameBadge.textContent = currentUser.full_name;
        }
    } catch (e) {
        console.error("Session parse error", e);
    }

    renderTable();
});

// सुरुमा हजुरको मुख्य Superadmin खाता मात्र रहनेछ
let usersList = JSON.parse(localStorage.getItem('mayadevi_staff_list'));

if (!usersList || usersList.length === 0) {
    usersList = [
        {
            id: 1,
            full_name: "सुपर एडमिन",
            post: "प्रमुख प्रशासकीय अधिकृत",
            phone: "९८५७०१६९३९",
            email: "mayadeviruralmun@gmail.com",
            login_id: "superadmin",
            password: "Admin@2083",
            remarks: "प्रणाली व्यवस्थापक (Master Admin)"
        }
    ];
    localStorage.setItem('mayadevi_staff_list', JSON.stringify(usersList));
}

// तालिका देखाउने (Render Table)
function renderTable() {
    const tableBody = document.getElementById("userTableBody");
    const badge = document.getElementById("slotStatusBadge");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (badge) {
        badge.textContent = `कुल एडमिन/कर्मचारी: ${usersList.length} / १०`;
    }

    usersList.forEach((u, index) => {
        const isMaster = (index === 0); // पहिलो सुपरएडमिन खाता मेटाउन नमिल्ने
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
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
        tableBody.appendChild(tr);
    });
}

// फारामबाट नयाँ प्रयोगकर्ता सिर्जना गर्ने (Create New User)
function createNewAdminUser() {
    if (usersList.length >= 10) {
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

    // Compulsory check
    if (!name || !post || !phone || !email || !loginId || !pwd) {
        alert("कर्मचारीको नाम, पद, सम्पर्क नं., Gmail, Login ID र पासवर्ड सबै अनिवार्य छन्!");
        return;
    }

    // Login ID duplicate check
    const duplicate = usersList.some(u => u.login_id.toLowerCase() === loginId.toLowerCase());
    if (duplicate) {
        alert(`यो Login ID (${loginId}) पहिले नै अर्को कर्मचारीले प्रयोग गरिसक्नुभएको छ! कृपया फरक ID राख्नुहोस्।`);
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

    // Reset Form
    document.getElementById("newAdminForm").reset();

    alert(`नयाँ कर्मचारी: "${name}" (${post}) सफलतापूर्वक सिर्जना भयो र तालिकामा थपियो!`);
    renderTable();
}

// तालिकामा सिधै सम्पादन गरी अपडेट गर्ने
function updateExistingUser(id) {
    const name = document.getElementById(`tbl-name-${id}`).value.trim();
    const post = document.getElementById(`tbl-post-${id}`).value.trim();
    const phone = document.getElementById(`tbl-phone-${id}`).value.trim();
    const email = document.getElementById(`tbl-email-${id}`).value.trim();
    const loginId = document.getElementById(`tbl-loginid-${id}`).value.trim();
    const pwd = document.getElementById(`tbl-pwd-${id}`).value.trim();
    const remarks = document.getElementById(`tbl-remarks-${id}`).value.trim();

    if (!name || !post || !phone || !email || !loginId || !pwd) {
        alert("सबै अनिवार्य विवरण भरेर मात्र अपडेट गर्नुहोस्!");
        return;
    }

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
        alert(`"${name}" को विवरण अद्यावधिक (Update) भयो!`);
        renderTable();
    }
}

// कर्मचारी हटाउने
function deleteUser(id) {
    const target = usersList.find(u => u.id === id);
    if (!target) return;

    if (confirm(`के तपाईं साँच्चै कर्मचारी "${target.full_name}" लाई हटाउन चाहनुहुन्छ?`)) {
        usersList = usersList.filter(u => u.id !== id);
        localStorage.setItem('mayadevi_staff_list', JSON.stringify(usersList));
        renderTable();
    }
}

// पासवर्ड देखाउने/लुकाउने
function toggleTblPassword(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.type = (input.type === 'password') ? 'text' : 'password';
    }
}

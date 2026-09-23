document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Check
    const rawUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!rawUser) {
        alert("कृपया पहिले लगइन गर्नुहोस्!");
        window.location.href = "login.html";
        return;
    }

    try {
        const currentUser = JSON.parse(rawUser);
        if (currentUser.role !== 'superadmin' && currentUser.login_id !== 'superadmin') {
            alert("यो प्यानलमा पहुँचका लागि सुपरएडमिन अधिकार आवश्यक छ!");
            window.location.href = "darta.html";
            return;
        }
    } catch (e) {
        window.location.href = "login.html";
        return;
    }

    renderUsers();
});

// सुरुवाती कर्मचारीहरूको सूची (Local Storage मा सुरक्षित हुने गरी)
let usersList = JSON.parse(localStorage.getItem('mayadevi_staff_list')) || [
    {
        id: 1,
        full_name: "सुपर एडमिन",
        post: "प्रमुख प्रशासकीय अधिकृत",
        phone: "९८५७०१६९३९",
        email: "superadmin@mayadevimun.gov.np",
        login_id: "superadmin",
        password: "Admin@2083",
        remarks: "मुख्य प्रणाली प्रशासक"
    },
    {
        id: 2,
        full_name: "राम बहादुर चौधरी",
        post: "इन्जिनियर",
        phone: "९८४७००१२३४",
        email: "engineer.mayadevi@gmail.com",
        login_id: "engineer1",
        password: "User@1234",
        remarks: "नक्सा जाँच तथा प्रमाणीकरण"
    },
    {
        id: 3,
        full_name: "सीता ज्ञवाली",
        post: "सब-इन्जिनियर",
        phone: "९८४७११२२३३",
        email: "subeng.mayadevi@gmail.com",
        login_id: "subeng1",
        password: "User@5678",
        remarks: "स्थलगत निरीक्षण"
    }
];

// टेबल रेन्डर गर्ने कार्य
function renderUsers() {
    const tableBody = document.getElementById("userTableBody");
    const countBadge = document.getElementById("userCountBadge");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (countBadge) {
        countBadge.textContent = `कुल एडमिन/कर्मचारी: ${usersList.length} / १०`;
    }

    usersList.forEach((u, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
            <td><input type="text" id="name-${u.id}" value="${u.full_name || ''}" placeholder="कर्मचारीको नाम"></td>
            <td><input type="text" id="post-${u.id}" value="${u.post || ''}" placeholder="पद (उदा. इन्जिनियर)"></td>
            <td><input type="text" id="phone-${u.id}" value="${u.phone || ''}" placeholder="९८XXXXXXXX"></td>
            <td><input type="email" id="email-${u.id}" value="${u.email || ''}" placeholder="example@gmail.com"></td>
            <td><input type="text" id="loginid-${u.id}" value="${u.login_id || ''}" placeholder="login id"></td>
            <td>
                <div class="pwd-wrapper">
                    <input type="password" id="pwd-${u.id}" value="${u.password || ''}">
                    <span class="eye-btn" onclick="togglePasswordVisibility('pwd-${u.id}')" title="पासवर्ड हेर्नुहोस्">👁️</span>
                </div>
            </td>
            <td><input type="text" id="remarks-${u.id}" value="${u.remarks || ''}" placeholder="कैफियत"></td>
            <td style="text-align: center; white-space: nowrap;">
                <button type="button" class="btn-save" onclick="saveUser(${u.id})">सुरक्षित</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// नयाँ प्रयोगकर्ता पङ्क्ति (Row) थप्ने (अधिकतम १० जना)
function addNewUserRow() {
    if (usersList.length >= 10) {
        alert("अधिकतम १० जना सम्म मात्र एडमिन/कर्मचारी थप्न मिल्छ!");
        return;
    }

    const newId = Date.now();
    usersList.push({
        id: newId,
        full_name: "",
        post: "",
        phone: "",
        email: "",
        login_id: "",
        password: "",
        remarks: ""
    });

    renderUsers();
}

// पासवर्ड देखाउने/लुकाउने (Eye Toggle)
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.type = (field.type === 'password') ? 'text' : 'password';
    }
}

// सुरक्षित गर्ने कार्य (सबै अनिवार्य फिल्ड जाँचसहित)
function saveUser(userId) {
    const name = document.getElementById(`name-${userId}`).value.trim();
    const post = document.getElementById(`post-${userId}`).value.trim();
    const phone = document.getElementById(`phone-${userId}`).value.trim();
    const email = document.getElementById(`email-${userId}`).value.trim();
    const loginId = document.getElementById(`loginid-${userId}`).value.trim();
    const pwd = document.getElementById(`pwd-${userId}`).value.trim();
    const remarks = document.getElementById(`remarks-${userId}`).value.trim();

    // Compulsory Field Validation
    if (!name || !post || !phone || !email || !loginId || !pwd) {
        alert("त्रुटि: कर्मचारीको नाम, पद, सम्पर्क नम्बर, Gmail, Login ID र पासवर्ड सबै अनिवार्य छन्!");
        return;
    }

    // Update in Array
    const target = usersList.find(u => u.id === userId);
    if (target) {
        target.full_name = name;
        target.post = post;
        target.phone = phone;
        target.email = email;
        target.login_id = loginId;
        target.password = pwd;
        target.remarks = remarks;

        localStorage.setItem('mayadevi_staff_list', JSON.stringify(usersList));
        alert(`कर्मचारी: "${name}" (${post}) को विवरण सफलतापूर्वक सुरक्षित गरियो!`);
    }
}

// Global Logout
window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    alert('सफलतापूर्वक लगआउट भयो!');
    window.location.href = 'login.html';
};

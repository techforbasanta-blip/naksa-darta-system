document.addEventListener("DOMContentLoaded", async () => {
    // सुपरएडमिन प्रमाणीकरण जाँच
    const rawUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!rawUser) {
        alert("कृपया पहिले लगइन गर्नुहोस्!");
        window.location.href = "login.html";
        return;
    }

    try {
        const currentUser = JSON.parse(rawUser);
        if (currentUser.role !== 'superadmin' && currentUser.login_id !== 'superadmin') {
            alert("यो पृष्ठमा पहुँचका लागि सुपरएडमिन अधिकार आवश्यक छ!");
            window.location.href = "darta.html";
            return;
        }
    } catch (e) {
        window.location.href = "login.html";
        return;
    }

    loadUsers();
});

// प्रयोगकर्ता सूची लोड गर्ने
async function loadUsers() {
    const tableBody = document.getElementById("userTableBody");
    if (!tableBody) return;

    // यदि सर्भरलेस API उपलब्ध नभए स्थानीय/पूर्वनिर्धारित खाताहरू देखाउने
    const defaultUsers = [
        { id: 1, full_name: "सुपर एडमिन", login_id: "superadmin", role: "superadmin" },
        { id: 2, full_name: "शाखा अधिकृत", login_id: "officer1", role: "admin" },
        { id: 3, full_name: "प्राविधिक कर्मचारी", login_id: "staff1", role: "staff" }
    ];

    tableBody.innerHTML = "";

    defaultUsers.forEach((u, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td><input type="text" id="name-${u.id}" value="${u.full_name}" style="width: 90%;"></td>
            <td><input type="text" id="loginid-${u.id}" value="${u.login_id}" style="width: 90%;"></td>
            <td>
                <input type="password" id="pwd-${u.id}" value="********" style="width: 120px;">
                <span style="cursor: pointer; font-size: 16px; margin-left: 6px;" onclick="togglePasswordVisibility('pwd-${u.id}')">👁️</span>
            </td>
            <td style="text-align: center;">
                <button class="btn-save" onclick="saveUser(${u.id})">सुरक्षित गर्नुहोस्</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// पासवर्ड देखाउने/लुकाउने
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.type = (field.type === 'password') ? 'text' : 'password';
    }
}

// सुरक्षित गर्ने कार्य
function saveUser(userId) {
    const name = document.getElementById(`name-${userId}`).value;
    const loginId = document.getElementById(`loginid-${userId}`).value;
    const pwd = document.getElementById(`pwd-${userId}`).value;

    alert(`प्रयोगकर्ता: ${name} (${loginId}) को विवरण सफलतापूर्वक अपडेट गरियो!`);
}

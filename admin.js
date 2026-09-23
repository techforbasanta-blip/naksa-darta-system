// admin.js - मायादेवी गाउँपालिका सुपरएडमिन कर्मचारी व्यवस्थापन

document.addEventListener('DOMContentLoaded', () => {
    loadAllUsers();
});

// १. सबै कर्मचारी/एडमिनहरूको सूची लोड गर्ने
async function loadAllUsers() {
    const tableBody = document.getElementById('userTableBody') || document.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:15px;">प्रयोगकर्ताहरूको सूची लोड हुँदैछ...</td></tr>';

    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();

        if (!res.ok || !data.users) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:15px;">त्रुटि: ${data.error || 'विवरण पाइएन'}</td></tr>`;
            return;
        }

        if (data.users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:15px;">कुनै कर्मचारी भेटिएन।</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.users.forEach((u, index) => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #e2e8f0';

            row.innerHTML = `
                <td style="padding:10px; text-align:center;">${index + 1}</td>
                <td style="padding:10px;">
                    <input type="text" id="name-${u.id}" value="${u.full_name || ''}" 
                        style="padding:6px; width:90%; border:1px solid #cbd5e1; border-radius:4px;">
                </td>
                <td style="padding:10px;">
                    <input type="text" id="loginid-${u.id}" value="${u.login_id || u.username || ''}" 
                        style="padding:6px; width:90%; border:1px solid #cbd5e1; border-radius:4px;">
                </td>
                <td style="padding:10px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <input type="password" id="pwd-${u.id}" value="${u.plain_password || 'Admin@2083'}" readonly 
                            style="padding:6px; border:1px solid #e2e8f0; background:#f8fafc; width:110px; border-radius:4px;">
                        <span onclick="toggleStaffPassword('pwd-${u.id}')" 
                            style="cursor:pointer; font-size:18px; user-select:none;" title="पासवर्ड हेर्नुहोस्">👁️</span>
                    </div>
                </td>
                <td style="padding:10px; text-align:center;">
                    <button onclick="saveStaffInfo('${u.id}')" 
                        style="background-color:#2563eb; color:white; border:none; padding:6px 14px; border-radius:4px; cursor:pointer; font-weight:500;">
                        सुरक्षित गर्नुहोस्
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:15px;">लोड गर्न सकिएन: ${err.message}</td></tr>`;
    }
}

// २. पासवर्ड देखाउने वा लुकाउने (Eye Toggle)
function toggleStaffPassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// ३. कर्मचारीको नयाँ नाम र लगइन आइडी डेटाबेसमा सुरक्षित गर्ने
async function saveStaffInfo(userId) {
    const fullName = document.getElementById(`name-${userId}`).value.trim();
    const loginId = document.getElementById(`loginid-${userId}`).value.trim();

    if (!fullName || !loginId) {
        alert("नाम र लगइन आइडी खाली राख्न मिल्दैन!");
        return;
    }

    try {
        const res = await fetch('/api/admin/update-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, full_name: fullName, login_id: loginId })
        });

        const result = await res.json();
        if (res.ok) {
            alert('कर्मचारीको नाम र लगइन आइडी सफलतापूर्वक सुरक्षित भयो!');
        } else {
            alert('त्रुटि: ' + (result.error || result.message));
        }
    } catch (err) {
        alert('सर्भरसँग सम्पर्क हुन सकेन: ' + err.message);
    }
}

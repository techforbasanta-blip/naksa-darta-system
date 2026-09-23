// auth.js - मायादेवी गाउँपालिका प्रमाणीकरण प्रणाली

// १. लगइन फङ्सन
async function handleStaffLogin(event) {
    if (event) event.preventDefault();

    const loginInput = document.getElementById('loginId') || 
                       document.getElementById('username') || 
                       document.getElementById('login_id') || 
                       document.querySelector('input[type="text"]');

    const passwordInput = document.getElementById('password') || 
                          document.querySelector('input[type="password"]');

    const login_id = loginInput ? loginInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!login_id || !password) {
        alert('कृपया Login ID र Password दुवै भर्नुहोस्।');
        return;
    }

    // सुपरएडमिनको लागि सिधा लोकल लगइन (सर्भर ढिला भए वा बिग्रिए पनि तुरुन्त खुल्ने)
    if (login_id === 'superadmin' && password === 'Admin@2083') {
        const superUser = {
            id: 'superadmin',
            full_name: 'सुपर एडमिन',
            login_id: 'superadmin',
            role: 'superadmin'
        };
        sessionStorage.setItem('user', JSON.stringify(superUser));
        localStorage.setItem('user', JSON.stringify(superUser));
        alert('सुपरएडमिन लगइन सफल भयो!');
        window.location.href = 'darta.html';
        return;
    }

    // अन्य कर्मचारीको लागि API कल
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_id, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Login ID वा Password मिलेन!');
            return;
        }

        sessionStorage.setItem('user', JSON.stringify(data.user || data));
        localStorage.setItem('user', JSON.stringify(data.user || data));
        alert('लगइन सफल भयो!');
        window.location.href = 'darta.html';

    } catch (err) {
        alert('सर्भरसँग सम्पर्क हुन सकेन: ' + err.message);
    }
}

// २. लगआउट फङ्सन
window.handleLogout = window.logoutUser = function() {
    sessionStorage.clear();
    localStorage.clear();
    alert('सफलतापूर्वक लगआउट भयो!');
    window.location.href = 'login.html';
};

// ३. एडमिन बटन र प्रयोगकर्ता जाँच
document.addEventListener('DOMContentLoaded', () => {
    const rawUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (rawUser) {
        try {
            const user = JSON.parse(rawUser);
            const userLabel = document.getElementById('loggedUserName');
            if (userLabel) userLabel.textContent = user.full_name || user.login_id || 'सुपर एडमिन';

            const adminBtn = document.getElementById('adminMenuBtn') || document.getElementById('adminMenu');
            if (adminBtn) {
                // लिङ्क सिधै admin.html बनाउने (/frontend/ नराख्ने)
                adminBtn.setAttribute('href', 'admin.html');
                if (user.role === 'superadmin' || user.role === 'admin' || user.login_id === 'superadmin') {
                    adminBtn.style.display = 'inline-flex';
                } else {
                    adminBtn.style.display = 'none';
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
});
// प्रयोगकर्ताको अधिकार जाँच गर्ने
function getCurrentUserRole() {
    const rawUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!rawUser) return { isSuperAdmin: false, role: 'guest' };

    try {
        const user = JSON.parse(rawUser);
        const isSuperAdmin = (user.role === 'superadmin' || user.login_id === 'superadmin');
        return { isSuperAdmin, user };
    } catch (e) {
        return { isSuperAdmin: false, role: 'guest' };
    }
}

// १ हप्ता (७ दिन) सम्म वा सोही दिन सुपरएडमिनले मात्र सच्याउन पाउने नियम
function validateEditPermission(recordCreatedDate) {
    const { isSuperAdmin } = getCurrentUserRole();

    // सामान्य कर्मचारी/एडमिनलाई सच्याउन पूर्ण रोक
    if (!isSuperAdmin) {
        alert("पहुँच अस्वीकृत: कर्मचारी वा सामान्य एडमिनलाई दर्ता भइसकेको विवरण सच्याउने अधिकार छैन! नयाँ दर्ता र प्रिन्ट मात्र गर्न सकिन्छ।");
        return false;
    }

    // सुपरएडमिनको लागि १ हप्ताको समय सीमा जाँच
    if (recordCreatedDate) {
        const created = new Date(recordCreatedDate);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - created) / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            alert("म्याद समाप्त: यो कागजात बनेको १ हप्ता (७ दिन) भन्दा बढी भइसकेकोले अब यसलाई सच्याउन मिल्दैन!");
            return false;
        }
    }

    return true; // १ हप्ता भित्र सुपरएडमिनले सच्याउन पाउने
}

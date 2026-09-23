// auth.js - मायादेवी गाउँपालिका नक्सा दर्ता प्रणाली प्रमाणीकरण

// १. लगइन ह्यान्डल गर्ने फङ्सन
async function handleStaffLogin(event) {
    if (event) event.preventDefault();

    // जुनसुकै आईडी वा नाम भए पनि इनपुट पत्ता लगाउने सुरक्षित तरिका
    const loginInput = document.getElementById('loginId') || 
                       document.getElementById('username') || 
                       document.getElementById('login_id') || 
                       document.querySelector('input[name="loginId"]') || 
                       document.querySelector('input[name="username"]') || 
                       document.querySelector('input[type="text"]');

    const passwordInput = document.getElementById('password') || 
                          document.querySelector('input[name="password"]') || 
                          document.querySelector('input[type="password"]');

    const login_id = loginInput ? loginInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!login_id || !password) {
        alert('कृपया Login ID र Password दुवै भर्नुहोस्।');
        return;
    }

    // बटन लोड हुँदैछ भनेर देखाउने
    const submitBtn = document.querySelector('button[type="submit"]') || document.querySelector('form button');
    const originalText = submitBtn ? submitBtn.innerText : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'लगइन हुँदैछ...';
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_id, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || data.message || 'Login ID वा Password मिलेन!');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
            return;
        }

        // प्रयोगकर्ताको सेसन सुरक्षित गर्ने
        sessionStorage.setItem('user', JSON.stringify(data.user || data));

        // भूमिका अनुसार रिडाइरेक्ट गर्ने
        const role = (data.user && data.user.role) ? data.user.role : '';
        if (role === 'superadmin' || role === 'admin') {
            window.location.href = '/darta.html';
        } else {
            window.location.href = '/darta.html';
        }

    } catch (err) {
        alert('सर्भरसँग सम्पर्क हुन सकेन: ' + err.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }
}

// २. पासवर्ड देखाउने वा लुकाउने (Eye Toggle) फङ्सन
function toggleLoginPassword() {
    const pwdInput = document.getElementById('password') || 
                     document.querySelector('input[name="password"]') || 
                     document.querySelector('input[type="password"]');
    if (pwdInput) {
        pwdInput.type = (pwdInput.type === 'password') ? 'text' : 'password';
    }
}

// ३. लगआउट गर्ने फङ्सन
function handleLogout() {
    sessionStorage.removeItem('user');
    window.location.href = '/login.html';
}

// फारामको इभेन्ट श्रोता (Event Listener) जोड्ने
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleStaffLogin);
    }
});

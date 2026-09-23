/* ==========================================================================
   H:\naksa-darta-system\frontend\js\auth.js
   ROLE-BASED AUTHENTICATION & SUPERADMIN USER MANAGEMENT
   ========================================================================== */

(function () {
    "use strict";

    const SESSION_KEY = "mayadevi_auth_session";
    const USERS_KEY = "mayadevi_system_users";
    const AUDIT_KEY = "mayadevi_audit_logs";

    // 1. Initial Mock Database for Browser Testing
    function initUsersDb() {
        let users = [];
        try {
            const raw = localStorage.getItem(USERS_KEY);
            if (raw) users = JSON.parse(raw);
        } catch (e) {
            users = [];
        }

        if (!users || users.length === 0) {
            users = [
                {
                    id: "usr_superadmin",
                    fullName: "सुपर एडमिन (कार्यालय प्रमुख)",
                    designation: "प्रमुख प्रशासकीय अधिकृत",
                    phone: "९८५७०१६९३९",
                    email: "admin@mayadevimunrupandehi.gov.np",
                    loginId: "superadmin",
                    passwordHash: "Admin@2083", // In production, hashed with bcrypt
                    role: "SUPERADMIN",
                    status: "ACTIVE",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "usr_staff001",
                    fullName: "प्रकाश थापा",
                    designation: "इन्जिनियर (प्राविधिक फाँट)",
                    phone: "९८४७१२३४५६",
                    email: "prakash.thapa@gmail.com",
                    loginId: "staff001",
                    passwordHash: "Staff@123",
                    role: "STAFF",
                    status: "ACTIVE",
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
        return users;
    }

    // 2. Audit Logger
    function logAudit(action, details, targetUser = "") {
        try {
            const session = getCurrentSession();
            const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
            const newLog = {
                id: "LOG-" + Date.now(),
                timestamp: new Date().toISOString(),
                performedBy: session ? `${session.fullName} (${session.loginId})` : "System / Anonymous",
                role: session ? session.role : "GUEST",
                action: action,
                details: details,
                targetUser: targetUser
            };
            logs.unshift(newLog);
            localStorage.setItem(AUDIT_KEY, JSON.stringify(logs.slice(0, 500)));
        } catch (e) {
            console.error("Audit log error:", e);
        }
    }

    // 3. Session Helpers
    function getCurrentSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setCurrentSession(user) {
        const safeSession = {
            id: user.id,
            fullName: user.fullName,
            designation: user.designation,
            loginId: user.loginId,
            role: user.role,
            phone: user.phone,
            email: user.email,
            loginAt: new Date().toISOString()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeSession));
        localStorage.setItem("loggedUserName", `${user.fullName} (${user.role === "SUPERADMIN" ? "Superadmin" : "Staff"})`);
    }

    function clearSession() {
        const session = getCurrentSession();
        if (session) {
            logAudit("LOGOUT", "प्रयोगकर्ता प्रणालीबाट बाहिरिएका छन्।");
        }
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem("loggedUserName");
    }

    // 4. Handle Staff Login
    window.handleStaffLogin = function (event) {
        if (event) event.preventDefault();

        const uInput = document.getElementById("loginUsername");
        const pInput = document.getElementById("loginPassword");
        const errBox = document.getElementById("loginErrorMsg");

        const loginId = (uInput?.value || "").trim();
        const password = (pInput?.value || "").trim();

        if (errBox) errBox.style.display = "none";

        if (!loginId || !password) {
            if (errBox) {
                errBox.textContent = "कृपया Login ID र Password दुवै भर्नुहोस्।";
                errBox.style.display = "block";
            }
            return;
        }

        const users = initUsersDb();
        const matched = users.find(u => u.loginId.toLowerCase() === loginId.toLowerCase() && u.passwordHash === password);

        if (!matched) {
            if (errBox) {
                errBox.textContent = "लगइन विवरण (Login ID वा Password) मिलेन।";
                errBox.style.display = "block";
            }
            logAudit("LOGIN_FAILED", `Login ID: ${loginId} बाट असफल प्रयास भएको छ।`);
            return;
        }

        if (matched.status !== "ACTIVE") {
            if (errBox) {
                errBox.textContent = "यो खाता निष्क्रिय (Deactivated) गरिएको छ। Superadmin सँग सम्पर्क गर्नुहोस्।";
                errBox.style.display = "block";
            }
            logAudit("LOGIN_BLOCKED", `निष्क्रिय खाता ${matched.loginId} बाट लगइन प्रयास।`);
            return;
        }

        setCurrentSession(matched);
        logAudit("LOGIN_SUCCESS", "सफलतापूर्वक लगइन भयो।");

        window.location.href = "darta.html";
    };

    // 5. Logout
    window.logoutUser = function () {
        if (!confirm("के तपाईं प्रणालीबाट लगआउट गर्न निश्चित हुनुहुन्छ?")) return;
        clearSession();
        window.location.href = "login.html";
    };

    // 6. Superadmin Functions
    window.getAllStaff = function () {
        const session = getCurrentSession();
        if (!session || session.role !== "SUPERADMIN") return [];
        return initUsersDb();
    };

    window.createNewStaff = function (staffData) {
        const session = getCurrentSession();
        if (!session || session.role !== "SUPERADMIN") {
            alert("यो कार्य केवल Superadmin ले मात्र गर्न पाउँछ।");
            return false;
        }

        const users = initUsersDb();
        const duplicate = users.some(u => u.loginId.toLowerCase() === staffData.loginId.trim().toLowerCase());
        if (duplicate) {
            alert("यो Login ID पहिले नै अर्को कर्मचारीको लागि प्रयोग भइसकेको छ।");
            return false;
        }

        const newUser = {
            id: "usr_" + Date.now(),
            fullName: staffData.fullName.trim(),
            designation: staffData.designation.trim(),
            phone: staffData.phone.trim(),
            email: staffData.email.trim(),
            loginId: staffData.loginId.trim(),
            passwordHash: staffData.initialPassword.trim(),
            role: staffData.role || "STAFF",
            status: "ACTIVE",
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        logAudit("STAFF_CREATED", `नयाँ कर्मचारी खाता सिर्जना गरियो: ${newUser.fullName} (${newUser.loginId})`, newUser.loginId);
        return true;
    };

    window.resetStaffPasswordByAdmin = function (userId, newPassword) {
        const session = getCurrentSession();
        if (!session || session.role !== "SUPERADMIN") {
            alert("अधिकार छैन।");
            return false;
        }

        const users = initUsersDb();
        const user = users.find(u => u.id === userId);
        if (!user) return false;

        user.passwordHash = newPassword;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        logAudit("PASSWORD_RESET_ADMIN", `Superadmin ले ${user.fullName} को पासवर्ड रिसेट गरिदिनुभयो।`, user.loginId);
        return true;
    };

    window.toggleStaffStatus = function (userId) {
        const session = getCurrentSession();
        if (!session || session.role !== "SUPERADMIN") {
            alert("अधिकार छैन।");
            return false;
        }

        const users = initUsersDb();
        const user = users.find(u => u.id === userId);
        if (!user) return false;

        if (user.role === "SUPERADMIN") {
            alert("Superadmin खातालाई निष्क्रिय वा बन्द गर्न मिल्दैन।");
            return false;
        }

        user.status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        logAudit("STAFF_STATUS_CHANGE", `${user.fullName} को स्थिति परिवर्तन गरियो: ${user.status}`, user.loginId);
        return user.status;
    };

    window.changeMyPassword = function (oldPassword, newPassword) {
        const session = getCurrentSession();
        if (!session) return false;

        const users = initUsersDb();
        const user = users.find(u => u.id === session.id);
        if (!user) return false;

        if (user.passwordHash !== oldPassword) {
            alert("हालको पासवर्ड मिलेन।");
            return false;
        }

        user.passwordHash = newPassword;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        logAudit("PASSWORD_CHANGED_SELF", "प्रयोगकर्ताले आफ्नो पासवर्ड परिवर्तन गरे।");
        alert("पासवर्ड सफलतापूर्वक परिवर्तन भयो।");
        return true;
    };

    window.getAuditLogs = function () {
        const session = getCurrentSession();
        if (!session || session.role !== "SUPERADMIN") return [];
        return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
    };

    // 7. Route Guard Enforcement
    function enforceRouteGuard() {
        initUsersDb();
        const path = window.location.pathname.toLowerCase();
        const session = getCurrentSession();

        const isLoginPage = path.endsWith("login.html") || path.endsWith("/login");
        const isVerifyPage = path.endsWith("verify.html") || path.endsWith("/verify");

        if (isLoginPage) {
            if (session) {
                window.location.href = "darta.html";
            }
            return;
        }

        if (isVerifyPage) {
            return; // Public Page
        }

        if (!session) {
            window.location.href = "login.html";
            return;
        }

        const userBadge = document.getElementById("loggedUserName");
        if (userBadge && session) {
            userBadge.textContent = `${session.fullName} [${session.role}]`;
        }

        const superadminMenu = document.getElementById("navSuperadminPanel");
        if (superadminMenu) {
            superadminMenu.style.display = session.role === "SUPERADMIN" ? "inline-block" : "none";
        }
    }

    window.getCurrentSession = getCurrentSession;
    window.logAudit = logAudit;

    document.addEventListener("DOMContentLoaded", enforceRouteGuard);
})();
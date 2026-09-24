document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const loginIdInput = document.getElementById("loginId") || document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const errorBox = document.getElementById("loginError") || document.getElementById("errorMessage");

        if (!loginIdInput || !passwordInput) return;

        const loginId = loginIdInput.value.trim();
        const password = passwordInput.value.trim();

        if (errorBox) {
            errorBox.style.display = "none";
            errorBox.textContent = "";
        }

        // १. सुपरएडमिन प्रमाणीकरण (Master Account)
        if (loginId.toLowerCase() === "superadmin" && password === "Admin@2083") {
            const superUser = {
                id: 1,
                full_name: "सुपर एडमिन",
                login_id: "superadmin",
                role: "superadmin"
            };
            sessionStorage.setItem("user", JSON.stringify(superUser));
            localStorage.setItem("user", JSON.stringify(superUser));
            alert("सुपरएडमिन लगइन सफल भयो!");
            window.location.href = "darta.html";
            return;
        }

        // २. सुपरएडमिनले सिर्जना गरेका अन्य कर्मचारीहरूको प्रमाणीकरण (Local Staff List)
        try {
            const staffList = JSON.parse(localStorage.getItem("mayadevi_staff_list")) || [];
            const matchedStaff = staffList.find(
                (u) => u.login_id.toLowerCase() === loginId.toLowerCase() && u.password === password
            );

            if (matchedStaff) {
                const sessionUser = {
                    id: matchedStaff.id,
                    full_name: matchedStaff.full_name,
                    post: matchedStaff.post,
                    login_id: matchedStaff.login_id,
                    role: matchedStaff.login_id.toLowerCase() === "superadmin" ? "superadmin" : "staff"
                };

                sessionStorage.setItem("user", JSON.stringify(sessionUser));
                localStorage.setItem("user", JSON.stringify(sessionUser));

                alert(`कर्मचारी लगइन सफल भयो! स्वागत छ, ${matchedStaff.full_name}।`);
                window.location.href = "darta.html";
                return;
            }
        } catch (err) {
            console.error("कर्मचारी डाटा पढ्न सकिएन:", err);
        }

        // गलत विवरण भएमा देखाउने सूचना
        if (errorBox) {
            errorBox.textContent = "प्रयोगकर्ता आइडी वा पासवर्ड मिलेन! कृपया पुन: प्रयास गर्नुहोस्।";
            errorBox.style.display = "block";
        } else {
            alert("प्रयोगकर्ता आइडी वा पासवर्ड मिलेन! कृपया पुन: प्रयास गर्नुहोस्।");
        }
    });
});

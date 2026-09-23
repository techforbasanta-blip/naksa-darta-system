/* ==========================================================================
   H:\naksa-darta-system\frontend\js\certificate.js
   BULLETPROOF SINGLE QR ENGINE, PASSPORT PHOTO & PRINT DISPATCHER
   ========================================================================== */

(function () {
    "use strict";

    const PHOTO_KEY = "naksa_darta_passport_photo";

    function getEl(id) {
        return document.getElementById(id);
    }

    function getValue(id) {
        const el = getEl(id);
        return el ? String(el.value ?? "").trim() : "";
    }

    function handlePassportPhotoSelect(event) {
        const input = event?.target || getEl("passportPhotoInput");
        if (!input || !input.files || !input.files[0]) return;

        const file = input.files[0];
        if (!file.type.startsWith("image/")) {
            alert("कृपया image file मात्र छनोट गर्नुहोस्।");
            input.value = "";
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            alert("Passport photo अधिकतम 3 MB सम्म हुनुपर्छ।");
            input.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const dataURL = e.target.result;
            try {
                localStorage.setItem(PHOTO_KEY, dataURL);
            } catch (error) {
                console.warn("Photo storage issue:", error);
            }
            applyPassportPhoto(dataURL);
        };
        reader.readAsDataURL(file);
    }

    function applyPassportPhoto(dataURL) {
        const img = getEl("certPassportImg");
        const placeholder = getEl("certPassportPh");
        const miniImg = getEl("passportPhotoPreviewImg");
        const miniSpan = document.querySelector("#passportPhotoPreview span");

        if (dataURL) {
            if (img) { img.src = dataURL; img.style.display = "block"; }
            if (placeholder) placeholder.style.display = "none";
            if (miniImg) { miniImg.src = dataURL; miniImg.style.display = "block"; }
            if (miniSpan) miniSpan.style.display = "none";
        } else {
            if (img) { img.removeAttribute("src"); img.style.display = "none"; }
            if (placeholder) placeholder.style.display = "block";
            if (miniImg) { miniImg.src = ""; miniImg.style.display = "none"; }
            if (miniSpan) miniSpan.style.display = "block";
        }
    }

    function removePassportPhoto() {
        const input = getEl("passportPhotoInput");
        if (input) input.value = "";
        try {
            localStorage.removeItem(PHOTO_KEY);
        } catch (e) {}
        applyPassportPhoto("");
    }

    function loadSavedPassportPhoto() {
        try {
            const photo = localStorage.getItem(PHOTO_KEY) || "";
            if (photo) applyPassportPhoto(photo);
        } catch (e) {}
    }

    // 100% BULLETPROOF SINGLE QR CODE GENERATOR (NO DUPLICATION)
    function generateVerificationQR() {
        const qrBox = getEl("cert_qr_div");
        if (!qrBox) return;

        // भित्र रहेको पुरानो जेसुकै वस्तुलाई पूरै सफा गर्ने
        qrBox.innerHTML = "";

        const fiscal = getValue("in_fiscal_year") || "२०८३/०८४";
        const darta = getValue("in_darta_no") || "२८/२०८३/०८४";

        const fiscalClean = fiscal.replace(/[^\d०-९]/g, "").slice(-4) || "083";
        const dartaClean = encodeURIComponent(darta);
        
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        const verifyUrl = `${window.location.origin}${basePath}verify.html?token=MD-${fiscalClean}-${dartaClean}`;

        if (typeof QRCode !== "undefined") {
            try {
                new QRCode(qrBox, {
                    text: verifyUrl,
                    width: 42,
                    height: 42,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });

                // महत्वपूर्ण समाधान: qrcodejs ले क्यानभास र इमेज दुवै बनाउँछ।
                // क्यानभासलाई तत्कालै हटाएर केवल १ वटा इमेज मात्र बाँकी राखिन्छ।
                const canvas = qrBox.querySelector("canvas");
                if (canvas) {
                    canvas.remove();
                }
                return;
            } catch (err) {
                console.warn("QRCode error:", err);
            }
        }

        // Fallback: एकल इमेज मात्र
        const img = document.createElement("img");
        img.alt = "QR";
        img.style.width = "42px";
        img.style.height = "42px";
        img.style.display = "block";
        img.src = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=84&margin=1`;
        qrBox.appendChild(img);
    }

    function triggerPrint(mode) {
        const container = getEl("printAreaContainer");
        if (container) {
            if (mode === "bw") {
                container.classList.add("bw-mode");
            } else {
                container.classList.remove("bw-mode");
            }
        }
        requestAnimationFrame(function () {
            window.print();
        });
    }

    window.addEventListener("afterprint", function () {
        const container = getEl("printAreaContainer");
        if (container) container.classList.remove("bw-mode");
    });

    function attachCertificateEvents() {
        const form = getEl("dartaForm");
        if (form) {
            form.addEventListener("input", function (e) {
                if (e.target && e.target.id === "passportPhotoInput") return;
                if (typeof window.updateCertificateLive === "function") {
                    window.updateCertificateLive();
                }
            });
            form.addEventListener("change", function () {
                if (typeof window.updateCertificateLive === "function") {
                    window.updateCertificateLive();
                }
            });
        }

        const photoInput = getEl("passportPhotoInput");
        if (photoInput) {
            photoInput.addEventListener("change", handlePassportPhotoSelect);
        }

        loadSavedPassportPhoto();
        generateVerificationQR();
    }

    window.handlePassportPhotoSelect = handlePassportPhotoSelect;
    window.removePassportPhoto = removePassportPhoto;
    window.loadSavedPassportPhoto = loadSavedPassportPhoto;
    window.triggerPrint = triggerPrint;
    window.generateVerificationQR = generateVerificationQR;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attachCertificateEvents);
    } else {
        attachCertificateEvents();
    }
})();
/* ==========================================================================
   H:\naksa-darta-system\backend\middleware\roleMiddleware.js
   ROLE-BASED ACCESS CONTROL (SUPERADMIN / STAFF)
   ========================================================================== */

module.exports = function (requiredRole) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "अनधिकृत पहुँच।"
            });
        }

        // यदि Superadmin चाहिन्छ र प्रयोगकर्ता Superadmin होइन भने रोक्ने
        if (requiredRole === "SUPERADMIN" && req.user.role !== "SUPERADMIN") {
            return res.status(403).json({
                success: false,
                message: "यो कार्य गर्ने अधिकार केवल Superadmin लाई मात्र छ।"
            });
        }

        next();
    };
};
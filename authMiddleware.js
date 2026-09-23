/* ==========================================================================
   H:\naksa-darta-system\backend\middleware\authMiddleware.js
   JWT AUTHENTICATION VERIFIER
   ========================================================================== */

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "पहुँच अस्वीकृत: कुनै पनि आधिकारिक टोकन प्राप्त भएन।"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret_jwt_key_2083");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: "अमान्य वा म्याद सकिएको टोकन।"
        });
    }
};
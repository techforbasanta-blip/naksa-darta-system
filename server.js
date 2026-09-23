/* =========================================================
   H:\naksa-darta-system\backend\server.js
   MAYADEVI NAKSA DARTA SYSTEM - MAIN EXPRESS API SERVER
   ========================================================= */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");
const recordRoutes = require("./routes/recordRoutes");
const verifyRoutes = require("./routes/verifyRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static Frontend Files
app.use(express.static(path.join(__dirname, "../frontend")));

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/verify", verifyRoutes);

// Base Health Check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        municipality: "मायादेवी गाउँपालिका, रुपन्देही",
        system: "घर नक्सा दर्ता तथा अभिलेखीकरण प्रणाली API",
        time: new Date().toISOString()
    });
});

// Root Routing for Vercel / Local Server
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`मायादेवी नक्सा दर्ता सर्भर http://localhost:${PORT} मा सुरु भयो।`);
    });
}

module.exports = app;
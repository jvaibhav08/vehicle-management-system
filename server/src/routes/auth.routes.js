const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");

const {
    registerUser,
    loginUser
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile",authenticateUser, (req, res) => {
    res.json({
        success: true,
        message: "Profile accessed successfully",
        user: req.user
    });

});
module.exports = router;
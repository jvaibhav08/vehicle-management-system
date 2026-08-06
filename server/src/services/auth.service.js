const authModel = require("../models/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (userData) => {

    try {

        const existingUser = await authModel.findByEmail(userData.email);

        if (existingUser.length > 0) {
            return {
                success: false,
                message: "User already exists"
            };
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        const result = await authModel.createUser(userData);

        if (result.affectedRows > 0) {
            return {
                success: true,
                message: "User registered successfully"
            };
        }

        return {
            success: false,
            message: "User registeration failed"
        };
    }
    catch (error) {
        console.log(error);

        return {
            success: false,
            message: "Database error"
        };
    }

};
const loginUser = async (loginData) => {

    try {
        const existingUser = await authModel.findByEmail(loginData.email);

        if (existingUser.length === 0) {
            return {
                success: false,
                message: "Invalid email or password"
            };
        }
        const user = existingUser[0];
        const isPasswordMatch = await bcrypt.compare(
            loginData.password,
            user.password
        );

        if (!isPasswordMatch){
            return {
                success: false,
                message: "Invalid email or password"
            };
        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );
        return {
            success: true,
            message: "Login successful",
            token
        };
    }
    catch (error) {

        console.log(error);

        return {
            success: false,
            message: "Database error"
        };

    }

};

module.exports = {
    registerUser, loginUser
};
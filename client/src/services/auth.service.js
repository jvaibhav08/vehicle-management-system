import api from "../api/axios";

// ======================================================
// LOGIN
// ======================================================

export const login = async (credentials) => {
    const response = await api.post(
        "/auth/login",
        credentials
    );

    return response.data;
};


// ======================================================
// REGISTER
// ======================================================

export const register = async (userData) => {
    const response = await api.post(
        "/auth/register",
        userData
    );

    return response.data;
};


// ======================================================
// VERIFY EMAIL OTP
// ======================================================

export const verifyEmailOtp = async (data) => {
    const response = await api.post(
        "/auth/verify-email",
        data
    );

    return response.data;
};


// ======================================================
// LOGOUT
// ======================================================

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
};

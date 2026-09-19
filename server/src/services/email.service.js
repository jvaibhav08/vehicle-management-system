const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {

    try {

        const result = await transporter.sendMail({
            from: `"Vehicle Management System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });

        console.log("Email sent:", result.messageId);

        return {
            success: true,
            message: "Email sent successfully"
        };

    } catch (error) {

        console.log("Email sending error:", error);

        return {
            success: false,
            message: "Failed to send email"
        };

    }

};

module.exports = {
    sendEmail
};
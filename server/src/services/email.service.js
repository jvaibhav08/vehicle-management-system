const sendEmail = async (to, subject, text) => {
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM,
                to,
                subject,
                text
            }),
            signal: AbortSignal.timeout(10000)
        });

        const result = await response.json();

        if (!response.ok) {
            console.log("Email sending failed:", result);
            return {
                success: false,
                message: "Failed to send email"
            };
        }

        console.log("Email sent successfully:", result.id);

        return {
            success: true,
            message: "Email sent successfully"
        };
    } catch (error) {
        console.log("Email sending error:", error.message);

        return {
            success: false,
            message: "Failed to send email"
        };
    }
};

module.exports = {
    sendEmail
};
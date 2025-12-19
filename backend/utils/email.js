const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // App Password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", to);
        return result;
    } catch (error) {
        console.error("Email sending failed:", error);
        return null;
    }
};

module.exports = sendEmail;

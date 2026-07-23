require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("Using user:", process.env.EMAIL_USER);
console.log("Using pass:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function run() {
    try {
        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "Test Email",
            text: "Testing nodemailer..."
        });
        console.log("Success:", info.messageId);
    } catch (err) {
        console.error("Error sending email:");
        console.error(err);
    }
}

run();

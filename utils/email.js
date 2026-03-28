const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For development, we use ethereal mail (or you can use your own Gmail/SendGrid)
    // To set up real email, add EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD to .env
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || 587,
        auth: {
            user: process.env.EMAIL_USERNAME || 'example@ethereal.email',
            pass: process.env.EMAIL_PASSWORD || 'password123'
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Fixentra Team <hello@fixentra.in>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML version
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

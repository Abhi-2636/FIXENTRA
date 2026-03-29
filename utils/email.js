const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const hasRealEmailConfig = Boolean(
        process.env.EMAIL_HOST &&
        process.env.EMAIL_USERNAME &&
        process.env.EMAIL_PASSWORD
    );

    const transporter = hasRealEmailConfig
        ? nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
        : nodemailer.createTransport({ jsonTransport: true });

    const mailOptions = {
        from: 'Fixentra Team <hello@fixentra.in>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    return {
        simulated: !hasRealEmailConfig,
        info
    };
};

module.exports = sendEmail;

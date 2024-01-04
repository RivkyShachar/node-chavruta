const nodemailer = require("nodemailer");
exports.sendEmail = async (options) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: 'smallbiz24@outlook.comblblb',
                pass: 'Timpy24!'
            },
            tls: {
                ciphers: 'SSLv3',
            },
        });

        // Define email options
        const mailOptions = {
            from: 'smallbiz24@outlook.comblblbbl',
            to: options.email,
            subject: options.subject,
            text: options.text,
            html: '<b>write here html</b>',
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Rethrow the error to handle it in the calling function
    }
};

// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//     try {
//         // 1. Create transporter
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER, // Your Gmail email address
//                 pass: process.env.EMAIL_PASSWORD, // Your Gmail password or app-specific password
//             },
//         });

//         // 2. Define email options
//         const mailOptions = {
//             from: "Rivky <rivkivider@gmail.com>",
//             to: options.email,
//             subject: options.subject,
//             text: options.text,
//             // html: options.html, // Uncomment this line if you want to send HTML emails
//         };

//         // 3. Send the email
//         await transporter.sendMail(mailOptions);
//         console.log("Email sent successfully to:", options.email);
//     } catch (error) {
//         console.error("Error sending email:", error);
//         throw error; // Rethrow the error to handle it in the calling function
//     }
// };

// module.exports = { sendEmail };



// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//     try {
//         ///1 create transporter
//         const transporter = nodemailer.createTransport({
//             host: process.env.EMAIL_HOST,
//             port: process.env.EMAIL_PORT || 2525,
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASSWORD,
//             },
//         });
//         ///2 Define email options
//         const mailOptions = {
//             from: "Rivky <rivkivider@gmail.com>",
//             to: options.email,
//             subject: options.subject,
//             text: options.text,
//             //html
//         };
//         ///3 send the email
//         await transporter.sendMail(mailOptions);
//         console.log("Email sent successfully to:", options.email);
//     } catch (error) {
//         console.error("Error sending email:", error);
//         throw error; // rethrow the error to handle it in the calling function
//     }
// };

// module.exports = { sendEmail };

import nodemailer from "nodemailer"; 

const sendEmail = async (option) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOption = {
      from: process.env.EMAIL_ID,
      to: option.email,
      subject: option.subject,
      html: option.message,
    };
    await transporter.sendMail(mailOption, (err, info) => {
      if (err) console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
};

export default sendEmail; 
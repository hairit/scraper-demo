const nodemailer = require("nodemailer");

export const sendMail = (from, to, cc, bcc, subject, body, attachments) => {
  let transporter = nodemailer.createTransport({
    host: `smtp.gmail.com`,
    secureConnection: false,
    port: 587,
    auth: {
      user: `tuonghai.work@gmail.com`,
      pass: `wvhkfznpnetmxrlo`,
    },
  });
  var inlineBase64 = require("nodemailer-plugin-inline-base64");
  transporter.use("compile", inlineBase64({ cidPrefix: "somePrefix_" }));
  let mailOptions = {
    from: from,
    to: to, // list of receivers
    cc: cc,
    bcc: bcc,
    subject: subject, // Subject line
    html: "<html><body>" + body + "</body></html>", // html body,
    attachments,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.send(info.response);
    }
  });
};

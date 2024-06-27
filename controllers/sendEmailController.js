const nodemailer = require("nodemailer");
const User = require("../models/User");
const Agenda = require("agenda");

const agenda = new Agenda({
  db: { address: process.env.MONGO_URI },
  collection: "agendaJobs",
});

// Start Agenda and define job
agenda.on("ready", async () => {
  console.log("Agenda is ready");

  // Define a transporter for nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.useremail,
      pass: process.env.password,
    },
  });

  // Define an Agenda job for sending email
  agenda.define("send email", async (job, done) => {
    const { to, subject, text, greet, senderName } = job.attrs.data;
    try {
      let info = await transporter.sendMail({
        from: "rishabhjain223344@gmail.com",
        to: to,
        subject: subject,
        text: text,
      });
      console.log("Message sent: %s", info.messageId);
      done();
    } catch (error) {
      console.error("Error sending email:", error);
      done(error);
    }
  });

  // Start processing jobs
  agenda.start();
});

// Send email function
module.exports.sendEmail = async (req, res) => {
  const { to, subject, text, greet, senderName, time } = req.body;
  const userId = req.userID;

  // console.log(userId);

  try {
    // Check user authorization
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "You are not Authorized" });
    }

    // Define a transporter for nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.useremail,
        pass: process.env.password,
      },
    });

    // Schedule or send email immediately based on 'time' parameter
    if (time) {
      const timeInMinutes = parseInt(time, 10);
      if (isNaN(timeInMinutes) || timeInMinutes < 0) {
        return res.status(400).json({ error: "Invalid time value" });
      }
      const scheduleAt = new Date(Date.now() + timeInMinutes * 60000);

      await agenda.schedule(scheduleAt, "send email", {
        to,
        subject,
        text,
        greet,
        senderName,
      });
      res.status(200).json({ message: "Email scheduled successfully" });
    } else {
      let info = await transporter.sendMail({
        from: "rishabhjain223344@gmail.com",
        to: to,
        subject: subject,
        text: text,
      });
      console.log("Message sent: %s", info.messageId);
      res.status(200).json({
        message: "Email sent successfully",
        messageId: info.messageId,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to send or schedule email" });
  }
};

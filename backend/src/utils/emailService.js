import nodemailer from "nodemailer";

// Email configuration
const emailConfig = {
  service: "gmail",
  auth: {
    user: "231fa04f98@gmail.com",
    pass: "fxaozkvinobubkqy",
  },
  tls: {
    rejectUnauthorized: false,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service connection failed:', error.message);
  } else {
    console.log('✅ Email service ready to send emails');
  }
});

// Test email config
export const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email configuration is valid!");
  } catch (error) {
    console.error("❌ Email config error:", error.message);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (userEmail, userData) => {
  try {
    console.log('📧 Attempting to send welcome email to:', userEmail);
    
    const mailOptions = {
      from: `"Healthcare Team" <${emailConfig.auth.user}>`,
      to: userEmail,
      subject: "Welcome to Healthcare Management System",
      html: `<h3>Welcome ${userData.name}, your account is created ✅</h3>`,
    };

    const res = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully:", res.messageId);
    return res;
  } catch (error) {
    console.error("❌ Welcome email failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      to: userEmail
    });
    throw error;
  }
};

// Send appointment confirmation
export const sendAppointmentConfirmation = async (patientEmail) => {
  try {
    console.log('📧 Attempting to send appointment email to:', patientEmail);
    
    const mailOptions = {
      from: `"Healthcare Team" <${emailConfig.auth.user}>`,
      to: patientEmail,
      subject: "Appointment Confirmed",
      html: `<h3>Your appointment is successfully booked ✅</h3>`,
    };

    const res = await transporter.sendMail(mailOptions);
    console.log("✅ Appointment email sent successfully:", res.messageId);
    return res;
  } catch (error) {
    console.error("❌ Appointment email failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      to: patientEmail
    });
    throw error;
  }
};

// Send appointment status update
export const sendAppointmentStatusUpdate = async (patientEmail, appointmentData) => {
  try {
    const mailOptions = {
      from: `"Healthcare Team" <${emailConfig.auth.user}>`,
      to: patientEmail,
      subject: "Appointment Status Updated",
      html: `<h3>Status Updated: ${appointmentData.status}</h3>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Status update email sent");
  } catch (error) {
    console.error("❌ Error sending status update:", error.message);
  }
};

// Send appointment cancellation email
export const sendAppointmentCancellation = async (patientEmail, appointmentData) => {
  try {
    const mailOptions = {
      from: `"Healthcare Team" <${emailConfig.auth.user}>`,
      to: patientEmail,
      subject: "Appointment Cancelled",
      html: `<h3>Your appointment has been cancelled</h3>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Cancellation email sent");
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error.message);
  }
};
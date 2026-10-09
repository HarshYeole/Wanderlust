import nodemailer from "nodemailer"

const sendPasswordResetEmail = async (email, token) => {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
    const port = Number(process.env.SMTP_PORT || 587)
    const secure = process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465

    if (!(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM)) {
        throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM must be configured")
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("SMTP_PORT must be a valid port number")
    }

    const clientUrl = process.env.CLIENT_URL?.split(",")[0]?.trim()
    if (process.env.NODE_ENV === "production" && !clientUrl) {
        throw new Error("CLIENT_URL must be configured to send password reset links")
    }

    const resetUrl = new URL("/reset-password", clientUrl || "http://localhost:3000")
    if (resetUrl.protocol !== "https:" && resetUrl.protocol !== "http:") {
        throw new Error("CLIENT_URL must use HTTP or HTTPS")
    }
    if (process.env.NODE_ENV === "production" && resetUrl.protocol !== "https:") {
        throw new Error("Password reset links must use HTTPS in production")
    }
    resetUrl.searchParams.set("token", token)

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure,
        requireTLS: !secure,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000
    })

    await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: "Reset your Wanderlust password",
        text: `We received a request to reset your Wanderlust password. Use this one-time link within 30 minutes:\n\n${resetUrl.href}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>We received a request to reset your Wanderlust password.</p><p><a href="${resetUrl.href}">Reset your password</a></p><p>This one-time link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`
    })
}

export default sendPasswordResetEmail

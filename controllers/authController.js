const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, name) => {
  await transporter.sendMail({
    from: `"UrbanWell" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your UrbanWell Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#03050a;color:#e2ecff;padding:40px;border-radius:16px;border:1px solid rgba(0,212,255,0.1);">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="width:52px;height:52px;background:linear-gradient(135deg,#c6f135,#00d4ff);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#000;margin:0 auto 16px;">U</div>
          <h1 style="font-size:24px;font-weight:800;margin:0;letter-spacing:-1px;color:#e2ecff;">Verify Your Email</h1>
        </div>
        <p style="color:#4d6b8a;line-height:1.8;margin-bottom:24px;font-size:15px;">
          Hi <strong style="color:#e2ecff;">${name || 'there'}</strong>, use the code below to verify your UrbanWell account.
        </p>
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;padding:20px 40px;background:rgba(198,241,53,0.08);border:2px solid rgba(198,241,53,0.3);border-radius:16px;font-size:36px;font-weight:900;letter-spacing:8px;color:#c6f135;">${otp}</div>
        </div>
        <p style="color:#4d6b8a;font-size:13px;line-height:1.7;">This code expires in <strong style="color:#e2ecff;">10 minutes</strong>. If you didn't create an account, ignore this email.</p>
        <hr style="border:none;border-top:1px solid rgba(0,212,255,0.08);margin:24px 0;" />
        <p style="color:#4d6b8a;font-size:11px;text-align:center;">UrbanWell - AI-Powered Health & Fitness Platform</p>
      </div>
    `,
  });
};

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });

    if (existing && existing.isVerified)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (existing && !existing.isVerified) {
      existing.name = name;
      existing.password = password;
      existing.otp = otp;
      existing.otpExpires = otpExpires;
      existing.isVerified = true;
      await existing.save();
      try { await sendOTPEmail(email, otp, name); } catch (e) { console.log('Email skipped:', e.message); }
      const token = createToken(existing);
      return res.json({ success: true, message: 'Account created', email, token, user: safeUser(existing) });
    }

    const newUser = new User({ name, email, password, otp, otpExpires, isVerified: true });
    await newUser.save();
    try { await sendOTPEmail(email, otp, name); } catch (e) { console.log('Email skipped:', e.message); }
    const token = createToken(newUser);
    res.status(201).json({ success: true, message: 'Account created', email, token, user: safeUser(newUser) });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Signup failed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isVerified)
      return res.status(401).json({ success: false, message: 'Please verify your email first' });

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = createToken(user);

    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    if (user.otpExpires < new Date())
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = createToken(user);

    res.json({ success: true, message: 'Email verified successfully', token, user: safeUser(user) });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isVerified)
      return res.status(400).json({ success: false, message: 'Email is already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try { await sendOTPEmail(email, otp, user.name); } catch (e) { console.log('Email skipped:', e.message); }

    res.json({ success: true, message: 'New OTP sent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user)
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    try {
      await transporter.sendMail({
        from: `"UrbanWell" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset Your UrbanWell Password',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#03050a;color:#e2ecff;padding:40px;border-radius:16px;border:1px solid rgba(0,212,255,0.1);">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="width:52px;height:52px;background:linear-gradient(135deg,#c6f135,#00d4ff);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#000;margin:0 auto 16px;">U</div>
              <h1 style="font-size:24px;font-weight:800;margin:0;letter-spacing:-1px;color:#e2ecff;">Reset Your Password</h1>
            </div>
            <p style="color:#4d6b8a;line-height:1.8;margin-bottom:28px;font-size:15px;">
              Hi <strong style="color:#e2ecff;">${user.name || 'there'}</strong>, we received a request to reset your UrbanWell password.
            </p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${resetUrl}" style="display:inline-block;padding:15px 36px;background:#c6f135;color:#000;font-weight:800;font-size:15px;border-radius:12px;text-decoration:none;">
                Reset My Password
              </a>
            </div>
            <p style="color:#4d6b8a;font-size:13px;line-height:1.7;margin-bottom:16px;">This link expires in <strong style="color:#e2ecff;">1 hour</strong>.</p>
            <p style="color:#4d6b8a;font-size:13px;">If you didn't request this, ignore this email.</p>
            <hr style="border:none;border-top:1px solid rgba(0,212,255,0.08);margin:24px 0;" />
            <p style="color:#4d6b8a;font-size:11px;text-align:center;">UrbanWell - AI-Powered Health & Fitness Platform</p>
          </div>
        `,
      });
    } catch (e) {
      console.log('Reset email skipped:', e.message);
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, error: 'Failed to process request. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword)
      return res.status(400).json({ success: false, error: 'Token, email, and new password are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password. Please try again.' });
  }
};
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectToMongo = require('../DB/DataBase');
const Users = require('../Schema/User')
const cors = require('cors')
const randomstring = require('randomstring')
const nodemailer = require('nodemailer')
const router = express.Router();

connectToMongo();
const app = express();
app.use(express.json());
app.use(cors())

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Create a new user
router.post('/createuser', async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password, confirmPassword } = req.body;
    // Basic input validation
    if (!firstName || !email || !password || !mobileNumber) {
      console.log("first", req.body)
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    // Basic input validation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Please fill correct confirm password' });
    }
    // Check if the user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create and save the new user
    const newUser = new Users({ firstName, lastName, email,mobileNumber, password: hashedPassword, confirmPassword: hashedPassword, date:Date.now() });
    newUser.save(); // getting server error
    res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(200).json({ status: 400, message: 'Invalid email or password' });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(200).json({ status: 400, message: 'Invalid email or password' });
    }

    // Generate a JWT token for authentication
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
      expiresIn: '1h',
    });

    res.status(200).json({ token:token, message:"Log in success", status : 200});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user information
app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete the user by ID
    await User.findByIdAndRemove(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Forgot Password - Send OTP via Email
router.post('/forgot_password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random OTP (you can choose your desired OTP length)
    const otp = randomstring.generate(6); // 6-digit OTP

    // Store the OTP in the user document (for verification later)
    user.resetPasswordOTP = otp;
    await user.save();

    // Send the OTP via email
    const transporter = nodemailer.createTransport({
      service: 'azaan3842@gmail.com', // Use the appropriate email service (e.g., Gmail)
      auth: {
        user: 'azaan3842@gmail.com', // Replace with your email address
        pass: 'uwqexhgenonnldpd', // Replace with your email password or an app-specific password
      },
    });

    const mailOptions = {
      from: 'azaan3842@email.com', // Sender's email address
      to: email, // Recipient's email address
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Email could not be sent' });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'OTP sent to your email' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Verify OTP and Reset Password
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the OTP matches
    if (user.resetPasswordOTP !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = null; // Clear the OTP field
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = router;
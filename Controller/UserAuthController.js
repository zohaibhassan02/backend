const UserAuthModal = require("../Model/UserAuthModal");
const SubUserModal = require("../Model/SubUserModal");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
// const bcrypt = require("bcryptjs");

exports.userSignUp = (req, res) => {
    try {
        UserAuthModal.findOne({ email: req.body.email }).exec(async (error, user) => {
            if (user) {
                return res.status(400).json({
                    status: "error",
                    message: "User already exist"
                })
            }
            const {
                fullName,
                email,
                password,
                companyName,
                hearFrom
            } = req.body;
            const _newUser = new UserAuthModal({
                fullName,
                email,
                password,
                companyName,
                hearFrom
            })


            _newUser.save((error, data) => {
                if (error) {
                    return res.status(400).json({
                        status: "error",
                        message: "Something went wrong",
                        error: error
                    })
                }
                if (data) {
                    return res.status(201).json({
                        status: "Success",
                        message: "User account created successfully",
                        data: data,
                    });
                }
            });


        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Something went wrong",
            error: error
        })
    }
}


exports.userSignIn = (req, res) => {
    UserAuthModal.findOne({ email: req.body.email }).exec((error, user) => {
        if (error) return res.status(400).json({
            status: 'error',
            error: error,
            message: "No user found"
        })


        if (user) {
            if (user.password === req.body.password) {
                const token = jwt.sign(
                    { _id: user._id, type: 'user' },
                    process.env.JET_SECREAT
                )
                res.cookie('token', token, 
                    { expire: new Date() + 9999 },
                    { httpOnly: true }
                );
                res.status(200).json({
                    token,
                    message: "Login successfully",
                });

            } else {
                res.status(404).json({
                    message: "Invalid password",
                });
            }
        }
        else {
            res.status(404).json({
                message: "Something went wrong",
            });
        }
    })
}

exports.userSignOut = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        message: 'Logged out successfully'
    });
}

exports.userEditProfile = (req, res) => {

    const { fullName, companyName, hearFrom } = req.body;
    UserAuthModal.findOneAndUpdate({ _id: req.userId}, 
        { fullName, companyName, hearFrom }, 
        { new: true }
    ).exec((error, user) => {
        if (error) return res.status(400).json({
            status: 'error',
            error: error,
            message: "No user found"
        })
        if (user) {
            return res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
            })
        }
        else {
            res.status(404).json({
                message: "Something went wrong",
            });
        }
    })
}


// Request password reset
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
  
    try {
        const user = await UserAuthModal.findOne({ email });
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JET_SECREAT, { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const resetLink = `http://localhost:4000/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset Request',
            text: `Click the following link to reset your password: ${resetLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to send reset email', error });
        }
        res.status(200).json({ message: 'Password reset email sent successfully' });
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
  
// Reset password
exports.resetPassword = async (req, res) => {
    const token = req.params.token;

    try {
        const decoded = jwt.verify(token, process.env.JET_SECREAT);
        const user = await UserAuthModal.findById(decoded.id);
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        // user.password = await bcrypt.hash(newPassword, 10);
        user.password = req.body.newPassword;
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await UserAuthModal.findById(userId);
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        // const isMatch = await bcrypt.compare(oldPassword, user.password);
        const isMatch = oldPassword === user.password;
        if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // user.password = await bcrypt.hash(newPassword, 10);
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}


// Invite a sub-user
exports.inviteSubUser = async (req, res) => {
    const { subUserEmail } = req.body;
    const parentUserId = req.userId;

    try {
        const parentUser = await UserAuthModal.findById(parentUserId);
        if (!parentUser) {
            return res.status(404).json({ message: 'Parent user not found' });
        }

        const existingSubUser = await SubUserModal.findOne({ email: subUserEmail });
        if (existingSubUser) {
            return res.status(400).json({ message: 'Sub-user already exists' });
        }

        const subUser = new SubUserModal({
            email: subUserEmail,
            // password: bcrypt.hashSync('temporaryPassword', 10),
            password: 'password123',
            parentUser: parentUser._id
        });

        await subUser.save();
        parentUser.subusers.push(subUser._id);
        await parentUser.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: subUserEmail,
            subject: 'Sub-user Invitation',
            text: `You have been invited to create a sub-user account. Please use this temporary password to log in and set your new password: password123`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            return res.status(500).json({ message: 'Failed to send invitation email', error });
            }
            res.status(200).json({ message: 'Invitation sent successfully' });
        });
    } catch (error) {
    res.status(500).json({ message: 'Server error', error });
    }
};

// Toggle sub-user status
exports.toggleSubUserStatus = async (req, res) => {
    const { subUserEmail } = req.body;

    try {
    const parentUserId = req.userId;
    const subUser = await SubUserModal.findOne({ email: subUserEmail, parentUser: parentUserId });
    if (!subUser) {
        return res.status(404).json({ message: 'Sub-user not found or not authorized' });
    }

    subUser.isActive = !subUser.isActive;
    await subUser.save();
    res.status(200).json({ message: 'Sub-user status updated successfully' });
    } catch (error) {
    res.status(500).json({ message: 'Server error', error });
    }
};

const bcrypt = require('bcryptjs');
const { User } = require('./models');

/**
 * Register a new user with email/phone and password
 */
async function registerUser(email, phone, password) {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                ...(phone ? [{ phone }] : [])
            ]
        });

        if (existingUser) {
            throw new Error('User with this email or phone already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            email: email.toLowerCase(),
            phone: phone || undefined,
            password: hashedPassword,
            displayName: email.split('@')[0],
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=9333ea&color=fff`,
            isAdmin: email.toLowerCase() === 'signgalaxy31@gmail.com' || email.toLowerCase() === 'viswakumar2004@gmail.com',
            wishlist: [],
            cart: []
        });

        await user.save();

        // Return user without password
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
    } catch (error) {
        throw error;
    }
}

/**
 * Login user with email/phone and password
 */
async function loginUser(identifier, password) {
    try {
        // Find user by email or phone
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { phone: identifier }
            ]
        }).select('+password');

        if (!user) {
            throw new Error('Invalid email/phone or password');
        }

        if (!user.password) {
            throw new Error('This account was created using Google. Please continue with Google login.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid email/phone or password');
        }

        // Return user without password
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
    } catch (error) {
        throw error;
    }
}

/**
 * Change user password
 */
async function changePassword(userId, oldPassword, newPassword) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        if (user.password) {
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return { success: true };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    registerUser,
    loginUser,
    changePassword
};

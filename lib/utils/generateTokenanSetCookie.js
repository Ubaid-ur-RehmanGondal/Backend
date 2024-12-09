import jwt from 'jsonwebtoken';

export const generateTokenanSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '50d' });
    res.cookie('jwt', token, {
        maxAge: 50 * 24 * 60 * 60 * 1000,
        httpOnly: true, // XSS ataacks
        sameSite: "Strict", // CSRF attacks
        secure: process.env.NODE_ENV !== 'development' // HTTPS only in production

    })
};
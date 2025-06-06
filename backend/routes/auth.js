const express = require('express');
const { google } = require('googleapis');
const { getOAuth2Client } = require('../utils/googleClient');
const router = express.Router();

router.get('/google', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
    ];
    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
    res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
    const oauth2Client = getOAuth2Client();
    try {
        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        req.session.tokens = tokens;
        req.session.user = {
            name: userInfo.data.name,
            email: userInfo.data.email,
            picture: userInfo.data.picture
        };
        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error('OAuth2 Callback Error:', error);
        res.status(500).send('Authentication failed: ' + error.message);
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out' });
    });
});

module.exports = router;

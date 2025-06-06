const express = require('express');
const { google } = require('googleapis');
const { getAuthenticatedClient } = require('../utils/googleClient');
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (req.session.tokens && req.session.user) return next();
    res.status(401).json({ error: 'Not authenticated' });
}

// Get headers
router.get('/headers', isAuthenticated, async (req, res) => {
    try {
        const client = getAuthenticatedClient(req.session);
        const { sheetUrl } = req.query;
        const spreadsheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];
        const sheets = google.sheets({ version: 'v4', auth: client });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'A1:Z1'
        });
        res.json(response.data.values ? response.data.values[0] : []);
    } catch (error) {
        console.error('Sheets Headers Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get data
router.get('/data', isAuthenticated, async (req, res) => {
    try {
        const client = getAuthenticatedClient(req.session);
        const { sheetUrl, range } = req.query;
        const spreadsheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];
        const sheets = google.sheets({ version: 'v4', auth: client });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: range || 'A1:Z1000'
        });
        res.json(response.data.values || []);
    } catch (error) {
        console.error('Sheets Data Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

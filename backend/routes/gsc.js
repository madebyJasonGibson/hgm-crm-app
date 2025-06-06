const express = require('express');
const { google } = require('googleapis');
const { getAuthenticatedClient } = require('../utils/googleClient');
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (req.session.tokens && req.session.user) return next();
    res.status(401).json({ error: 'Not authenticated' });
}

// List GSC properties
router.get('/properties', isAuthenticated, async (req, res) => {
    try {
        const client = getAuthenticatedClient(req.session);
        const searchconsole = google.searchconsole({ version: 'v1', auth: client });
        const response = await searchconsole.sites.list();
        res.json(response.data.siteEntry || []);
    } catch (error) {
        console.error('GSC Properties Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Query GSC data
router.post('/data', isAuthenticated, async (req, res) => {
    try {
        const client = getAuthenticatedClient(req.session);
        const { siteUrl, startDate, endDate, dimensions, searchType } = req.body;
        const searchconsole = google.searchconsole({ version: 'v1', auth: client });
        const result = await searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: dimensions || ['date'],
                searchType: searchType || 'web'
            }
        });
        res.json(result.data.rows || []);
    } catch (error) {
        console.error('GSC Data Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

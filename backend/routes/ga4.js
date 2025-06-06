const express = require('express');
const { google } = require('googleapis');
const { getAuthenticatedClient } = require('../utils/googleClient');
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (req.session.tokens && req.session.user) return next();
    res.status(401).json({ error: 'Not authenticated' });
}

// List GA4 Accounts
router.get('/accounts', isAuthenticated, async (req, res) => {
    try {
        const client = getAuthenticatedClient(req.session);
        const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth: client });
        const response = await analyticsAdmin.accountSummaries.list();
        res.json(response.data.accountSummaries || []);
    } catch (error) {
        console.error('GA4 Accounts Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GA4 Data Report
router.post('/data', isAuthenticated, async (req, res) => {
    try {
        const client = getAuthenticatedClient(req.session);
        const { propertyId, startDate, endDate, dimensions, metrics } = req.body;
        const analyticsData = google.analyticsdata({ version: 'v1beta', auth: client });
        const result = await analyticsData.properties.runReport({
            property: propertyId,
            requestBody: {
                dateRanges: [{ startDate, endDate }],
                dimensions: dimensions.map(d => typeof d === 'string' ? { name: d } : d),
                metrics: metrics.map(m => typeof m === 'string' ? { name: m } : m),
            }
        });
        res.json(result.data);
    } catch (error) {
        console.error('GA4 Data Error:', error);
        res.status(500).json({ error: error.message, apiError: error.response?.data?.error });
    }
});

module.exports = router;

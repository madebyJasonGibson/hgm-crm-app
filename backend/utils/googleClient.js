const { google } = require('googleapis');

function getOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

function getAuthenticatedClient(session) {
    if (!session.tokens) return null;
    const client = getOAuth2Client();
    client.setCredentials(session.tokens);
    return client;
}

module.exports = { getOAuth2Client, getAuthenticatedClient };

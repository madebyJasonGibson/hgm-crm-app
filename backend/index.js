require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const gscRoutes = require('./routes/gsc');
const ga4Routes = require('./routes/ga4');
const sheetsRoutes = require('./routes/sheets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Mount modular routes
app.use('/auth', authRoutes);
app.use('/api/gsc', gscRoutes);
app.use('/api/ga4', ga4Routes);
app.use('/api/sheets', sheetsRoutes);

app.get('/api/user', (req, res) => {
    if (req.session.user) res.json({ user: req.session.user });
    else res.status(401).json({ error: 'Not authenticated' });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log('Frontend expected at: ' + process.env.FRONTEND_URL);
});

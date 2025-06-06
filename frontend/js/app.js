const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const mainLayout = document.getElementById('main-layout');
    const dashboardView = document.getElementById('dashboard-view');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Navigation
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.view').forEach(view => view.style.display = 'none');
            document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active-nav'));
            link.classList.add('active-nav');
            const targetView = document.getElementById(link.dataset.view + '-view');
            if (targetView) targetView.style.display = 'block';
        });
    });

    // Helper functions
    async function apiFetch(endpoint, options = {}) {
        const opts = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            ...options
        };
        if (opts.body && typeof opts.body !== 'string') {
            opts.body = JSON.stringify(opts.body);
        }
        const res = await fetch(`${API_BASE_URL}${endpoint}`, opts);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'API Error');
        }
        return res.status === 204 ? null : await res.json();
    }

    function showLoading(show) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    async function checkLoginStatus() {
        showLoading(true);
        try {
            const data = await apiFetch('/api/user');
            userName.textContent = data.user.name;
            userInfo.style.display = '';
            loginBtn.style.display = 'none';
            mainLayout.style.display = '';
        } catch {
            userInfo.style.display = 'none';
            loginBtn.style.display = '';
            mainLayout.style.display = 'none';
        } finally {
            showLoading(false);
        }
    }

    loginBtn.addEventListener('click', () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    });
    logoutBtn.addEventListener('click', async () => {
        showLoading(true);
        await apiFetch('/auth/logout', { method: 'POST' });
        await checkLoginStatus();
        showLoading(false);
    });

    // --- Dashboard Demo (extend as needed) ---
    async function loadDashboard() {
        // Example fetch and update DOM here...
    }
    document.getElementById('apply-filters-btn').addEventListener('click', loadDashboard);

    checkLoginStatus();
    loadDashboard();
});

const loginForm = document.getElementById('login-form');
const logoutSection = document.getElementById('logout-section');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const statusDiv = document.getElementById('status');
const loggedInUserSpan = document.getElementById('logged-in-user');

const backendUrl = 'http://127.0.0.1:8000';

function showLoginUI() {
    loginForm.style.display = 'block';
    logoutSection.style.display = 'none';
    statusDiv.textContent = '';
    loginButton.disabled = false;
    loginButton.textContent = 'Login';
}

function showLogoutUI(username) {
    loginForm.style.display = 'none';
    logoutSection.style.display = 'block';
    loggedInUserSpan.textContent = username;
    statusDiv.textContent = '';
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const tokenData = await chrome.storage.local.get(['learnhub_token', 'learnhub_username']);
        if (tokenData.learnhub_token && tokenData.learnhub_username) {
            showLogoutUI(tokenData.learnhub_username);
        } else {
            showLoginUI();
        }
    } catch (error) {
        console.error("Error checking login status:", error);
        showLoginUI();
        statusDiv.textContent = 'Error checking status.';
        statusDiv.style.color = 'red';
    }
});


loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    statusDiv.textContent = '';
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        statusDiv.textContent = 'Please enter username and password.';
        statusDiv.style.color = 'red';
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                'username': username,
                'password': password
            })
        });

        if (!response.ok) {
            let errorMsg = `Login failed: ${response.status}`;
             try {
                 const errorData = await response.json();
                 errorMsg += ` - ${errorData.detail || 'Incorrect credentials'}`;
             } catch (e) {}
            throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data.access_token) {
            await chrome.storage.local.set({
                'learnhub_token': data.access_token,
                'learnhub_username': username
            });
            console.log('Token saved successfully for user:', username);
            showLogoutUI(username);
            statusDiv.textContent = 'Login successful!';
            statusDiv.style.color = 'green';
        } else {
            throw new Error('Login successful, but no token received.');
        }

    } catch (error) {
        console.error('Login error:', error);
        statusDiv.textContent = error.message;
        statusDiv.style.color = 'red';
         if (loginForm.style.display !== 'none') {
             loginButton.disabled = false;
             loginButton.textContent = 'Login';
         }
    }
});

logoutButton.addEventListener('click', async () => {
     try {
        await chrome.storage.local.remove(['learnhub_token', 'learnhub_username']);
        console.log('User logged out.');
        showLoginUI();
        statusDiv.textContent = 'Logged out.';
        statusDiv.style.color = 'green';
    } catch (error) {
         console.error('Logout error:', error);
         statusDiv.textContent = 'Error logging out.';
         statusDiv.style.color = 'red';
     }
});
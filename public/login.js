const config = window.AUTH_CONFIG;
const form = document.getElementById('auth-form'), button = document.getElementById('submit'), error = document.getElementById('error');
if (config.setup) {
  document.getElementById('title').textContent = 'Set up your workspace';
  document.getElementById('description').textContent = 'Create your administrator account to start using CommerceOS.';
  document.getElementById('name-row').hidden = false;
  document.getElementById('name').required = true;
  document.getElementById('password-hint').hidden = false;
  document.getElementById('password').autocomplete = 'new-password';
  button.textContent = 'Create workspace →';
}
document.getElementById('show-password').addEventListener('click', function () {
  const input = document.getElementById('password'), show = input.type === 'password';
  input.type = show ? 'text' : 'password'; this.textContent = show ? 'Hide' : 'Show'; this.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});
if (config.logout) {
  button.disabled = true;
  fetch('/api/logout', { method: 'POST', headers: { 'X-CSRF-Token': config.csrf, 'Content-Type': 'application/json' }, body: '{}' })
    .then(response => { if (!response.ok) throw new Error('Could not sign out. Try again.'); window.location.replace('/login'); })
    .catch(e => { error.textContent = e.message; error.hidden = false; button.disabled = false; });
}
form.addEventListener('submit', async event => {
  event.preventDefault(); error.hidden = true; button.disabled = true;
  try {
    const response = await fetch(config.setup ? '/api/setup' : '/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.elements.name.value, email: form.elements.email.value, password: form.elements.password.value })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not sign in.');
    // Preferences and profile caches belong to a single account.
    for (const key of ['commerceos.prefs', 'commerceos.profile']) window.localStorage.removeItem(key);
    window.location.replace(result.start || '/dashboard-preview/Main.dc.html');
  } catch (e) { error.textContent = e.message; error.hidden = false; button.disabled = false; }
});

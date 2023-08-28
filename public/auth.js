document.getElementById('signup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then((res) => res.text())
    .then((message) => {
      alert(message);
      if (message === 'User created successfully') {
        window.location.href = '/login.html'; // Redirect on successful signup
      }
    })
    .catch((error) => alert(error));
});

document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // const formData = new URLSearchParams();
    // formData.append('username', username);
    // formData.append('password', password);
  
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${username}&password=${password}`,
      credentials: 'same-origin' // Include credentials with the request
    })
      .then((res) => {
        if (res.status === 200) {
          window.location.href = '/';
        } else {
          alert('Login failed. Please check your username and password.');
        }
      })
      .catch((error) => alert(error));
});  

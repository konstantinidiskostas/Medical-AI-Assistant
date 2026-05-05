import { useState } from 'react';

function App() {
  // Track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Track inputs for login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle the form submit
  const handleLogin = async (e: React.FormEvent) => {
    // Stop the page from reloading when the form is submitted
    e.preventDefault();

    try {
      // Send the credentials to the Spring Boot backend
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST', // Use POST because we are sending data
        headers: {
          'Content-Type': 'application/json', // Tell the server to expect JSON format
        },
        // Turn the username/password objects into a JSON string
        body: JSON.stringify({ username, password }),
      });

      // If the server returns a 200 OK status, we're in
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      // Handle network errors, like if the server is offline
      console.error('Login error:', error);
      alert('Server is unreachable');
    }
  };

  // If user is not logged in, show Login Screen
  if (!isLoggedIn) {
    return (
        <div>
          <h1>Login to Medical AI</h1>
          <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
    );
  }

  // If user IS logged in, show the App
  return (
      <div>
        <h1>Medical AI Assistant 🩺</h1>
        <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        <p>System ready.</p>
      </div>
  );
}

export default App;
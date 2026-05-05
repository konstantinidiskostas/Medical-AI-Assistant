import { useState } from 'react';

function App() {
  // Toggle state to switch between login view and registration view
  const [isRegistering, setIsRegistering] = useState(false);

  // Auth state to keep track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State variables for form input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Handle existing user login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send login credentials to the Spring Boot backend
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Successful login
        setIsLoggedIn(true);
      } else {
        // Handle invalid credentials
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Server is unreachable');
    }
  };

  // Handle new user registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send registration data to the Spring Boot backend
      // Hardcoding role to 'doctor' as per requirements
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          fullName,
          role: 'doctor'
        }),
      });

      if (response.ok) {
        // Registration success, reset to login view
        alert('Registration successful! Please log in.');
        setIsRegistering(false);
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Server is unreachable');
    }
  };

  // Conditional Rendering: If not logged in, show Auth screen
  if (!isLoggedIn) {
    return (
        <div>
          <h1>{isRegistering ? 'Register' : 'Login'}</h1>

          {/* Dynamic form submission handler based on current mode */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
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

            {/* Display Full Name field only when registering */}
            {isRegistering && (
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            )}

            <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
          </form>

          {/* Button to toggle between login and register views */}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
    );
  }

  // Dashboard view for authenticated users
  return (
      <div>
        <h1>Medical AI Assistant 🩺</h1>
        <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        <p>System ready.</p>
      </div>
  );
}

export default App;
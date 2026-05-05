import { useState } from 'react';

function App() {
  // Toggle state to switch between login view and registration view
  const [isRegistering, setIsRegistering] = useState(false);
  // Auth state to keep track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to manage the user's current view after logging in (dashboard, patients, chat)
  const [currentView, setCurrentView] = useState('dashboard');

  // State variables for form input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Handle existing user login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsLoggedIn(true);
      } else {
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
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          fullName,
          role: 'doctor' // Hardcoded as per requirements
        }),
      });

      if (response.ok) {
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

  // 1. AUTHENTICATION SCREEN (Login or Register)
  if (!isLoggedIn) {
    return (
        <div>
          <h1>{isRegistering ? 'Register' : 'Login'}</h1>

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

          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
    );
  }

  // 2. DASHBOARD / MENU SCREEN (Only accessible if logged in)
  return (
      <div>
        <h1>Medical AI Assistant 🩺</h1>

        {/* Dashboard Main Menu */}
        {currentView === 'dashboard' && (
            <div>
              <button onClick={() => setCurrentView('patients')}>View Patients</button>
              <button onClick={() => setCurrentView('chat')}>General AI Query</button>
              <br /><br />
              <button onClick={() => setIsLoggedIn(false)}>Logout</button>
            </div>
        )}

        {/* Patient Management View */}
        {currentView === 'patients' && (
            <div>
              <h2>Patient List</h2>
              <p>Displaying list of patients...</p>
              <button onClick={() => setCurrentView('dashboard')}>Back to Dashboard</button>
            </div>
        )}

        {/* General AI Chat View */}
        {currentView === 'chat' && (
            <div>
              <h2>General Medical AI Query</h2>
              <p>Chat interface will go here...</p>
              <button onClick={() => setCurrentView('dashboard')}>Back to Dashboard</button>
            </div>
        )}
      </div>
  );
}

export default App;
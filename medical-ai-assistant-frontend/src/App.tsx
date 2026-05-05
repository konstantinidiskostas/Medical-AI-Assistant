import { useState } from 'react';

function App() {
  // Toggle state to switch between login view and registration view
  const [isRegistering, setIsRegistering] = useState(false);
  // Auth state to keep track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to manage the user's current view after logging in (dashboard, patients, chat)
  const [currentView, setCurrentView] = useState('dashboard');
  // State to store the logged-in doctor's ID for linking records
  const [doctorId, setDoctorId] = useState<number | null>(null);

  // Auth form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Patient form states
  const [patientName, setPatientName] = useState('');
  const [patientAmka, setPatientAmka] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientTelephone, setPatientTelephone] = useState('');

  // Handle Login logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Read response text first to ensure safety
        const text = await response.text();
        try {
          // Parse JSON if possible
          const data = JSON.parse(text);
          setDoctorId(data.id || null);
        } catch (e) {
          console.log("No JSON returned, assuming success.");
        }
        setIsLoggedIn(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      alert('Could not connect to the server. Make sure Spring Boot is running.');
    }
  };

  // Handle Registration logic
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName, role: 'doctor' }),
      });

      if (response.ok) {
        alert('Registration successful!');
        setIsRegistering(false);
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      alert('Could not connect to the server.');
    }
  };

  // Handle saving a new patient
  const handleAddPatient = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: patientName,
          amka: patientAmka,
          age: parseInt(patientAge) || 0,
          gender: patientGender,
          telephone: patientTelephone,
          doctorId: doctorId // Link the patient to the current logged-in doctor
        }),
      });

      if (response.ok) {
        alert('Patient saved successfully!');
        // Reset form fields
        setPatientName(''); setPatientAmka(''); setPatientAge('');
        setPatientGender(''); setPatientTelephone('');
      } else {
        alert('Failed to save patient. Check server logs.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving patient.');
    }
  };

  // Render Authentication View if user is not logged in
  if (!isLoggedIn) {
    return (
        <div>
          <h1>{isRegistering ? 'Register' : 'Login'}</h1>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {isRegistering && <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />}
            <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
          </form>
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Back to Login' : 'Need an account? Register'}
          </button>
        </div>
    );
  }

  // Render Dashboard / Menu View for authenticated users
  return (
      <div>
        <h1>Medical AI Assistant</h1>

        {/* Main Dashboard Menu */}
        {currentView === 'dashboard' && (
            <div>
              <button onClick={() => setCurrentView('patients')}>Add/View Patients</button>
              <button onClick={() => setCurrentView('chat')}>General AI Query</button>
              <button onClick={() => setIsLoggedIn(false)}>Logout</button>
            </div>
        )}

        {/* Patient Management View */}
        {currentView === 'patients' && (
            <div>
              <h2>Add New Patient</h2>
              <input placeholder="Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
              <input placeholder="AMKA" value={patientAmka} onChange={(e) => setPatientAmka(e.target.value)} />
              <input placeholder="Age" type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
              <input placeholder="Gender" value={patientGender} onChange={(e) => setPatientGender(e.target.value)} />
              <input placeholder="Telephone" value={patientTelephone} onChange={(e) => setPatientTelephone(e.target.value)} />
              <button onClick={handleAddPatient}>Save Patient</button>
              <button onClick={() => setCurrentView('dashboard')}>Back</button>
            </div>
        )}
      </div>
  );
}

export default App;
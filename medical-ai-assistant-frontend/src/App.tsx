import { useState, useEffect } from 'react';

function App() {
  // --- Authentication States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Ελέγχει αν βλέπουμε Login ή Register

  // --- Navigation State ---
  const [currentView, setCurrentView] = useState('dashboard');

  // --- Application Data States ---
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [medicalCases, setMedicalCases] = useState<any[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [pendingDiagnosis, setPendingDiagnosis] = useState<string | null>(null);

  // --- Login Form States ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- Register Form States (NEW) ---
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- Patient Form States ---
  const [patientName, setPatientName] = useState('');
  const [patientAmka, setPatientAmka] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientTelephone, setPatientTelephone] = useState('');

  // --- Fetching Functions ---

  const fetchPatients = async () => {
    if (doctorId) {
      try {
        const response = await fetch(`http://localhost:8080/api/patients/doctor/${doctorId}`);
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    }
  };

  const fetchMedicalCases = async (patientId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-cases/patient/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setMedicalCases(data);
      }
    } catch (error) {
      console.error("Error fetching medical cases:", error);
    }
  };

  // --- Effect Hooks ---

  useEffect(() => {
    if (currentView === 'patients') fetchPatients();
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'patient-details' && selectedPatient) {
      fetchMedicalCases(selectedPatient.patientId);
    }
  }, [currentView, selectedPatient]);

  // --- Authentication Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setDoctorId(data.id);
        setIsLoggedIn(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  /**
   * NEW: Handles Doctor Registration
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          username: regUsername,
          password: regPassword,
          role: 'Doctor' // Default role for new signups
        }),
      });

      if (response.ok) {
        alert('Registration successful! You can now log in.');
        setIsRegistering(false); // Return to login screen
        // Clear registration fields
        setRegFullName('');
        setRegUsername('');
        setRegPassword('');
      } else {
        alert('Registration failed. Username might already exist.');
      }
    } catch (error) {
      alert('Connection error during registration.');
    }
  };

  // --- Patient & AI Handlers ---

  const handleAskAI = async () => {
    if (!aiQuery) return;
    setPendingDiagnosis("Thinking...");

    try {
      const response = await fetch('http://localhost:8080/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setPendingDiagnosis(data.diagnosis);
      } else {
        setPendingDiagnosis(null);
        alert('AI Error');
      }
    } catch (error) {
      setPendingDiagnosis(null);
      alert('Service unavailable');
    }
  };

  const handleSaveCase = async () => {
    if (!selectedPatient || !aiQuery || !pendingDiagnosis) return;

    try {
      const response = await fetch('http://localhost:8080/api/medical-cases/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.patientId,
          symptoms: aiQuery,
          diagnosis: pendingDiagnosis
        }),
      });

      if (response.ok) {
        const savedCase = await response.json();
        setMedicalCases([savedCase, ...medicalCases]);
        setAiQuery('');
        setPendingDiagnosis(null);
        alert('Case saved successfully!');
      }
    } catch (error) {
      alert('Save failed');
    }
  };

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
          doctorId: doctorId
        }),
      });

      if (response.ok) {
        alert('Patient saved successfully!');
        fetchPatients();
        setPatientName(''); setPatientAmka(''); setPatientAge('');
        setPatientGender(''); setPatientTelephone('');
      } else {
        alert('Failed to save patient.');
      }
    } catch (error) {
      alert('Error saving patient.');
    }
  };

  // --- UI Render ---

  // Not Logged In View (Shows Login OR Register)
  if (!isLoggedIn) {
    if (isRegistering) {
      return (
          <div style={{ padding: '50px' }}>
            <h1>Doctor Registration</h1>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
              <input placeholder="Full Name" value={regFullName} onChange={e => setRegFullName(e.target.value)} required />
              <input placeholder="Username" value={regUsername} onChange={e => setRegUsername(e.target.value)} required />
              <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
              <button type="submit" style={{ cursor: 'pointer', background: '#28a745', color: '#fff' }}>Register</button>
              <button type="button" onClick={() => setIsRegistering(false)} style={{ cursor: 'pointer' }}>Back to Login</button>
            </form>
          </div>
      );
    }

    return (
        <div style={{ padding: '50px' }}>
          <h1>Doctor Login</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" style={{ cursor: 'pointer', background: '#007bff', color: '#fff' }}>Login</button>
            <button type="button" onClick={() => setIsRegistering(true)} style={{ cursor: 'pointer' }}>Need an account? Register</button>
          </form>
        </div>
    );
  }

  // Main Authenticated View
  return (
      <div style={{ padding: '20px' }}>
        <h1>Medical AI Assistant</h1>

        {currentView === 'dashboard' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCurrentView('patients')}>Manage Patients</button>
              <button onClick={() => { setIsLoggedIn(false); setDoctorId(null); }}>Logout</button>
            </div>
        )}

        {currentView === 'patients' && (
            <div>
              <h2>Add/View Patients</h2>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input placeholder="Full Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                <input placeholder="AMKA" value={patientAmka} onChange={(e) => setPatientAmka(e.target.value)} />
                <input type="number" placeholder="Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
                <input placeholder="Gender" value={patientGender} onChange={(e) => setPatientGender(e.target.value)} />
                <input placeholder="Telephone" value={patientTelephone} onChange={(e) => setPatientTelephone(e.target.value)} />
                <button onClick={handleAddPatient}>Save New Patient</button>
              </div>
              <hr />
              <ul>
                {patients.map(p => (
                    <li key={p.patientId} style={{ marginBottom: '10px' }}>
                      {p.fullName} (AMKA: {p.amka})
                      <button style={{ marginLeft: '10px' }} onClick={() => { setSelectedPatient(p); setCurrentView('patient-details'); }}>View Details</button>
                    </li>
                ))}
              </ul>
              <button onClick={() => setCurrentView('dashboard')}>Back to Dashboard</button>
            </div>
        )}

        {currentView === 'patient-details' && selectedPatient && (
            <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
              {/* Left: History */}
              <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px' }}>
                <h3>History for {selectedPatient.fullName}</h3>
                {medicalCases.length === 0 ? <p>No medical history found.</p> : null}
                {medicalCases.map(m => (
                    <div key={m.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                      <small>{new Date(m.date).toLocaleString()}</small>
                      <p><strong>Symptoms:</strong> {m.symptoms}</p>
                      <p><strong>Diagnosis:</strong> {m.diagnosis}</p>
                    </div>
                ))}
              </div>

              {/* Right: AI Panel */}
              <div style={{ flex: 1, backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '8px' }}>
                <h3>New AI Consultation</h3>
                <textarea
                    style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                    placeholder="Enter symptoms..."
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    disabled={pendingDiagnosis !== null && pendingDiagnosis !== "Thinking..."}
                />

                {!pendingDiagnosis && (
                    <button onClick={handleAskAI} disabled={!aiQuery} style={{ cursor: aiQuery ? 'pointer' : 'not-allowed' }}>Ask AI</button>
                )}

                {pendingDiagnosis && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#fff', border: '1px solid #007bff' }}>
                      <p><strong>AI Suggestion:</strong></p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{pendingDiagnosis}</p>

                      {pendingDiagnosis !== "Thinking..." && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button onClick={handleSaveCase} style={{ background: '#28a745', color: 'white', cursor: 'pointer', padding: '8px 12px', border: 'none', borderRadius: '4px' }}>
                              Save to History
                            </button>
                            <button onClick={() => setPendingDiagnosis(null)} style={{ background: '#dc3545', color: 'white', cursor: 'pointer', padding: '8px 12px', border: 'none', borderRadius: '4px' }}>
                              Discard
                            </button>
                          </div>
                      )}
                    </div>
                )}
              </div>
            </div>
        )}

        {currentView === 'patient-details' && (
            <button style={{ marginTop: '20px' }} onClick={() => setCurrentView('patients')}>Back to Patients</button>
        )}
      </div>
  );
}

export default App;
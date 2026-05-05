import { useState, useEffect } from 'react';

function App() {
  // --- Authentication States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // --- Navigation State ---
  const [currentView, setCurrentView] = useState('dashboard');

  // --- Application Data States ---
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [medicalCases, setMedicalCases] = useState<any[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [pendingDiagnosis, setPendingDiagnosis] = useState<string | null>(null);

  // NEW STATE: Holds the patient object currently being edited
  const [editingPatient, setEditingPatient] = useState<any>(null);

  // --- Form Input States ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- Patient Form States (Used for both Add and Edit) ---
  const [patientName, setPatientName] = useState('');
  const [patientAmka, setPatientAmka] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientTelephone, setPatientTelephone] = useState('');

  // --- API Fetching Functions ---

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

  useEffect(() => {
    if (currentView === 'patients') fetchPatients();
  }, [currentView, doctorId]);

  useEffect(() => {
    if (currentView === 'patient-details' && selectedPatient) {
      fetchMedicalCases(selectedPatient.patientId);
    }
  }, [currentView, selectedPatient]);

  // --- Auth Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json(); // Data contains {token, user}

        // 1. Save the token in the browser's local storage
        localStorage.setItem('jwtToken', data.token);

        setDoctorId(data.user.id);
        setIsLoggedIn(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: regFullName, username: regUsername, password: regPassword, role: 'Doctor' }),
      });
      if (response.ok) {
        alert('Registration successful!');
        setIsRegistering(false);
      } else {
        alert('Registration failed.');
      }
    } catch (error) {
      alert('Error during registration.');
    }
  };

  // --- Patient CRUD Handlers ---

  /**
   * Adds a new patient to the doctor's list.
   */
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
        alert('Patient added!');
        fetchPatients();
        clearPatientForm();
      }
    } catch (error) {
      alert('Error adding patient.');
    }
  };

  /**
   * NEW: Deletes a patient and refreshes the list.
   */
  const handleDeletePatient = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patient? All history will be lost.")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/patients/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Patient deleted.');
        fetchPatients();
      }
    } catch (error) {
      alert('Error deleting patient.');
    }
  };

  /**
   * NEW: Prepares the form for editing an existing patient.
   */
  const startEdit = (p: any) => {
    setEditingPatient(p);
    setPatientName(p.fullName);
    setPatientAmka(p.amka);
    setPatientAge(p.age.toString());
    setPatientGender(p.gender);
    setPatientTelephone(p.telephone);
  };

  /**
   * NEW: Sends updated patient data to the backend.
   */
  const handleUpdatePatient = async () => {
    if (!editingPatient) return;

    try {
      const response = await fetch(`http://localhost:8080/api/patients/${editingPatient.patientId}`, {
        method: 'PUT',
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
        alert('Patient updated successfully!');
        setEditingPatient(null);
        clearPatientForm();
        fetchPatients();
      }
    } catch (error) {
      alert('Error updating patient.');
    }
  };

  const clearPatientForm = () => {
    setPatientName(''); setPatientAmka(''); setPatientAge('');
    setPatientGender(''); setPatientTelephone('');
  };

  // --- AI Handlers ---

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
      }
    } catch (error) {
      setPendingDiagnosis(null);
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
        alert('Case saved!');
      }
    } catch (error) {
      alert('Save failed');
    }
  };

  // --- UI Render ---

  if (!isLoggedIn) {
    // ... Login/Register UI remains same ...
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
          <h1>Medical AI Assistant Login</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" style={{ cursor: 'pointer', background: '#007bff', color: '#fff' }}>Login</button>
            <button type="button" onClick={() => setIsRegistering(true)} style={{ cursor: 'pointer' }}>Need an account? Register</button>
          </form>
        </div>
    );
  }

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
              <h2>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h2>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input placeholder="Full Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                <input placeholder="AMKA" value={patientAmka} onChange={(e) => setPatientAmka(e.target.value)} />
                <input type="number" placeholder="Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
                <input placeholder="Gender" value={patientGender} onChange={(e) => setPatientGender(e.target.value)} />
                <input placeholder="Telephone" value={patientTelephone} onChange={(e) => setPatientTelephone(e.target.value)} />

                {editingPatient ? (
                    <>
                      <button onClick={handleUpdatePatient} style={{ background: '#ffc107' }}>Update Patient</button>
                      <button onClick={() => { setEditingPatient(null); clearPatientForm(); }}>Cancel</button>
                    </>
                ) : (
                    <button onClick={handleAddPatient} style={{ background: '#28a745', color: 'white' }}>Save New Patient</button>
                )}
              </div>
              <hr />
              <h3>My Patients</h3>
              <ul>
                {patients.map(p => (
                    <li key={p.patientId} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                      <strong>{p.fullName}</strong> (AMKA: {p.amka})
                      <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                        <button onClick={() => { setSelectedPatient(p); setCurrentView('patient-details'); }}>View History & AI</button>
                        <button onClick={() => startEdit(p)} style={{ background: '#ffc107' }}>Edit</button>
                        <button onClick={() => handleDeletePatient(p.patientId)} style={{ background: '#dc3545', color: 'white' }}>Delete</button>
                      </div>
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
                {medicalCases.length === 0 ? <p>No history found.</p> : null}
                {medicalCases.map(m => (
                    <div key={m.id} style={{ borderBottom: '1px solid #ddd', marginBottom: '10px' }}>
                      <small>{new Date(m.date).toLocaleString()}</small>
                      <p><strong>Diagnosis:</strong> {m.diagnosis}</p>
                    </div>
                ))}
              </div>

              {/* Right: AI Panel */}
              <div style={{ flex: 1, backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '8px' }}>
                <h3>Consult AI</h3>
                <textarea
                    style={{ width: '100%', height: '100px' }}
                    placeholder="Enter symptoms..."
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    disabled={pendingDiagnosis !== null && pendingDiagnosis !== "Thinking..."}
                />
                {!pendingDiagnosis && <button onClick={handleAskAI} disabled={!aiQuery}>Ask AI</button>}
                {pendingDiagnosis && (
                    <div style={{ marginTop: '10px', background: 'white', padding: '10px', border: '1px solid #007bff' }}>
                      <p>{pendingDiagnosis}</p>
                      {pendingDiagnosis !== "Thinking..." && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSaveCase} style={{ background: 'green', color: 'white' }}>Save</button>
                            <button onClick={() => setPendingDiagnosis(null)} style={{ background: 'red', color: 'white' }}>Discard</button>
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
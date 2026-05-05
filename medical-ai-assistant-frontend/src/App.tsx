import { useState, useEffect } from 'react';

function App() {
  // --- States με Persistence (θυμούνται τι είχες πριν το refresh) ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jwtToken'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('app_view') || 'dashboard');

  const [doctorId, setDoctorId] = useState<number | null>(() => {
    const saved = localStorage.getItem('doctorId');
    return saved ? parseInt(saved) : null;
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(() => {
    const saved = localStorage.getItem('selected_patient');
    return saved ? JSON.parse(saved) : null;
  });

  const [medicalCases, setMedicalCases] = useState<any[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [pendingDiagnosis, setPendingDiagnosis] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAmka, setPatientAmka] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientTelephone, setPatientTelephone] = useState('');

  // --- Sync με LocalStorage ---
  useEffect(() => { localStorage.setItem('app_view', currentView); }, [currentView]);
  useEffect(() => {
    if (selectedPatient) localStorage.setItem('selected_patient', JSON.stringify(selectedPatient));
    else localStorage.removeItem('selected_patient');
  }, [selectedPatient]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const fetchPatients = async () => {
    if (doctorId) {
      try {
        const response = await fetch(`http://localhost:8080/api/patients/doctor/${doctorId}`, { headers: getAuthHeaders() });
        if (response.ok) setPatients(await response.json());
      } catch (error) { console.error("Error:", error); }
    }
  };

  const fetchMedicalCases = async (patientId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-cases/patient/${patientId}`, { headers: getAuthHeaders() });
      if (response.ok) setMedicalCases(await response.json());
    } catch (error) { console.error("Error:", error); }
  };

  useEffect(() => { if (currentView === 'patients') fetchPatients(); }, [currentView, doctorId]);
  useEffect(() => { if (currentView === 'patient-details' && selectedPatient) fetchMedicalCases(selectedPatient.patientId); }, [currentView, selectedPatient]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('doctorId', data.user.id);
        setDoctorId(data.user.id);
        setIsLoggedIn(true);
      } else alert('Invalid credentials');
    } catch (error) { alert('Connection error'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: regFullName, username: regUsername, password: regPassword, role: 'Doctor' }),
      });
      if (response.ok) { alert('Επιτυχής εγγραφή!'); setIsRegistering(false); }
      else alert('Η εγγραφή απέτυχε.');
    } catch (error) { alert('Σφάλμα.'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setDoctorId(null);
    setCurrentView('dashboard');
    setSelectedPatient(null);
  };

  const handleAddPatient = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/patients', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ fullName: patientName, amka: patientAmka, age: parseInt(patientAge) || 0, gender: patientGender, telephone: patientTelephone, doctorId: doctorId }),
      });
      if (response.ok) { alert('Ο ασθενής προστέθηκε!'); fetchPatients(); clearPatientForm(); }
    } catch (error) { alert('Σφάλμα.'); }
  };

  const handleDeletePatient = async (id: number) => {
    if (!window.confirm("Είστε σίγουροι;")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/patients/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) fetchPatients();
    } catch (error) { alert('Σφάλμα.'); }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;
    try {
      const response = await fetch(`http://localhost:8080/api/patients/${editingPatient.patientId}`, {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({ fullName: patientName, amka: patientAmka, age: parseInt(patientAge) || 0, gender: patientGender, telephone: patientTelephone, doctorId: doctorId }),
      });
      if (response.ok) { alert('Ενημερώθηκε!'); setEditingPatient(null); clearPatientForm(); fetchPatients(); }
    } catch (error) { alert('Σφάλμα.'); }
  };

  const startEdit = (p: any) => { setEditingPatient(p); setPatientName(p.fullName); setPatientAmka(p.amka); setPatientAge(p.age.toString()); setPatientGender(p.gender); setPatientTelephone(p.telephone); };
  const clearPatientForm = () => { setPatientName(''); setPatientAmka(''); setPatientAge(''); setPatientGender(''); setPatientTelephone(''); };

  const handleAskAI = async () => {
    if (!aiQuery) return;
    setPendingDiagnosis("Σκέφτομαι...");
    try {
      const response = await fetch('http://localhost:8080/api/ai/query', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ query: aiQuery }),
      });
      if (response.ok) { const data = await response.json(); setPendingDiagnosis(data.diagnosis); }
    } catch (error) { setPendingDiagnosis(null); }
  };

  const handleSaveCase = async () => {
    if (!selectedPatient || !aiQuery || !pendingDiagnosis) return;
    try {
      const response = await fetch('http://localhost:8080/api/medical-cases/save', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ patientId: selectedPatient.patientId, symptoms: aiQuery, diagnosis: pendingDiagnosis }),
      });
      if (response.ok) { const savedCase = await response.json(); setMedicalCases([savedCase, ...medicalCases]); setAiQuery(''); setPendingDiagnosis(null); alert('Αποθηκεύτηκε!'); }
    } catch (error) { alert('Αποτυχία αποθήκευσης'); }
  };

  if (!isLoggedIn) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] p-4 font-sans">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 flex flex-col items-center">
            <div className="text-6xl mb-6">🩺</div>
            <h1 className="text-4xl font-extrabold text-blue-600 mb-2">{isRegistering ? 'Εγγραφή' : 'Είσοδος'}</h1>
            <p className="text-slate-500 mb-10 text-center">{isRegistering ? 'Δημιουργία νέου λογαριασμού' : 'Καλώς ορίσατε στον Ιατρικό Βοηθό'}</p>
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="flex flex-col gap-6 w-full">
              {isRegistering && (<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Ονοματεπώνυμο</label><input className="w-full p-3.5 border border-slate-200 rounded-xl outline-none" placeholder="Όνομα" onChange={e => setRegFullName(e.target.value)} required /></div>)}
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label><input className="w-full p-3.5 border border-slate-200 rounded-xl outline-none" placeholder="Username" onChange={e => isRegistering ? setRegUsername(e.target.value) : setUsername(e.target.value)} required /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Κωδικός</label><input type="password" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none" placeholder="********" onChange={e => isRegistering ? setRegPassword(e.target.value) : setPassword(e.target.value)} required /></div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition shadow-md">{isRegistering ? 'Εγγραφή' : 'Σύνδεση'}</button>
            </form>
            <div className="w-full mt-6 text-center text-slate-500"><p>{isRegistering ? 'Έχετε ήδη λογαριασμό;' : 'Δεν έχετε λογαριασμό;'} <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-semibold hover:underline">{isRegistering ? 'Είσοδος' : 'Εγγραφή'}</button></p></div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800 font-sans">Medical AI Assistant</h1>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-semibold hover:bg-red-100 transition">Logout</button>
        </header>

        {currentView === 'dashboard' && (
            <div className="flex gap-4"><button onClick={() => setCurrentView('patients')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">Διαχείριση Ασθενών</button></div>
        )}

        {currentView === 'patients' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-semibold mb-6">{editingPatient ? 'Επεξεργασία Ασθενή' : 'Προσθήκη Ασθενή'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input className="p-3 border rounded-xl" placeholder="Full Name" value={patientName} onChange={e => setPatientName(e.target.value)} />
                  <input className="p-3 border rounded-xl" placeholder="AMKA" value={patientAmka} onChange={e => setPatientAmka(e.target.value)} />
                  <input className="p-3 border rounded-xl" placeholder="Age" value={patientAge} onChange={e => setPatientAge(e.target.value)} />
                  <input className="p-3 border rounded-xl" placeholder="Gender" value={patientGender} onChange={e => setPatientGender(e.target.value)} />
                  <input className="p-3 border rounded-xl" placeholder="Telephone" value={patientTelephone} onChange={e => setPatientTelephone(e.target.value)} />
                </div>
                <button onClick={editingPatient ? handleUpdatePatient : handleAddPatient} className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700">{editingPatient ? 'Ενημέρωση' : 'Αποθήκευση'}</button>
              </div>
              <ul className="grid gap-4">
                {patients.map(p => (
                    <li key={p.patientId} className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center transition hover:shadow-md">
                      <span className="font-medium text-lg">{p.fullName} <span className="text-slate-400">({p.amka})</span></span>
                      <div className="flex gap-3">
                        <button onClick={() => { setSelectedPatient(p); setCurrentView('patient-details'); }} className="text-blue-600 font-medium hover:underline transition">Ιστορικό</button>
                        <button onClick={() => startEdit(p)} className="text-yellow-600 font-medium hover:underline transition">Επεξεργασία</button>
                        <button onClick={() => handleDeletePatient(p.patientId)} className="text-red-500 font-medium hover:underline transition">Διαγραφή</button>
                      </div>
                    </li>
                ))}
              </ul>
              <button onClick={() => setCurrentView('dashboard')} className="text-slate-500 hover:text-slate-800 transition">← Πίσω στο Dashboard</button>
            </div>
        )}

        {currentView === 'patient-details' && selectedPatient && (
            <div className="grid md:grid-cols-2 gap-8 font-sans">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6">Ιστορικό: {selectedPatient.fullName}</h3>
                {medicalCases.map(m => <div key={m.id} className="border-b py-4 last:border-0"><p className="text-sm text-slate-400">{new Date(m.date).toLocaleString()}</p><p className="font-medium mt-1">{m.diagnosis}</p></div>)}
                <button onClick={() => setCurrentView('patients')} className="mt-8 text-slate-500 hover:text-slate-800 transition">← Πίσω στη λίστα</button>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6">Διάγνωση AI</h3>
                <textarea className="w-full p-4 border rounded-2xl h-40 focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Περιγράψτε συμπτώματα..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} />
                <button onClick={handleAskAI} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Ανάλυση</button>
                {pendingDiagnosis && <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-blue-900">{pendingDiagnosis}</p><button onClick={handleSaveCase} className="block mt-4 font-bold text-green-700 hover:text-green-800 transition">Αποθήκευση</button></div>}
              </div>
            </div>
        )}
      </div>
  );
}

export default App;
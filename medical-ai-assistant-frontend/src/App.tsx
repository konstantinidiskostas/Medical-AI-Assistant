import { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jwtToken'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('app_view') || 'dashboard');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || '');

  const [doctorId, setDoctorId] = useState<number | null>(() => {
    const saved = localStorage.getItem('doctorId');
    return saved ? parseInt(saved) : null;
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [allPendingUsers, setAllPendingUsers] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(() => {
    const saved = localStorage.getItem('selected_patient');
    return saved ? JSON.parse(saved) : null;
  });

  const [medicalCases, setMedicalCases] = useState<any[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [pendingDiagnosis, setPendingDiagnosis] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  // Auth Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('');

  // Patient Inputs
  const [pFirstName, setPFirstName] = useState('');
  const [pLastName, setPLastName] = useState('');
  const [patientAmka, setPatientAmka] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientTelephone, setPatientTelephone] = useState('');

  // --- Helpers ---
  useEffect(() => { localStorage.setItem('app_view', currentView); }, [currentView]);
  useEffect(() => {
    if (selectedPatient) localStorage.setItem('selected_patient', JSON.stringify(selectedPatient));
    else localStorage.removeItem('selected_patient');
  }, [selectedPatient]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  // --- API Calls ---
  const fetchPatients = async () => {
    if (doctorId) {
      try {
        const response = await fetch(`http://localhost:8080/api/patients/doctor/${doctorId}`, { headers: getAuthHeaders() });
        if (response.ok) setPatients(await response.json());
      } catch (error) { console.error("Error:", error); }
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/pending', { headers: getAuthHeaders() });
      if (response.ok) setAllPendingUsers(await response.json());
    } catch (error) { console.error("Error fetching pending:", error); }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/approve/${userId}`, { method: 'PUT', headers: getAuthHeaders() });
      if (response.ok) fetchPendingUsers();
    } catch (error) { alert('Σφάλμα έγκρισης'); }
  };

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
        localStorage.setItem('userRole', data.user.role);
        setUserRole(data.user.role);
        setDoctorId(data.user.id);
        setIsLoggedIn(true);

        if (data.user.role.toLowerCase() === 'admin') {
          setCurrentView('admin-dashboard');
          localStorage.setItem('app_view', 'admin-dashboard');
        } else {
          setCurrentView('dashboard');
          localStorage.setItem('app_view', 'dashboard');
        }
      } else alert('Λάθος στοιχεία σύνδεσης');
    } catch (error) { alert('Σφάλμα σύνδεσης'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regRole) { alert('Παρακαλώ επιλέξτε ιδιότητα.'); return; }
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: regFirstName, lastName: regLastName, email: regEmail, username: regUsername, password: regPassword, role: regRole }),
      });
      if (response.ok) { alert('Επιτυχής εγγραφή!'); setIsRegistering(false); }
      else alert('Η εγγραφή απέτυχε.');
    } catch (error) { alert('Σφάλμα δικτύου.'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('');
    setDoctorId(null);
    setCurrentView('dashboard');
    setSelectedPatient(null);
  };

  const handleAddPatient = async () => {
    if (!pFirstName || !pLastName || !patientAmka || !patientAge || !patientGender || !patientTelephone) { alert("Συμπληρώστε όλα τα πεδία."); return; }
    if (!/^\d{11}$/.test(patientAmka)) { alert("Το ΑΜΚΑ πρέπει να είναι 11 ψηφία."); return; }

    try {
      const response = await fetch('http://localhost:8080/api/patients', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ firstName: pFirstName, lastName: pLastName, amka: patientAmka, age: parseInt(patientAge), gender: patientGender, telephone: patientTelephone, doctorId: doctorId }),
      });
      if (response.ok) { alert('Προστέθηκε!'); fetchPatients(); clearPatientForm(); }
    } catch (error) { alert('Σφάλμα.'); }
  };

  const clearPatientForm = () => { setPFirstName(''); setPLastName(''); setPatientAmka(''); setPatientAge(''); setPatientGender(''); setPatientTelephone(''); };

  // --- Life Cycle ---
  useEffect(() => { if (currentView === 'patients') fetchPatients(); }, [currentView, doctorId]);
  useEffect(() => { if (currentView === 'admin-dashboard') fetchPendingUsers(); }, [currentView]);

  if (!isLoggedIn) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] p-4 font-sans">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 flex flex-col items-center">
            <div className="text-6xl mb-6">🩺</div>
            <h1 className="text-4xl font-extrabold text-blue-600 mb-2">{isRegistering ? 'Εγγραφή' : 'Είσοδος'}</h1>
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="flex flex-col gap-5 w-full">
              {isRegistering && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Όνομα</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Όνομα" onChange={e => setRegFirstName(e.target.value)} required /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Επώνυμο</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Επώνυμο" onChange={e => setRegLastName(e.target.value)} required /></div>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label><input type="email" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="email@example.com" onChange={e => setRegEmail(e.target.value)} required /></div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Ιδιότητα</label>
                      <select className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-100" value={regRole} onChange={(e) => setRegRole(e.target.value)} required>
                        <option value="" disabled>Επιλέξτε ιδιότητα</option>
                        <option value="Doctor">Γιατρός</option>
                        <option value="Researcher">Ερευνητής</option>
                        <option value="Admin">Administrator</option>
                      </select>
                    </div>
                    {/* Εδώ επανέφερα το μήνυμα */}
                    {regRole === 'Admin' && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-sm">
                          ⚠️ <strong>Προσοχή:</strong> Οι λογαριασμοί Admin απαιτούν χειροκίνητη έγκριση από την ομάδα διαχείρισης.
                        </div>
                    )}
                  </>
              )}
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Username" onChange={e => isRegistering ? setRegUsername(e.target.value) : setUsername(e.target.value)} required /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Κωδικός</label><input type="password" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="********" onChange={e => isRegistering ? setRegPassword(e.target.value) : setPassword(e.target.value)} required /></div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-2">{isRegistering ? 'Εγγραφή' : 'Σύνδεση'}</button>
            </form>
            <div className="w-full mt-8 text-center text-slate-500 text-sm font-medium">
              <p>{isRegistering ? 'Έχετε ήδη λογαριασμό;' : 'Δεν έχετε λογαριασμό;'} <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-bold hover:underline ml-1">{isRegistering ? 'Είσοδος' : 'Εγγραφή'}</button></p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800">Medical AI Assistant</h1>
          <div className="flex gap-4">
            {userRole && userRole.toLowerCase() === 'admin' && (
                <button onClick={() => setCurrentView('admin-dashboard')} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition">Admin Panel</button>
            )}
            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition">Logout</button>
          </div>
        </header>

        {currentView === 'dashboard' && (
            <div className="flex gap-4"><button onClick={() => setCurrentView('patients')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">Διαχείριση Ασθενών</button></div>
        )}

        {currentView === 'admin-dashboard' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-6">Διαχείριση Χρηστών (Pending Approval)</h2>
              <ul className="space-y-4">
                {allPendingUsers.map((u: any) => (
                    <li key={u.id} className="p-4 border rounded-xl flex justify-between items-center">
                      <span>{u.firstName} {u.lastName} ({u.username})</span>
                      <button onClick={() => handleApprove(u.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">Έγκριση</button>
                    </li>
                ))}
              </ul>
              <button onClick={() => setCurrentView('dashboard')} className="mt-8 text-slate-400 font-bold">← Πίσω στο Dashboard</button>
            </div>
        )}

        {currentView === 'patients' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-semibold mb-6">{editingPatient ? 'Επεξεργασία Ασθενή' : 'Προσθήκη Ασθενή'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="p-3 border rounded-xl" placeholder="Όνομα" value={pFirstName} onChange={e => setPFirstName(e.target.value)} />
                  <input className="p-3 border rounded-xl" placeholder="Επώνυμο" value={pLastName} onChange={e => setPLastName(e.target.value)} />
                  <input className="p-3 border rounded-xl" placeholder="ΑΜΚΑ (11 ψηφία)" value={patientAmka} onChange={e => setPatientAmka(e.target.value)} maxLength={11} />
                  <input className="p-3 border rounded-xl" placeholder="Ηλικία" type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} />

                  {/* Dropdown για το φύλο */}
                  <select
                      className="p-3 border rounded-xl bg-white w-full"
                      value={patientGender || ''}
                      onChange={e => setPatientGender(e.target.value)}
                  >
                    <option value="" disabled>Επιλέξτε φύλο</option>
                    <option value="Άνδρας">Άνδρας</option>
                    <option value="Γυναίκα">Γυναίκα</option>
                    <option value="Άλλο">Άλλο</option>
                  </select>

                  <input className="p-3 border rounded-xl" placeholder="Τηλέφωνο" value={patientTelephone} onChange={e => setPatientTelephone(e.target.value)} />
                </div>
                <button onClick={editingPatient ? handleUpdatePatient : handleAddPatient} className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700">
                  {editingPatient ? 'Ενημέρωση' : 'Αποθήκευση'}
                </button>
              </div>

              <ul className="grid gap-4">
                {patients.map((p: any) => (
                    <li key={p.patientId} className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center transition hover:shadow-md">
                      <span className="font-medium text-lg">{p.firstName} {p.lastName}</span>
                      <div className="flex gap-3">
                        <button onClick={() => { setSelectedPatient(p); setCurrentView('patient-details'); }} className="text-blue-600 hover:underline transition">Ιστορικό</button>
                        <button onClick={() => startEdit(p)} className="text-yellow-600 hover:underline transition">Επεξεργασία</button>
                        <button onClick={() => handleDeletePatient(p.patientId)} className="text-red-500 hover:underline transition">Διαγραφή</button>
                      </div>
                    </li>
                ))}
              </ul>
              <button onClick={() => setCurrentView('dashboard')} className="text-slate-500 hover:text-slate-800 transition">← Πίσω στο Dashboard</button>
            </div>
        )}
      </div>
  );
}

export default App;
import { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jwtToken'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('app_view') || 'dashboard');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || '');
  const [aiQueryType, setAiQueryType] = useState('Γενική Ερώτηση');
  const [adminTab, setAdminTab] = useState('users');
  const [adminPatients, setAdminPatients] = useState<any[]>([]);
  const [adminCases, setAdminCases] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [allPendingUsers, setAllPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(() => {
    const saved = localStorage.getItem('doctorId');
    return saved ? parseInt(saved) : null;
  });




  // Ασφαλής φόρτωση ασθενή για να μην κρασάρει η JSON.parse
  const [selectedPatient, setSelectedPatient] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('selected_patient');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
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
  const fetchAdminPatients = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/patients', { headers: getAuthHeaders() });
      if (response.ok) setAdminPatients(await response.json());
    } catch (error) { console.error("Error fetching all patients:", error); }
  };

  const fetchAdminCases = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/medical-cases', { headers: getAuthHeaders() });
      if (response.ok) setAdminCases(await response.json());
    } catch (error) { console.error("Error fetching all cases:", error); }
  };

  useEffect(() => {
    if (currentView === 'admin-dashboard') {
      if (adminTab === 'users') {
        fetchPendingUsers();
        fetchAllUsers();
      }
      if (adminTab === 'patients') fetchAdminPatients();
      if (adminTab === 'cases') fetchAdminCases();
    }
  }, [currentView, adminTab]);
  const fetchAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users', { headers: getAuthHeaders() });
      if (response.ok) setAllUsers(await response.json());
    } catch (error) { console.error("Error fetching all users:", error); }
  };
  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/pending', { headers: getAuthHeaders() });
      if (response.ok) setAllPendingUsers(await response.json());
    } catch (error) { console.error("Error fetching pending:", error); }
  };

  const fetchMedicalCases = async (patientId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-cases/patient/${patientId}`, { headers: getAuthHeaders() });
      if (response.ok) setMedicalCases(await response.json());
    } catch (error) { console.error("Error fetching cases:", error); }
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
          setCurrentView('patients');
          localStorage.setItem('app_view', 'dashboard');
        }
      } else alert('Λάθος στοιχεία');
    } catch (error) { alert('Σφάλμα σύνδεσης'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regRole) { alert('Επιλέξτε ιδιότητα.'); return; }
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: regFirstName, lastName: regLastName, email: regEmail, username: regUsername, password: regPassword, role: regRole }),
      });
      if (response.ok) { alert('Επιτυχής Εγγραφή!'); setIsRegistering(false); }
      else alert('Σφάλμα εγγραφής.');
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
    if (!pFirstName || !pLastName || !patientAmka || !patientAge || !patientGender || !patientTelephone) { alert("Παρακαλώ συμπληρώστε όλα τα πεδία."); return; }
    if (!/^\d{11}$/.test(patientAmka)) { alert("Το ΑΜΚΑ πρέπει να είναι 11 ψηφία."); return; }

    try {
      const response = await fetch('http://localhost:8080/api/patients', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ firstName: pFirstName, lastName: pLastName, amka: patientAmka, age: parseInt(patientAge), gender: patientGender, telephone: patientTelephone, doctorId: doctorId }),
      });
      if (response.ok) { alert('Προστέθηκε επιτυχώς!'); fetchPatients(); clearPatientForm(); }
    } catch (error) { alert('Σφάλμα κατά την προσθήκη.'); }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;
    try {
      const response = await fetch(`http://localhost:8080/api/patients/${editingPatient.patientId}`, {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({ firstName: pFirstName, lastName: pLastName, amka: patientAmka, age: parseInt(patientAge) || 0, gender: patientGender, telephone: patientTelephone, doctorId: doctorId }),
      });
      if (response.ok) { alert('Ενημερώθηκε!'); setEditingPatient(null); clearPatientForm(); fetchPatients(); }
    } catch (error) { alert('Σφάλμα ενημέρωσης.'); }
  };

  const handleDeletePatient = async (id: number) => {
    if (!window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτόν τον ασθενή;")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/patients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        alert('Ο ασθενής διαγράφηκε.');
        fetchPatients();
      } else {
        alert('Σφάλμα κατά τη διαγραφή.');
      }
    } catch (error) {
      alert('Σφάλμα δικτύου.');
    }
  };

  const handleAskAI = async () => {
    if (!aiQuery) return;
    setPendingDiagnosis("Ανάλυση σε εξέλιξη...");
    try {
      const response = await fetch('http://localhost:8080/api/ai/query', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ query: `${aiQueryType}: ${aiQuery}` }),
      });
      if (response.ok) {
        const data = await response.json();
        setPendingDiagnosis(data.diagnosis || data.response || data.answer);
      }
    } catch (error) { setPendingDiagnosis("Προέκυψε σφάλμα με το AI."); }
  };

  const handleSaveCase = async () => {
    if (!selectedPatient || !aiQuery || !pendingDiagnosis) return;
    try {
      const response = await fetch('http://localhost:8080/api/medical-cases/save', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ patientId: selectedPatient.patientId, symptoms: aiQuery, diagnosis: pendingDiagnosis }),
      });
      if (response.ok) {
        alert('Το περιστατικό αποθηκεύτηκε!');
        setAiQuery('');
        setPendingDiagnosis(null);
        fetchMedicalCases(selectedPatient.patientId);
      }
    } catch (error) { alert('Σφάλμα αποθήκευσης.'); }
  };

  const startEdit = (p: any) => {
    setEditingPatient(p);
    setPFirstName(p.firstName);
    setPLastName(p.lastName);
    setPatientAmka(p.amka);
    setPatientAge(p.age.toString());
    setPatientGender(p.gender);
    setPatientTelephone(p.telephone);
  };
  const handleDeleteCase = async (caseId: number) => {
    if (!window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτό το περιστατικό από το ιστορικό;")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/medical-cases/${caseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        // Αν πετύχει η διαγραφή, ξανατραβάμε τα περιστατικά για να ανανεωθεί η λίστα
        fetchMedicalCases(selectedPatient.patientId);
      } else {
        alert('Σφάλμα κατά τη διαγραφή του περιστατικού.');
      }
    } catch (error) {
      alert('Προέκυψε σφάλμα επικοινωνίας με τον server.');
    }
  };

  const clearPatientForm = () => { setPFirstName(''); setPLastName(''); setPatientAmka(''); setPatientAge(''); setPatientGender(''); setPatientTelephone(''); };

  // --- Life Cycle ---
  useEffect(() => { if (currentView === 'patients') fetchPatients(); }, [currentView, doctorId]);
  useEffect(() => { if (currentView === 'admin-dashboard') fetchPendingUsers(); }, [currentView]);
  useEffect(() => {
    if (currentView === 'patient-details' && selectedPatient) {
      fetchMedicalCases(selectedPatient.patientId);
    }
  }, [currentView, selectedPatient]);

  // --- UI RENDER ---
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
                        <option value="" disabled>Επιλέξτε Ιδιότητα</option>
                        <option value="Doctor">Γιατρός</option>
                        <option value="Researcher">Ερευνητής</option>
                        <option value="Admin">Administrator</option>
                      </select>
                    </div>
                    {regRole === 'Admin' && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-sm">
                          ⚠️ <strong>Προσοχή:</strong> Οι λογαριασμοί Admin χρειάζονται έγκριση.
                        </div>
                    )}
                  </>
              )}
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Username" onChange={e => isRegistering ? setRegUsername(e.target.value) : setUsername(e.target.value)} required /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Κωδικός</label><input type="password" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="********" onChange={e => isRegistering ? setRegPassword(e.target.value) : setPassword(e.target.value)} required /></div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-2">{isRegistering ? 'Εγγραφή' : 'Είσοδος'}</button>
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

            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition">Αποσύνδεση</button>
          </div>
        </header>

        {currentView === 'dashboard' && (
            <div className="flex gap-4">
              <button onClick={() => setCurrentView('patients')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">Διαχείριση Ασθενών</button>
            </div>
        )}

        {currentView === 'admin-dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">


              {/* Tabs Menu */}
              <div className="flex gap-4 border-b border-slate-200 pb-4 mb-6">
                <button onClick={() => setAdminTab('users')} className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${adminTab === 'users' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Χρήστες</button>
                <button onClick={() => setAdminTab('patients')} className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${adminTab === 'patients' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Ασθενείς</button>
                <button onClick={() => setAdminTab('cases')} className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${adminTab === 'cases' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Περιστατικά</button>
              </div>

              {/* Tab: Users */}

              {/* Tab: Users */}
              {adminTab === 'users' && (
                  <div className="space-y-8">
                    {/* 1. Εκκρεμείς Εγκρίσεις */}


                    {/* 2. Ενεργοί Χρήστες του Συστήματος */}

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">

                      <ul className="grid gap-4">
                        {allUsers.length > 0 ? allUsers.map((u: any) => (
                            <li key={u.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-lg text-slate-800">{u.firstName} {u.lastName}</span>
                                <p className="text-sm text-slate-500 mt-1">Ρόλος: {u.role} | Username: {u.username} | Email: {u.email}</p>
                              </div>
                              {/* Κουμπί διαγραφής στα δεξιά, όπως ακριβώς στους ασθενείς */}
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 font-bold hover:underline transition">Διαγραφή</button>
                            </li>
                        )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν εγγεγραμμένοι χρήστες (ή λείπει το Endpoint στο Backend).</p>}
                      </ul>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold mb-6 text-slate-700">Εκκρεμείς Εγκρίσεις ({allPendingUsers.length})</h3>
                      <ul className="space-y-4">
                        {allPendingUsers.length > 0 ? allPendingUsers.map((u: any) => (
                            <li key={u.id} className="p-5 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-center">
                              <div>
                                <span className="font-bold text-lg block text-slate-800">{u.firstName} {u.lastName}</span>
                                <span className="text-sm text-slate-500">@{u.username} • Ιδιότητα: {u.role}</span>
                              </div>
                              <button onClick={() => handleApprove(u.id)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-sm transition">Έγκριση</button>
                            </li>
                        )) : <p className="text-slate-500 font-medium">Δεν υπάρχουν νέοι χρήστες προς έγκριση.</p>}
                      </ul>
                    </div>
                  </div>
              )}
              {/* Tab: Patients */}
              {adminTab === 'patients' && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">

                    <ul className="grid gap-4">
                      {adminPatients.length > 0 ? adminPatients.map((p: any) => (
                          <li key={p.patientId} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-lg text-slate-800">{p.firstName} {p.lastName}</span>
                              <p className="text-sm text-slate-500 mt-1">ΑΜΚΑ: {p.amka} | Ηλικία: {p.age} | Φύλο: {p.gender}</p>
                            </div>
                            <button onClick={() => handleDeletePatient(p.patientId)} className="text-red-500 font-bold hover:underline transition">Διαγραφή</button>
                          </li>
                      )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν ασθενείς ή εκκρεμεί το API στο Backend.</p>}
                    </ul>
                  </div>
              )}


              {/* Tab: Cases */}
              {adminTab === 'cases' && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">

                    <ul className="grid gap-4">
                      {adminCases.length > 0 ? adminCases.map((c: any) => (
                          <li key={c.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1 w-full">
                              <span className="text-sm font-bold text-purple-600 mb-1 block">
                                {new Date(c.date).toLocaleString()}
                              </span>
                              <span className="font-bold text-lg text-slate-800 block mb-3">
                                Διάγνωση/Απάντηση: {c.diagnosis}
                              </span>
                              <div className="bg-white p-4 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Ερωτημα / Συμπτωματα:</p>
                                <p className="text-sm text-slate-600">{c.symptoms}</p>
                              </div>
                            </div>
                            {/* Αν στο μέλλον θες κουμπί διαγραφής περιστατικού, το βάζεις εδώ */}
                            {/* <button className="text-red-500 font-bold hover:underline transition">Διαγραφή</button> */}
                          </li>
                      )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν περιστατικά ή εκκρεμεί το API στο Backend.</p>}
                    </ul>
                  </div>
              )}
            </div>
        )}


        {currentView === 'patient-details' && (
            <div className="grid md:grid-cols-2 gap-8 font-sans p-6">
              {selectedPatient ? (
                  <>
                    {/* Αριστερή Στήλη: Στοιχεία & Ιστορικό */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <button onClick={() => setCurrentView('patients')} className="text-slate-400 hover:text-slate-800 mb-6 font-bold">← Επιστροφή</button>
                      <h3 className="text-3xl font-bold text-slate-800 mb-1">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                      <p className="text-slate-500 mb-8">ΑΜΚΑ: {selectedPatient.amka} | {selectedPatient.age} ετών | {selectedPatient.gender}</p>

                      <h4 className="font-bold text-lg mb-4 text-slate-700">Ιατρικό Ιστορικό</h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {medicalCases.length > 0 ? medicalCases.map((m: any) => (
                            <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                              <p className="text-xs text-slate-400 mb-1">{new Date(m.date).toLocaleString()}</p>

                              {/* Εδώ βάζεις το formatText αν το έχεις προσθέσει, αλλιώς το αφήνεις m.diagnosis */}
                              <div className="font-medium text-slate-700 text-sm mb-3">
                                {m.diagnosis}
                              </div>

                              {/* Το νέο κουμπί διαγραφής */}
                              <div className="mt-auto flex justify-end border-t border-slate-200 pt-2">
                                <button
                                    onClick={() => handleDeleteCase(m.id)}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                                >
                                  Διαγραφή Περιστατικού
                                </button>
                              </div>
                            </div>
                        )) : <p className="text-slate-400">Δεν βρέθηκαν παλαιότερα περιστατικά.</p>}
                      </div>
                    </div>

                    {/* Δεξιά Στήλη: AI Εργαλείο */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold mb-6 text-slate-800">AI Medical Assistant</h3>
                      <select
                          className="w-full p-4 border border-slate-200 rounded-2xl mb-4 bg-white"
                          value={aiQueryType}
                          onChange={(e) => setAiQueryType(e.target.value)}
                      >
                        <option>Γενική Ερώτηση</option>
                        <option>Ανάλυση Συμπτωμάτων</option>
                        <option>Επεξήγηση Εξετάσεων</option>
                        <option>Συμβουλές Πρόληψης</option>
                      </select>

                      <textarea
                          className="w-full p-4 border border-slate-200 rounded-2xl h-40 focus:ring-2 focus:ring-blue-100 outline-none transition"
                          placeholder={`Πληκτρολογήστε εδώ για ${aiQueryType}...`}
                          value={aiQuery}
                          onChange={e => setAiQuery(e.target.value)}
                      />

                      <button onClick={handleAskAI} className="mt-4 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg">Ανάλυση</button>

                      {pendingDiagnosis && (
                          <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-blue-900 leading-relaxed">{pendingDiagnosis}</p>
                            <button onClick={handleSaveCase} className="block mt-4 font-bold text-green-700 hover:text-green-800 transition">+ Αποθήκευση στο ιστορικό</button>
                          </div>
                      )}
                    </div>
                  </>
              ) : (
                  <div className="col-span-2 text-center p-20">
                    <p className="text-lg font-bold text-slate-500">Φόρτωση δεδομένων...</p>
                    <button onClick={() => setCurrentView('patients')} className="mt-4 text-blue-600 font-bold underline">Επιστροφή στη λίστα</button>
                  </div>
              )}
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

                  <select
                      className="p-3 border rounded-xl bg-white w-full"
                      value={patientGender || ''}
                      onChange={e => setPatientGender(e.target.value)}
                  >
                    <option value="" disabled>Επιλέξτε Φύλο</option>
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
                        <button onClick={() => {
                          setSelectedPatient(p);
                          localStorage.setItem('selected_patient', JSON.stringify(p));
                          setCurrentView('patient-details');
                        }} className="text-blue-600 hover:underline transition">Καρτέλα ασθενή</button>
                        <button onClick={() => startEdit(p)} className="text-yellow-600 hover:underline">Επεξεργασία</button>
                        <button onClick={() => handleDeletePatient(p.patientId)} className="text-red-500 hover:underline">Διαγραφή</button>
                      </div>
                    </li>
                ))}
              </ul>

            </div>
        )}

      </div>
  );
}

export default App;
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
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
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
  const [pendingDiagnosis, setPendingDiagnosis] = useState<any | null>(null);
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
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query: `${aiQueryType}: ${aiQuery}` }),
      });

      if (response.ok) {
        const data = await response.json();
        // Το Gemini μερικές φορές βάζει το JSON μέσα σε markdown blocks (```json ... ```)
        // Πρέπει να καθαρίσουμε το κείμενο πριν το κάνουμε parse
        let rawText = data.diagnosis || data.response || data.answer || data;

        console.log("Raw AI Response:", rawText); // Δες το στο F12 console

        if (typeof rawText === 'string') {
          // Καθαρισμός από τυχόν ```json ή ``` tags που βάζει το AI
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          try {
            const parsed = JSON.parse(cleanedText);
            console.log("Parsed Object:", parsed);
            setPendingDiagnosis(parsed); // Εδώ μπαίνει το αντικείμενο
          } catch (e) {
            console.error("JSON Parse Error:", e);
            setPendingDiagnosis(rawText); // Fallback στο κείμενο αν αποτύχει
          }
        } else {
          setPendingDiagnosis(rawText);
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setPendingDiagnosis("Σφάλμα σύνδεσης με το AI.");
    }
  };

  const handleSaveCase = async () => {
    if (!selectedPatient || !aiQuery || !pendingDiagnosis) return;

    // Μετατρέπουμε το αντικείμενο σε ένα όμορφο κείμενο για να αποθηκευτεί στη βάση
    const diagnosisToSave = typeof pendingDiagnosis === 'object'
        ? `ΔΙΑΓΝΩΣΗ: ${pendingDiagnosis.diagnosis}\n` +
        `CONFIDENCE: ${pendingDiagnosis.confidence}\n` +
        `ΑΝΑΛΥΣΗ: ${pendingDiagnosis.analysis}\n` +
        `ΠΡΟΤΑΣΕΙΣ: ${pendingDiagnosis.recommendations?.join(", ")}\n` +
        `RED FLAGS: ${pendingDiagnosis.red_flags?.join(", ")}`
        : pendingDiagnosis;

    try {
      const response = await fetch('http://localhost:8080/api/medical-cases/save', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patientId: selectedPatient.patientId,
          symptoms: aiQuery,
          diagnosis: diagnosisToSave, // Στέλνουμε το κείμενο, όχι το object
          type: aiQueryType
        }),
      });

      if (response.ok) {
        alert('Το περιστατικό αποθηκεύτηκε επιτυχώς!');
        setAiQuery('');
        setPendingDiagnosis(null);
        fetchMedicalCases(selectedPatient.patientId);
      } else {
        alert('Αποτυχία αποθήκευσης στον server.');
      }
    } catch (error) {
      alert('Σφάλμα σύνδεσης κατά την αποθήκευση.');
    }
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
                    {/* ΑΡΙΣΤΕΡΗ ΣΤΗΛΗ: ΠΡΟΦΙΛ & ΙΣΤΟΡΙΚΟ */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-fit">
                      <button
                          onClick={() => setCurrentView('patients')}
                          className="text-slate-400 hover:text-slate-800 mb-6 font-bold flex items-center gap-2 transition"
                      >
                        ← Επιστροφή στους ασθενείς
                      </button>

                      <div className="mb-8">
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </h3>
                        <p className="text-slate-500 font-medium">
                          AMKA: {selectedPatient.amka} | {selectedPatient.age} ετών | {selectedPatient.gender}
                        </p>
                      </div>

                      <h4 className="font-bold text-lg mb-4 text-slate-700 flex justify-between items-center border-t pt-6">
                        Ιστορικό Περιστατικών
                        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-medium">
              {medicalCases.length} εγγραφές
            </span>
                      </h4>

                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {medicalCases.length > 0 ? (
                            medicalCases.map((m: any) => {
                              // Logic για την εξαγωγή του Preview και του Score από το κείμενο
                              const diagMatch = m.diagnosis.match(/ΔΙΑΓΝΩΣΗ: (.*?)\n/);
                              const scoreMatch = m.diagnosis.match(/CONFIDENCE: (.*?)\n/);

                              const previewText = diagMatch ? diagMatch[1] : (m.diagnosis.length > 60 ? m.diagnosis.substring(0, 60) + "..." : m.diagnosis);
                              const confidenceScore = scoreMatch ? scoreMatch[1] : "N/A";

                              return (
                                  <div
                                      key={m.id}
                                      onClick={() => setSelectedCase(m)} // <--- Πρόσθεσε αυτό
                                      className="group cursor-pointer bg-slate-50/50 border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200"
                                  >
                                    <div className="flex items-start justify-between gap-3">

                                      {/* Στήλη 1: Ημερομηνία & Badge */}
                                      <div className="min-w-[90px] flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                          {new Date(m.date).toLocaleDateString('el-GR')}
                                        </p>
                                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-[9px] font-bold text-blue-600 rounded-md uppercase self-start border border-blue-100/50">
                          {m.type || "Γενική"}
                        </span>
                                      </div>

                                      {/* Στήλη 2: Ερώτηση & Προεπισκόπηση */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 truncate">
                                          {m.symptoms}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-800 leading-tight">
                                          {previewText}
                                        </p>
                                      </div>

                                      {/* Στήλη 3: Score & Delete */}
                                      <div className="flex flex-col items-end gap-2">
                                        <div className="bg-white px-2 py-1 rounded-lg border border-slate-100 text-center min-w-[45px] shadow-sm">
                                          <p className="text-[7px] font-bold text-slate-400 uppercase leading-none">Score</p>
                                          <p className="text-[11px] font-black text-blue-600 leading-none mt-1">{confidenceScore}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCase(m.id)}
                                            className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-red-500 hover:underline transition-opacity"
                                        >
                                          Διαγραφή
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                              );
                            })
                        ) : (
                            <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                              <p className="text-slate-400 text-sm font-medium">Δεν υπάρχει ιστορικό εγγραφών.</p>
                            </div>
                        )}
                      </div>
                    </div>

                    {/* ΔΕΞΙΑ ΣΤΗΛΗ: AI ASSISTANT */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-fit">
                      <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <span className="bg-blue-100 p-2 rounded-xl text-lg">🤖</span>
                        AI Medical Assistant
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Τύπος Ανάλυσης</label>
                          <select
                              className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none transition"
                              value={aiQueryType}
                              onChange={(e) => setAiQueryType(e.target.value)}
                          >
                            <option>Γενική Εξέταση</option>
                            <option>Ανάλυση Συμπτωμάτων</option>
                            <option>Πρόγνωση Παθήσεων</option>
                            <option>Προτάσεις Θεραπείας</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Περιγραφή Συμπτωμάτων</label>
                          <textarea
                              className="w-full p-4 border border-slate-200 rounded-2xl h-40 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50"
                              placeholder={`Περιγράψτε εδώ τα συμπτώματα για ${aiQueryType}...`}
                              value={aiQuery}
                              onChange={e => setAiQuery(e.target.value)}
                          />
                        </div>

                        <button
                            onClick={handleAskAI}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                        >
                          Έναρξη Ανάλυσης
                        </button>
                      </div>

                      {/* AI RESULT SECTION */}
                      {pendingDiagnosis && (
                          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {typeof pendingDiagnosis === 'object' ? (
                                <div className="space-y-6">
                                  {/* Diagnosis Card */}
                                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Αποτέλεσμα AI</p>
                                        <h3 className="text-xl font-bold text-slate-800">{pendingDiagnosis.diagnosis}</h3>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Confidence</p>
                                        <span className="text-lg font-black text-blue-600">{pendingDiagnosis.confidence}</span>
                                      </div>
                                    </div>
                                    <p className="text-slate-600 text-xs leading-relaxed italic border-t border-slate-50 pt-4">
                                      {pendingDiagnosis.analysis}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                      <h4 className="text-[10px] font-bold text-emerald-700 mb-3 uppercase tracking-wider">📋 Προτάσεις</h4>
                                      <ul className="space-y-2">
                                        {pendingDiagnosis.recommendations?.map((rec: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-[10px] text-emerald-900/80">
                                              <span className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0"></span>
                                              {rec}
                                            </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                                      <h4 className="text-[10px] font-bold text-rose-700 mb-3 uppercase tracking-wider">⚠️ Red Flags</h4>
                                      <ul className="space-y-2">
                                        {pendingDiagnosis.red_flags?.map((flag: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-[10px] text-rose-900/80">
                                              <span className="mt-1 w-1 h-1 rounded-full bg-rose-400 shrink-0"></span>
                                              {flag}
                                            </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  <button
                                      onClick={handleSaveCase}
                                      className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition shadow-xl flex items-center justify-center gap-2"
                                  >
                                    ✓ Επιβεβαίωση & Αποθήκευση
                                  </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                  <div className="text-center">
                                    <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-slate-500 text-xs font-medium">{pendingDiagnosis}</p>
                                  </div>
                                </div>
                            )}
                          </div>
                      )}
                    </div>
                  </>
              ) : (
                  <div className="col-span-2 text-center p-20 bg-white rounded-3xl border border-slate-100">
                    <p className="text-lg font-bold text-slate-500 italic">Επιλέξτε έναν ασθενή για να δείτε το ιστορικό του...</p>
                    <button onClick={() => setCurrentView('patients')} className="mt-4 text-blue-600 font-bold hover:underline">Επιστροφή στη λίστα</button>
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
        {/* MODAL ΓΙΑ ΠΡΟΒΟΛΗ ΠΛΗΡΟΥΣ ΠΕΡΙΣΤΑΤΙΚΟΥ */}
        {selectedCase && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Λεπτομέρειες Περιστατικού</p>
                    <h3 className="text-xl font-bold text-slate-800">{new Date(selectedCase.date).toLocaleString('el-GR')}</h3>
                  </div>
                  <button
                      onClick={() => setSelectedCase(null)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-800 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Συμπτώματα / Ερώτηση</h4>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                      {selectedCase.symptoms}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Πλήρης Διάγνωση & Ανάλυση</h4>
                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
                      {selectedCase.diagnosis}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-right">
                  <button
                      onClick={() => setSelectedCase(null)}
                      className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition"
                  >
                    Κλείσιμο
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;
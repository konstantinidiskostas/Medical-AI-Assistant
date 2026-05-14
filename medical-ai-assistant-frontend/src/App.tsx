import { useState, useEffect, useRef } from 'react';

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
  const [conversation, setConversation] = useState<any[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('available_tags');
      return saved ? JSON.parse(saved) : ["Διάγνωση", "Πρόγνωση", "Θεραπεία", "Εξετάσεις",
        "Παρακολούθηση", "Παραπομπή", "Επείγον", "Προληπτικός", "Εκπαιδευτικό"];
    } catch { return ["Διάγνωση", "Πρόγνωση", "Θεραπεία", "Εξετάσεις",
        "Παρακολούθηση", "Παραπομπή", "Επείγον", "Προληπτικός", "Εκπαιδευτικό"]; }
  });
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');

  useEffect(() => { localStorage.setItem('available_tags', JSON.stringify(availableTags)); }, [availableTags]);

  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserFirstName, setEditUserFirstName] = useState('');
  const [editUserLastName, setEditUserLastName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserRole, setEditUserRole] = useState('');

  // Browser history navigation (back/forward)
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.history.replaceState({ view: currentView, patientId: selectedPatient?.patientId }, '');
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.history.pushState({ view: currentView, patientId: selectedPatient?.patientId }, '');
  }, [currentView, selectedPatient?.patientId]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
        if (e.state.view === 'patient-details' && e.state.patientId) {
          try {
            const saved = localStorage.getItem('selected_patient');
            if (saved) {
              const patient = JSON.parse(saved);
              if (patient.patientId === e.state.patientId) {
                setSelectedPatient(patient);
                return;
              }
            }
          } catch (err) {}
        } else {
          setSelectedPatient(null);
          localStorage.removeItem('selected_patient');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
      if (response.ok) { alert('Ενημερώθηκε!'); setEditingPatient(null); clearPatientForm(); fetchPatients(); fetchAdminPatients(); }
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
        body: JSON.stringify({
          query: `${aiQueryType}: ${aiQuery}`,
          conversation: conversation.length > 0 ? JSON.stringify(conversation) : null
        }),
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

    const diagnosisToSave = typeof pendingDiagnosis === 'object'
        ? JSON.stringify(pendingDiagnosis)
        : pendingDiagnosis;

    const conversationEntry = {
      question: aiQuery,
      answer: diagnosisToSave,
      type: aiQueryType
    };

    const tagsString = selectedTags.join(',');

    if (currentCaseId) {
      // Append to existing case
      try {
        const response = await fetch(`http://localhost:8080/api/medical-cases/${currentCaseId}/conversation`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            symptoms: aiQuery,
            diagnosis: diagnosisToSave,
            type: aiQueryType,
            tags: tagsString
          }),
        });
        if (response.ok) {
          alert('Το ερώτημα προστέθηκε στο περιστατικό!');
          setConversation(prev => [...prev, conversationEntry]);
          setAiQuery('');
          setPendingDiagnosis(null);
          fetchMedicalCases(selectedPatient.patientId);
        } else {
          alert('Αποτυχία αποθήκευσης στον server.');
        }
      } catch (error) {
        alert('Σφάλμα σύνδεσης κατά την αποθήκευση.');
      }
    } else {
      // Create new case with conversation
      try {
        const newConversation = [conversationEntry];
        const response = await fetch('http://localhost:8080/api/medical-cases/save', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            patientId: selectedPatient.patientId,
            symptoms: aiQuery,
            diagnosis: diagnosisToSave,
            type: aiQueryType,
            conversation: JSON.stringify(newConversation),
            tags: tagsString
          }),
        });
        if (response.ok) {
          const savedCase = await response.json();
          alert('Το περιστατικό αποθηκεύτηκε επιτυχώς!');
          setCurrentCaseId(savedCase.id);
          setConversation(newConversation);
          setAiQuery('');
          setPendingDiagnosis(null);
          fetchMedicalCases(selectedPatient.patientId);
        } else {
          alert('Αποτυχία αποθήκευσης στον server.');
        }
      } catch (error) {
        alert('Σφάλμα σύνδεσης κατά την αποθήκευση.');
      }
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
        if (selectedPatient) fetchMedicalCases(selectedPatient.patientId);
        fetchAdminCases();
      } else {
        alert('Σφάλμα κατά τη διαγραφή του περιστατικού.');
      }
    } catch (error) {
      alert('Προέκυψε σφάλμα επικοινωνίας με τον server.');
    }
  };

  const loadCaseIntoAI = (caseData: any) => {
    setAiQuery('');
    setPendingDiagnosis(null);

    if (caseData.conversation) {
      try {
        const conv = JSON.parse(caseData.conversation);
        setConversation(conv);
      } catch (e) {
        setConversation([{
          question: caseData.symptoms,
          answer: caseData.diagnosis,
          type: caseData.type
        }]);
      }
    } else {
      setConversation([{
        question: caseData.symptoms,
        answer: caseData.diagnosis,
        type: caseData.type
      }]);
    }
    setCurrentCaseId(caseData.id);
    setSelectedTags(caseData.tags ? caseData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : []);
  };

  const startNewAnalysis = () => {
    setCurrentCaseId(null);
    setConversation([]);
    setPendingDiagnosis(null);
    setAiQuery('');
    setSelectedTags([]);
  };

  const handleSaveTags = async () => {
    if (!currentCaseId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/medical-cases/${currentCaseId}/tags`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tags: selectedTags.join(',') }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMedicalCases(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  };

  const handleAddCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag || selectedTags.includes(tag)) return;
    setSelectedTags(prev => [...prev, tag]);
    setAvailableTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
    setCustomTagInput('');
  };

  const handleRenameTag = (oldTag: string) => {
    const newTag = editTagValue.trim();
    if (newTag && newTag !== oldTag) {
      setAvailableTags(prev => prev.map(t => t === oldTag ? newTag : t));
      setSelectedTags(prev => prev.map(t => t === oldTag ? newTag : t));
    }
    setEditingTag(null);
    setEditTagValue('');
  };

  const handleDeleteTag = (tag: string) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
    setSelectedTags(prev => prev.filter(t => t !== tag));
    if (filterTag === tag) setFilterTag('');
  };

  const clearPatientForm = () => { setPFirstName(''); setPLastName(''); setPatientAmka(''); setPatientAge(''); setPatientGender(''); setPatientTelephone(''); };

  const startEditUser = (u: any) => {
    setEditingUser(u);
    setEditUserFirstName(u.firstName);
    setEditUserLastName(u.lastName);
    setEditUserEmail(u.email);
    setEditUserUsername(u.username);
    setEditUserRole(u.role);
  };

  const clearUserForm = () => {
    setEditingUser(null);
    setEditUserFirstName('');
    setEditUserLastName('');
    setEditUserEmail('');
    setEditUserUsername('');
    setEditUserRole('');
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch(`http://localhost:8080/api/users/${editingUser.id}`, {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({
          firstName: editUserFirstName,
          lastName: editUserLastName,
          email: editUserEmail,
          username: editUserUsername,
          role: editUserRole,
        }),
      });
      if (response.ok) {
        alert('Ο χρήστης ενημερώθηκε!');
        clearUserForm();
        fetchAllUsers();
      } else {
        const msg = await response.text();
        alert(msg || 'Σφάλμα ενημέρωσης χρήστη.');
      }
    } catch (error) {
      alert('Σφάλμα δικτύου.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτόν τον χρήστη;")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        alert('Ο χρήστης διαγράφηκε.');
        fetchAllUsers();
      } else {
        alert('Σφάλμα κατά τη διαγραφή.');
      }
    } catch (error) {
      alert('Σφάλμα δικτύου.');
    }
  };

  // --- Life Cycle ---
  useEffect(() => { if (currentView === 'patients') fetchPatients(); }, [currentView, doctorId]);
  useEffect(() => { if (currentView === 'admin-dashboard') fetchPendingUsers(); }, [currentView]);
  useEffect(() => {
    if (currentView === 'patient-details' && selectedPatient) {
      fetchMedicalCases(selectedPatient.patientId);
      startNewAnalysis();
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
                  <div className="space-y-6">
                    {/* Edit user form */}
                    {editingUser && (
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-semibold mb-6">Επεξεργασία Χρήστη</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input className="p-3 border rounded-xl" placeholder="Όνομα" value={editUserFirstName} onChange={e => setEditUserFirstName(e.target.value)} />
                          <input className="p-3 border rounded-xl" placeholder="Επώνυμο" value={editUserLastName} onChange={e => setEditUserLastName(e.target.value)} />
                          <input className="p-3 border rounded-xl" placeholder="Email" value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} />
                          <input className="p-3 border rounded-xl" placeholder="Username" value={editUserUsername} onChange={e => setEditUserUsername(e.target.value)} />
                          <select className="p-3 border rounded-xl bg-white w-full" value={editUserRole} onChange={e => setEditUserRole(e.target.value)}>
                            <option value="" disabled>Επιλέξτε Ρόλο</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Researcher">Researcher</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button onClick={handleUpdateUser} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700">Ενημέρωση</button>
                          <button onClick={clearUserForm} className="bg-slate-200 text-slate-600 px-8 py-3 rounded-xl font-semibold hover:bg-slate-300">Ακύρωση</button>
                        </div>
                      </div>
                    )}

                    {/* Active Users */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold mb-6 text-slate-700">Ενεργοί Χρήστες</h3>
                      <ul className="grid gap-4">
                        {allUsers.length > 0 ? allUsers.filter((u: any) => u.id !== doctorId && u.role !== 'Pending_Admin').map((u: any) => (
                            <li key={u.id} className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center transition hover:shadow-md">
                              <div>
                                <span className="font-bold text-lg text-slate-800">{u.firstName} {u.lastName}</span>
                                <p className="text-sm text-slate-500 mt-1">Ρόλος: {u.role} | Username: {u.username} | Email: {u.email}</p>
                              </div>
                              <div className="flex gap-3">
                                <button onClick={() => startEditUser(u)} className="text-yellow-600 hover:underline">Επεξεργασία</button>
                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:underline">Διαγραφή</button>
                              </div>
                            </li>
                        )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν εγγεγραμμένοι χρήστες.</p>}
                      </ul>
                    </div>

                    {/* Pending Approvals */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold mb-6 text-slate-700">Εκκρεμείς Εγκρίσεις ({allPendingUsers.length})</h3>
                      <ul className="space-y-4">
                        {allPendingUsers.length > 0 ? allPendingUsers.map((u: any) => (
                            <li key={u.id} className="p-5 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-center">
                              <div>
                                <span className="font-bold text-lg block text-slate-800">{u.firstName} {u.lastName}</span>
                                <span className="text-sm text-slate-500">@{u.username} • Ιδιότητα: Διαχειριστής (Αναμονή έγκρισης)</span>
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
                  <div className="space-y-6">
                    {editingPatient && (
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-semibold mb-6">Επεξεργασία Ασθενή</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input className="p-3 border rounded-xl" placeholder="Όνομα" value={pFirstName} onChange={e => setPFirstName(e.target.value)} />
                          <input className="p-3 border rounded-xl" placeholder="Επώνυμο" value={pLastName} onChange={e => setPLastName(e.target.value)} />
                          <input className="p-3 border rounded-xl" placeholder="ΑΜΚΑ (11 ψηφία)" value={patientAmka} onChange={e => setPatientAmka(e.target.value)} maxLength={11} />
                          <input className="p-3 border rounded-xl" placeholder="Ηλικία" type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} />
                          <select className="p-3 border rounded-xl bg-white w-full" value={patientGender || ''} onChange={e => setPatientGender(e.target.value)}>
                            <option value="" disabled>Επιλέξτε Φύλο</option>
                            <option value="Άνδρας">Άνδρας</option>
                            <option value="Γυναίκα">Γυναίκα</option>
                            <option value="Άλλο">Άλλο</option>
                          </select>
                          <input className="p-3 border rounded-xl" placeholder="Τηλέφωνο" value={patientTelephone} onChange={e => setPatientTelephone(e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button onClick={handleUpdatePatient} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700">Ενημέρωση</button>
                          <button onClick={() => { setEditingPatient(null); clearPatientForm(); }} className="bg-slate-200 text-slate-600 px-8 py-3 rounded-xl font-semibold hover:bg-slate-300">Ακύρωση</button>
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold mb-6 text-slate-700">Όλοι οι Ασθενείς</h3>
                      <ul className="grid gap-4">
                        {adminPatients.length > 0 ? adminPatients.map((p: any) => (
                            <li key={p.patientId} className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center transition hover:shadow-md">
                              <div>
                                <span className="font-bold text-lg text-slate-800">{p.firstName} {p.lastName}</span>
                                <p className="text-sm text-slate-500 mt-1">ΑΜΚΑ: {p.amka} | Ηλικία: {p.age} | Φύλο: {p.gender}</p>
                              </div>
                              <div className="flex gap-3">
                                <button onClick={() => startEdit(p)} className="text-yellow-600 hover:underline">Επεξεργασία</button>
                                <button onClick={() => handleDeletePatient(p.patientId)} className="text-red-500 hover:underline">Διαγραφή</button>
                              </div>
                            </li>
                        )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν ασθενείς.</p>}
                      </ul>
                    </div>
                  </div>
              )}


              {/* Tab: Cases */}
              {adminTab === 'cases' && (
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold mb-6 text-slate-700 flex justify-between items-center">
                        Όλα τα Περιστατικά
                        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-medium">{adminCases.length} εγγραφές</span>
                      </h3>

                      {/* Tag filter */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        <button onClick={() => setFilterTag('')}
                          className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border ${
                            !filterTag ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                          }`}>Όλα</button>
                        {availableTags.map(tag => (
                          <button key={tag} onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                            className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border ${
                              filterTag === tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                            }`}>{tag}</button>
                        ))}
                      </div>

                      <div className="grid gap-4">
                        {adminCases.length > 0 ? (
                          adminCases.filter((c: any) => {
                            if (!filterTag) return true;
                            const caseTags = c.tags ? c.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
                            return caseTags.includes(filterTag);
                          }).map((c: any) => {
                            let data: any = { diagnosis: "Προβολή...", confidence: "N/A" };
                            try { const p = JSON.parse(c.diagnosis); data = { diagnosis: p.diagnosis, confidence: p.confidence }; }
                            catch (e) { data = { diagnosis: c.diagnosis.split('\n')[0].replace("ΔΙΑΓΝΩΣΗ:", "").replace(/\*\*/g, '').trim(), confidence: "N/A" }; }

                            const caseTags = c.tags ? c.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];

                            return (
                              <div key={c.id}
                                onClick={() => setSelectedCase(c)}
                                className="group cursor-pointer bg-white border rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 border-slate-100"
                              >
                                <div className="flex items-center gap-6 text-left">
                                  {/* Date & Type */}
                                  <div className="w-28 flex-shrink-0 text-left">
                                    <p className="text-[11px] font-bold text-slate-400 mb-1">
                                      {new Date(c.date).toLocaleDateString('el-GR')}
                                    </p>
                                    <span className="inline-block px-2 py-1 bg-blue-50 text-[9px] font-bold text-blue-600 rounded-md uppercase border border-blue-100/50 leading-none">
                                      {c.type || "Γενική"}
                                    </span>
                                  </div>

                                  {/* Diagnosis preview */}
                                  <div className="flex-1 min-w-0 border-l border-slate-50 pl-6 text-left">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1 truncate">
                                      {c.symptoms ? `ΕΡΩΤΗΣΗ: ${c.symptoms}` : "Χωρίς ερώτημα"}
                                    </p>
                                    <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-1">
                                      {data.diagnosis}
                                    </p>
                                    {caseTags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {caseTags.map((tag: string) => (
                                          <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">{tag}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Score & delete */}
                                  <div className="w-20 flex-shrink-0 flex flex-col items-end gap-1">
                                    <div className="bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100 text-center w-full">
                                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 text-center">Score</p>
                                      <p className="text-[11px] font-black text-blue-600 truncate text-center">{data.confidence}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCase(c.id); }}
                                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-all">Διαγραφή</button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm font-medium">Δεν βρέθηκαν περιστατικά.</p>
                          </div>
                        )}
                      </div>
                    </div>
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

                      {/* Tag filter */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <button
                          onClick={() => setFilterTag('')}
                          className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border ${
                            !filterTag ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          Όλα
                        </button>
                        {availableTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                            className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border ${
                              filterTag === tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                        {medicalCases.length > 0 ? (
                            medicalCases.filter((m: any) => {
                              if (!filterTag) return true;
                              const caseTags = m.tags ? m.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
                              return caseTags.includes(filterTag);
                            }).map((m: any) => {
                              // --- ΑΥΤΟ ΕΙΝΑΙ ΤΟ LOGIC ΠΟΥ ΞΕΡΟΥΜΕ ΟΤΙ ΛΕΙΤΟΥΡΓΕΙ ---
                              let data: any = { diagnosis: "Προβολή...", confidence: "N/A" };
                              try {
                                // Αν το νέο περιστατικό είναι JSON, το διαβάζουμε σωστά
                                const parsed = JSON.parse(m.diagnosis);
                                data = {
                                  diagnosis: parsed.diagnosis,
                                  confidence: parsed.confidence
                                };
                              } catch (e) {
                                // Fallback για τα παλιά περιστατικά που ήταν απλό κείμενο
                                data = {
                                  diagnosis: m.diagnosis.split('\n')[0].replace("ΔΙΑΓΝΩΣΗ:", "").replace(/\*\*/g, '').trim(),
                                  confidence: "N/A"
                                };
                              }

                              return (
                                  <div
                                      key={m.id}
                                      onClick={() => loadCaseIntoAI(m)}
                                      className={`group cursor-pointer bg-white border rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 ${
                                        currentCaseId === m.id ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-100'
                                      }`}
                                  >
                                    <div className="flex items-center gap-6 text-left">
                                      {/* Στήλη 1: Ημερομηνία */}
                                      <div className="w-28 flex-shrink-0 text-left">
                                        <p className="text-[11px] font-bold text-slate-400 mb-1">
                                          {new Date(m.date).toLocaleDateString('el-GR')}
                                        </p>
                                        <span className="inline-block px-2 py-1 bg-blue-50 text-[9px] font-bold text-blue-600 rounded-md uppercase border border-blue-100/50 leading-none">
                        {m.type || "Γενική"}
                    </span>
                                      </div>

                                      {/* Στήλη 2: Διάγνωση (Προεπισκόπηση) */}
                                      <div className="flex-1 min-w-0 border-l border-slate-50 pl-6 text-left">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1 truncate">
                                          ΕΡΩΤΗΣΗ: {m.symptoms}
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-1">
                                          {data.diagnosis}
                                        </p>
                                        {(() => {
                                          const caseTags = m.tags ? m.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
                                          return caseTags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                              {caseTags.map((tag: string) => (
                                                <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          ) : null;
                                        })()}
                                      </div>

                                      {/* Στήλη 3: Score + indicator */}
                                      <div className="w-20 flex-shrink-0 flex flex-col items-end gap-1">
                                        <div className="bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100 text-center w-full">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 text-center">Score</p>
                                          <p className="text-[11px] font-black text-blue-600 truncate text-center">
                                            {data.confidence}
                                          </p>
                                        </div>
                                        {currentCaseId === m.id && (
                                          <span className="text-[9px] font-bold text-emerald-600">Ενεργό</span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCase(m.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-all"
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
                      {/* Header with status */}
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">AI Medical Assistant</h3>
                        {currentCaseId && (
                          <button onClick={startNewAnalysis} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition">
                            ✕ Νέα Ανάλυση
                          </button>
                        )}
                      </div>

                      {/* Active case indicator */}
                      {currentCaseId && (
                        <div className="text-[10px] text-emerald-600 font-bold mb-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                          Σε εξέλιξη: Περιστατικό #{currentCaseId} — {conversation.length} ερώτηση{conversation.length !== 1 ? 'εις' : ''}
                        </div>
                      )}

                      {/* Tag editor (only when a case is loaded) */}
                      {currentCaseId && (
                        <div className="mb-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Ετικέτες</p>
                            <button
                              onClick={handleSaveTags}
                              className="text-[9px] font-bold text-blue-600 hover:text-blue-800 transition"
                            >
                              ✓ Αποθήκευση
                            </button>
                          </div>
                          {/* Selected tags (all tags with × to remove) */}
                          {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {selectedTags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white border border-blue-600">
                                  {tag}
                                  <button
                                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                                    className="text-white/70 hover:text-white leading-none"
                                  >×</button>
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Unselected predefined tags (click to add) */}
                          {availableTags.filter(t => !selectedTags.includes(t)).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {availableTags.filter(t => !selectedTags.includes(t)).map(tag => (
                                <div key={tag} className="inline-flex items-center gap-0.5">
                                  {editingTag === tag ? (
                                    <input
                                      value={editTagValue}
                                      onChange={e => setEditTagValue(e.target.value)}
                                      onBlur={() => handleRenameTag(tag)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') { e.preventDefault(); handleRenameTag(tag); }
                                        if (e.key === 'Escape') setEditingTag(null);
                                      }}
                                      className="w-20 px-1 py-0.5 text-[9px] border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-200"
                                      autoFocus
                                    />
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => setSelectedTags(prev => [...prev, tag])}
                                        className="px-2 py-1 rounded-lg text-[9px] font-bold border bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600 transition-all"
                                      >
                                        + {tag}
                                      </button>
                                      <button
                                        onClick={() => { setEditingTag(tag); setEditTagValue(tag); }}
                                        className="text-[9px] text-slate-300 hover:text-blue-500 transition-colors"
                                        title="Μετονομασία"
                                      >✎</button>
                                      <button
                                        onClick={() => handleDeleteTag(tag)}
                                        className="text-[9px] text-slate-300 hover:text-red-500 transition-colors"
                                        title="Διαγραφή"
                                      >✕</button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Add custom tag */}
                          <div className="flex gap-1.5">
                            <input
                              value={customTagInput}
                              onChange={e => setCustomTagInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
                              className="flex-1 min-w-0 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-blue-200 bg-white"
                              placeholder="Νέα ετικέτα..."
                            />
                            <button
                              onClick={handleAddCustomTag}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold text-slate-600 transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CONVERSATION HISTORY */}
                      {conversation.length > 0 && (
                        <div className="mb-6 max-h-[420px] overflow-y-auto space-y-4 pr-1 custom-scrollbar border border-slate-100 rounded-2xl p-3 bg-slate-50/30">
                          {conversation.map((entry: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              {/* Question bubble */}
                              <div className="flex justify-end">
                                <div className="bg-blue-50 p-3 rounded-2xl rounded-br-md max-w-[92%] border border-blue-100">
                                  <p className="text-[9px] font-bold text-blue-500 uppercase mb-1">Ερ. {idx + 1} • {entry.type}</p>
                                  <p className="text-xs text-slate-700">{entry.question}</p>
                                </div>
                              </div>
                              {/* Full Answer Card */}
                              {(() => {
                                let d: any = { diagnosis: entry.answer };
                                try { d = JSON.parse(entry.answer); } catch (e) {}
                                return (
                                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Diagnosis header */}
                                    <div className="p-4 border-b border-slate-50">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Διάγνωση</p>
                                          <h4 className="text-sm font-bold text-slate-800">{d.diagnosis}</h4>
                                        </div>
                                        <div className="text-right ml-2 shrink-0">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">Score</p>
                                          <span className="text-sm font-black text-blue-600">{d.confidence}</span>
                                        </div>
                                      </div>
                                      {d.analysis && (
                                        <p className="text-[11px] text-slate-500 italic mt-2 leading-relaxed">{d.analysis}</p>
                                      )}
                                    </div>
                                    {/* Recommendations & Red Flags */}
                                    {(d.recommendations?.length > 0 || d.red_flags?.length > 0) && (
                                      <div className="grid grid-cols-2 gap-px bg-slate-100">
                                        {d.recommendations?.length > 0 && (
                                          <div className="bg-emerald-50/60 p-3">
                                            <h5 className="text-[9px] font-bold text-emerald-700 uppercase mb-2">📋 Προτάσεις</h5>
                                            <ul className="space-y-1">
                                              {d.recommendations.map((rec: string, ri: number) => (
                                                <li key={ri} className="flex items-start gap-1.5 text-[10px] text-emerald-900/80">
                                                  <span className="mt-0.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0"></span>
                                                  {rec}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {d.red_flags?.length > 0 && (
                                          <div className="bg-rose-50/60 p-3">
                                            <h5 className="text-[9px] font-bold text-rose-700 uppercase mb-2">⚠️ Red Flags</h5>
                                            <ul className="space-y-1">
                                              {d.red_flags.map((flag: string, fi: number) => (
                                                <li key={fi} className="flex items-start gap-1.5 text-[10px] text-rose-900/80">
                                                  <span className="mt-0.5 w-1 h-1 rounded-full bg-rose-400 shrink-0"></span>
                                                  {flag}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Input area */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Τύπος Ανάλυσης</label>
                          <select
                            className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none transition"
                            value={aiQueryType}
                            onChange={(e) => setAiQueryType(e.target.value)}
                          >
                            <option>Γενική Ερώτηση</option>
                            <option>Ανάλυση Συμπτωμάτων</option>
                            <option>Πρόγνωση Παθήσεων</option>
                            <option>Προτάσεις Θεραπείας</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Περιγραφή</label>
                          <textarea
                            className="w-full p-4 border border-slate-200 rounded-2xl h-32 focus:ring-2 focus:ring-blue-100 outline-none transition bg-slate-50"
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

                      {/* CURRENT AI RESULT (pending save) */}
                      {pendingDiagnosis && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {typeof pendingDiagnosis === 'object' ? (
                            <div className="space-y-6">
                              {/* Diagnosis Card */}
                              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Νέο Αποτέλεσμα AI</p>
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

                              {/* Tag selector */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ετικέτες</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {availableTags.map(tag => (
                                    <button
                                      key={tag}
                                      onClick={() => setSelectedTags(prev =>
                                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                      )}
                                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                        selectedTags.includes(tag)
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={handleSaveCase}
                                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition shadow-xl flex items-center justify-center gap-2"
                              >
                                ✓ {currentCaseId ? 'Προσθήκη στο Περιστατικό' : 'Επιβεβαίωση & Αποθήκευση'}
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
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-slate-50 w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center text-left">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded-md uppercase border border-blue-100/50">
              {selectedCase.type}
            </span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        • {new Date(selectedCase.date).toLocaleString('el-GR')}
                      </p>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 text-left">Λεπτομέρειες Εγγραφής</h3>
                  </div>
                  <button onClick={() => setSelectedCase(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 transition-all">✕</button>
                </div>

                <div className="p-8 max-h-[75vh] overflow-y-auto space-y-6 custom-scrollbar text-left">
                  {/* Tags */}
                  {(() => {
                    const modalTags = selectedCase.tags ? selectedCase.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
                    return modalTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {modalTags.map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  {/* Ενότητα Συμπτωμάτων */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Συμπτώματα</h4>
                    <p className="text-slate-700 italic text-left">"{selectedCase.symptoms}"</p>
                  </div>

                  {(() => {
                    let data;
                    try {
                      // Μετατρέπουμε το αποθηκευμένο string πάλι σε αντικείμενο
                      data = JSON.parse(selectedCase.diagnosis);
                    } catch (e) {
                      // Για παλιά δεδομένα που δεν ήταν JSON, τα δείχνουμε ως απλό κείμενο
                      return <div className="p-6 bg-white rounded-3xl border whitespace-pre-wrap text-slate-600">{selectedCase.diagnosis}</div>;
                    }

                    return (
                        <div className="space-y-6 text-left">
                          {/* Κύρια Κάρτα Διάγνωσης (Mirror του AI Result) */}
                          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden text-left">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                            <div className="flex justify-between items-start mb-4 text-left">
                              <div className="text-left">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 text-left">Αποτελέσματα AI</p>
                                <h3 className="text-2xl font-bold text-slate-800 text-left">{data.diagnosis}</h3>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Confidence</p>
                                <span className="text-lg font-black text-blue-600">{data.confidence}</span>
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4 text-left italic">
                              {data.analysis}
                            </p>
                          </div>

                          {/* Grid για Recommendations & Red Flags */}
                          <div className="grid md:grid-cols-2 gap-6 text-left">
                            {/* ΠΡΟΤΑΣΕΙΣ */}
                            <div className="bg-emerald-50/60 rounded-[32px] p-6 border border-emerald-100/50 text-left">
                              <h4 className="text-emerald-700 font-bold mb-4 text-sm uppercase text-left flex items-center gap-2">
                                <span className="bg-white w-7 h-7 flex items-center justify-center rounded-lg shadow-sm text-sm">📋</span> Προτάσεις
                              </h4>
                              <ul className="space-y-2 text-left">
                                {data.recommendations?.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-emerald-900/80 text-left">
                                      <span className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0"></span>
                                      {rec}
                                    </li>
                                ))}
                              </ul>
                            </div>

                            {/* RED FLAGS */}
                            <div className="bg-rose-50/60 rounded-[32px] p-6 border border-rose-100/50 text-left">
                              <h4 className="text-rose-700 font-bold mb-4 text-sm uppercase text-left flex items-center gap-2">
                                <span className="bg-white w-7 h-7 flex items-center justify-center rounded-lg shadow-sm text-sm">⚠️</span> Red Flags
                              </h4>
                              <ul className="space-y-2 text-left">
                                {data.red_flags?.map((flag, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-rose-900/80 text-left">
                                      <span className="mt-1 w-1 h-1 rounded-full bg-rose-400 shrink-0"></span>
                                      {flag}
                                    </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                    );
                  })()}
                </div>

                <div className="p-8 bg-white border-t text-right">
                  <button onClick={() => setSelectedCase(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
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
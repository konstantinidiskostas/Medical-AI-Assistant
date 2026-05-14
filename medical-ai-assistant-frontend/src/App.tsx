import { useState, useEffect, useRef } from 'react';
import LoginForm from './components/LoginForm';
import type { RegisterData } from './components/LoginForm';
import CaseModal from './components/CaseModal';
// Σημείωση: ConversationHistory, TagFilter, DiagnosisAnswerCard
// χρησιμοποιούνται στα AdminPanel και PatientDetailsView
import AdminPanel from './components/AdminPanel';
import PatientDetailsView from './components/PatientDetailsView';
import { API_BASE_URL, getAuthHeaders, apiFetch } from './utils/api';

/**
 * ================================================================
 * Ιατρικός Βοηθός AI — Frontend (React + TypeScript)
 * ================================================================
 *
 * ΚΕΝΤΡΙΚΟ COMPONENT: Διαχειρίζεται όλη την κατάσταση (state)
 * της εφαρμογής και συντονίζει τα υπο-components.
 *
 * Τα υπο-components βρίσκονται πλέον σε ξεχωριστά αρχεία:
 * - LoginForm: φόρμα σύνδεσης/εγγραφής
 * - CaseModal: modal προβολής περιστατικού
 * - ConversationHistory: chat bubbles με διαγνώσεις
 * - TagFilter: κουμπιά φιλτραρίσματος ετικετών
 * - DiagnosisAnswerCard: κάρτα αποτελέσματος AI
 *
 * ΡΟΗ ΛΕΙΤΟΥΡΓΙΑΣ:
 * 1. Ο χρήστης συνδέεται (login) → παίρνει JWT
 * 2. Βλέπει το dashboard (γιατρός) ή admin panel
 * 3. Δημιουργεί/βλέπει ασθενείς, περιστατικά, AI διάγνωση
 * 4. Αποσυνδέεται (logout) → διαγράφονται τα στοιχεία σύνδεσης
 */

function App() {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jwtToken'));
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('app_view') || 'dashboard');
  // ΣΗΜΕΙΩΣΗ: Ο ρόλος χρήστη αποθηκεύεται/διαβάζεται απευθείας από το localStorage
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
  const [amkaFilter, setAmkaFilter] = useState('');
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

  // Πλοήγηση ιστορικού browser (πίσω/εμπρός κουμπιά)
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

  // Φόρμα ασθενή (όνομα, επώνυμο, ΑΜΚΑ, ηλικία, φύλο, τηλέφωνο)
  const [pFirstName, setPFirstName] = useState('');
  const [pLastName, setPLastName] = useState('');
  const [patientAmka, setPatientAmka] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientTelephone, setPatientTelephone] = useState('');

  // --- Loading States ---
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [casesLoading, setCasesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const Spinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  // --- Helpers ---

  useEffect(() => { localStorage.setItem('app_view', currentView); }, [currentView]);
  useEffect(() => {
    if (selectedPatient) localStorage.setItem('selected_patient', JSON.stringify(selectedPatient));
    else localStorage.removeItem('selected_patient');
  }, [selectedPatient]);

  // --- API Calls ---
  // =====================
  // ΦΟΡΤΩΣΗ ΔΕΔΟΜΕΝΩΝ (Data Fetching)
  // =====================
  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/patients/doctor/${doctorId}`, { headers: getAuthHeaders() });
      if (response.ok) setPatients(await response.json());
    } catch (error) { console.error("Σφάλμα φόρτωσης ασθενών:", error); }
    finally { setPatientsLoading(false); }
  };
  const fetchAdminPatients = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/patients`, { headers: getAuthHeaders() });
      if (response.ok) setAdminPatients(await response.json());
    } catch (error) { console.error("Σφάλμα φόρτωσης όλων των ασθενών:", error); }
  };

  const fetchAdminCases = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/medical-cases`, { headers: getAuthHeaders() });
      if (response.ok) setAdminCases(await response.json());
    } catch (error) { console.error("Σφάλμα φόρτωσης περιστατικών:", error); }
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
      const response = await apiFetch(`${API_BASE_URL}/api/users`, { headers: getAuthHeaders() });
      if (response.ok) setAllUsers(await response.json());
    } catch (error) { console.error("Σφάλμα φόρτωσης χρηστών:", error); }
  };
  const fetchPendingUsers = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/users/pending`, { headers: getAuthHeaders() });
      if (response.ok) setAllPendingUsers(await response.json());
    } catch (error) { console.error("Σφάλμα φόρτωσης εκκρεμών:", error); }
  };

  const fetchMedicalCases = async (patientId: number) => {
    setCasesLoading(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/medical-cases/patient/${patientId}`, { headers: getAuthHeaders() });
      if (response.ok) setMedicalCases(await response.json());
    } catch (error) { console.error("Σφάλμα φόρτωσης περιστατικών:", error); }
    finally { setCasesLoading(false); }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/users/approve/${userId}`, { method: 'PUT', headers: getAuthHeaders() });
      if (response.ok) fetchPendingUsers();
    } catch (error) { alert('Σφάλμα έγκρισης'); }
  };

  /** Είσοδος χρήστη: καλείται από το LoginForm με τα στοιχεία */
  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        const user = data?.user;
        if (!user) { alert('Σφάλμα: άκυρη απάντηση από τον server.'); return; }

        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('doctorId', user.id);
        localStorage.setItem('userRole', user.role);
        // Ο ρόλος αποθηκεύεται στο localStorage, χρησιμοποιείται για ελέγχους πρόσβασης
        setDoctorId(user.id);
        setIsLoggedIn(true);

        const role = (user.role || '').toLowerCase();
        if (role === 'admin') {
          setCurrentView('admin-dashboard');
          localStorage.setItem('app_view', 'admin-dashboard');
        } else {
          setCurrentView('patients');
          localStorage.setItem('app_view', 'patients');
        }
      } else alert('Λάθος στοιχεία');
    } catch (error) { alert('Σφάλμα σύνδεσης'); }
  };

  /** Εγγραφή νέου χρήστη: καλείται από το LoginForm */
  const handleRegister = async (data: RegisterData) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) { alert('Επιτυχής Εγγραφή!'); }
      else alert('Σφάλμα εγγραφής.');
    } catch (error) { alert('Σφάλμα δικτύου.'); }
  };

  /** Αποσύνδεση: διαγράφει μόνο τα κλειδιά αυθεντικοποίησης (όχι ρυθμίσεις) */
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('app_view');
    localStorage.removeItem('selected_patient');
    setIsLoggedIn(false);
    // Ο ρόλος διαγράφεται από το localStorage στο removeItem πιο πάνω
    setDoctorId(null);
    setCurrentView('dashboard');
    setSelectedPatient(null);
  };

  const handleAddPatient = async () => {
    if (!pFirstName || !pLastName || !patientAmka || !patientAge || !patientGender || !patientTelephone) { alert("Παρακαλώ συμπληρώστε όλα τα πεδία."); return; }
    if (!/^\d{11}$/.test(patientAmka)) { alert("Το ΑΜΚΑ πρέπει να είναι 11 ψηφία."); return; }

    setActionLoading(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ firstName: pFirstName, lastName: pLastName, amka: patientAmka, age: parseInt(patientAge), gender: patientGender, telephone: patientTelephone }),
      });
      if (response.ok) { alert('Προστέθηκε επιτυχώς!'); fetchPatients(); clearPatientForm(); }
    } catch (error) { alert('Σφάλμα κατά την προσθήκη.'); }
    finally { setActionLoading(false); }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;
    setActionLoading(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/patients/${editingPatient.patientId}`, {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({ firstName: pFirstName, lastName: pLastName, amka: patientAmka, age: parseInt(patientAge) || 0, gender: patientGender, telephone: patientTelephone }),
      });
      if (response.ok) { alert('Ενημερώθηκε!'); setEditingPatient(null); clearPatientForm(); fetchPatients(); fetchAdminPatients(); }
    } catch (error) { alert('Σφάλμα ενημέρωσης.'); }
    finally { setActionLoading(false); }
  };

  const handleDeletePatient = async (id: number) => {
    if (!window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτόν τον ασθενή;")) {
      return;
    }
    setActionLoading(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/patients/${id}`, {
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
    } finally { setActionLoading(false); }
  };

  const handleAskAI = async () => {
    if (!aiQuery) return;
    setPendingDiagnosis("Ανάλυση σε εξέλιξη...");

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/ai/query`, {
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

        // Debug: βλέπουμε την απάντηση στο console (αφαιρέστε σε παραγωγή)
        // console.log("Raw AI Response:", rawText);

        if (typeof rawText === 'string') {
          // Καθαρισμός από τυχόν ```json ή ``` tags που βάζει το AI
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          try {
            const parsed = JSON.parse(cleanedText);
            // console.log("Parsed Object:", parsed);
            setPendingDiagnosis(parsed);
          } catch (e) {
            console.error("Σφάλμα ανάλυσης JSON από AI:", e);
            setPendingDiagnosis(rawText);
          }
        } else {
          setPendingDiagnosis(rawText);
        }
      }
    } catch (error) {
      console.error("Σφάλμα κλήσης AI:", error);
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
      // Προσθήκη σε υπάρχον περιστατικό (νέο ερώτημα)
      try {
        const response = await apiFetch(`${API_BASE_URL}/api/medical-cases/${currentCaseId}/conversation`, {
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
      // Δημιουργία νέου περιστατικού (πρώτο ερώτημα)
      try {
        const newConversation = [conversationEntry];
        const response = await apiFetch(`${API_BASE_URL}/api/medical-cases/save`, {
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

  /** Διαγραφή περιστατικού με επιβεβαίωση */
  const handleDeleteCase = async (caseId: number) => {
    if (!window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτό το περιστατικό από το ιστορικό;")) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/medical-cases/${caseId}`, {
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
      const response = await apiFetch(`${API_BASE_URL}/api/medical-cases/${currentCaseId}/tags`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tags: selectedTags.join(',') }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMedicalCases(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (error) {
      console.error('Σφάλμα αποθήκευσης ετικετών:', error);
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

  /** Έναρξη επεξεργασίας ασθενή: γεμίζει τη φόρμα με τα υπάρχοντα στοιχεία */
  const startEdit = (p: any) => {
    setEditingPatient(p);
    setPFirstName(p.firstName);
    setPLastName(p.lastName);
    setPatientAmka(p.amka);
    setPatientAge(String(p.age));
    setPatientGender(p.gender);
    setPatientTelephone(p.telephone);
  };

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
      const response = await apiFetch(`${API_BASE_URL}/api/users/${editingUser.id}`, {
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

  /** Διαγραφή χρήστη με επιβεβαίωση */
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτόν τον χρήστη;")) return;
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
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

  // =====================
  // RENDER: ΟΘΟΝΗ ΣΥΝΔΕΣΗΣ (LoginForm component)
  // =====================
  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800">Medical AI Assistant</h1>
          <div className="flex gap-4">

            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition">Αποσύνδεση</button>
          </div>
        </header>

        {/* ============= ΚΕΝΤΡΙΚΟ MENU (Γιατρός) ============= */}
        {currentView === 'dashboard' && (
            <div className="flex gap-4">
              <button onClick={() => setCurrentView('patients')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">Διαχείριση Ασθενών</button>
            </div>
        )}

        {/* ============= ΠΙΝΑΚΑΣ ΔΙΑΧΕΙΡΙΣΤΗ (Admin) ============= */}
        {currentView === 'admin-dashboard' && (
          <AdminPanel
            adminTab={adminTab} setAdminTab={setAdminTab}
            allUsers={allUsers} allPendingUsers={allPendingUsers}
            adminPatients={adminPatients} adminCases={adminCases}
            doctorId={doctorId}
            filterTag={filterTag} setFilterTag={setFilterTag}
            amkaFilter={amkaFilter} setAmkaFilter={setAmkaFilter}
            setSelectedCase={setSelectedCase}
            availableTags={availableTags}
            editingUser={editingUser}
            editUserFirstName={editUserFirstName} setEditUserFirstName={setEditUserFirstName}
            editUserLastName={editUserLastName} setEditUserLastName={setEditUserLastName}
            editUserEmail={editUserEmail} setEditUserEmail={setEditUserEmail}
            editUserUsername={editUserUsername} setEditUserUsername={setEditUserUsername}
            editUserRole={editUserRole} setEditUserRole={setEditUserRole}
            editingPatient={editingPatient} setEditingPatient={setEditingPatient}
            pFirstName={pFirstName} setPFirstName={setPFirstName}
            pLastName={pLastName} setPLastName={setPLastName}
            patientAmka={patientAmka} setPatientAmka={setPatientAmka}
            patientAge={patientAge} setPatientAge={setPatientAge}
            patientGender={patientGender} setPatientGender={setPatientGender}
            patientTelephone={patientTelephone} setPatientTelephone={setPatientTelephone}
            onApprove={handleApprove}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
            startEditUser={startEditUser}
            clearUserForm={clearUserForm}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
            startEdit={startEdit}
            clearPatientForm={clearPatientForm}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {/* ============= ΚΑΡΤΕΛΑ ΑΣΘΕΝΗ (Γιατρός) ============= */}
        {currentView === 'patient-details' && (
          <PatientDetailsView
            selectedPatient={selectedPatient}
            currentView={currentView} setCurrentView={setCurrentView}
            medicalCases={medicalCases}
            filterTag={filterTag} setFilterTag={setFilterTag}
            conversation={conversation}
            currentCaseId={currentCaseId}
            aiQuery={aiQuery} setAiQuery={setAiQuery}
            aiQueryType={aiQueryType} setAiQueryType={setAiQueryType}
            pendingDiagnosis={pendingDiagnosis}
            selectedTags={selectedTags} setSelectedTags={setSelectedTags}
            availableTags={availableTags}
            customTagInput={customTagInput} setCustomTagInput={setCustomTagInput}
            editingTag={editingTag} setEditingTag={setEditingTag}
            editTagValue={editTagValue} setEditTagValue={setEditTagValue}
            onAskAI={handleAskAI}
            onSaveCase={handleSaveCase}
            onDeleteCase={handleDeleteCase}
            onLoadCase={loadCaseIntoAI}
            onNewAnalysis={startNewAnalysis}
            onSaveTags={handleSaveTags}
            onAddCustomTag={handleAddCustomTag}
            onRenameTag={handleRenameTag}
            onDeleteTag={handleDeleteTag}
            casesLoading={casesLoading}
          />
        )}

        {/* ============= ΛΙΣΤΑ ΑΣΘΕΝΩΝ (Γιατρός) ============= */}
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
                <button onClick={editingPatient ? handleUpdatePatient : handleAddPatient} disabled={actionLoading}
                  className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingPatient ? 'Ενημέρωση' : 'Αποθήκευση'}
                </button>
              </div>

              <ul className="grid gap-4">
                {patientsLoading ? <Spinner /> : patients.length > 0 ? patients.map((p: any) => (
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
                )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν ασθενείς.</p>}
              </ul>

            </div>
        )}
        <CaseModal
          selectedCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onDelete={(id) => {
            handleDeleteCase(id);
            setSelectedCase(null);
          }}
        />
      </div>
  );
}

export default App;
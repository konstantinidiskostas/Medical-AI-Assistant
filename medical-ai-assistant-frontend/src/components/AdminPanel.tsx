/**
 * ================================================================
 * AdminPanel — Πίνακας Διαχειριστή (Χρήστες / Ασθενείς / Περιστατικά)
 * ================================================================
 *
 * Περιέχει τ трία tabs:
 * 1. Χρήστες: ενεργοί χρήστες + εκκρεμείς εγκρίσεις
 * 2. Ασθενείς: όλοι οι ασθενείς (όλων των γιατρών)
 * 3. Περιστατικά: όλα τα περιστατικά (με φίλτρα ετικετών και ΑΜΚΑ)
 *
 * Λαμβάνει όλα τα state και handlers από το App.tsx ως props.
 */

import TagFilter from './TagFilter';

interface Props {
  adminTab: string;
  setAdminTab: (tab: string) => void;
  allUsers: any[];
  allPendingUsers: any[];
  adminPatients: any[];
  adminCases: any[];
  doctorId: number | null;
  filterTag: string;
  setFilterTag: (tag: string) => void;
  amkaFilter: string;
  setAmkaFilter: (amka: string) => void;
  setSelectedCase: (c: any) => void;
  availableTags: string[];
  editingUser: any;
  editUserFirstName: string; setEditUserFirstName: (v: string) => void;
  editUserLastName: string; setEditUserLastName: (v: string) => void;
  editUserEmail: string; setEditUserEmail: (v: string) => void;
  editUserUsername: string; setEditUserUsername: (v: string) => void;
  editUserRole: string; setEditUserRole: (v: string) => void;
  editingPatient: any;
  setEditingPatient: (p: any) => void;
  pFirstName: string; setPFirstName: (v: string) => void;
  pLastName: string; setPLastName: (v: string) => void;
  patientAmka: string; setPatientAmka: (v: string) => void;
  patientAge: string; setPatientAge: (v: string) => void;
  patientGender: string; setPatientGender: (v: string) => void;
  patientTelephone: string; setPatientTelephone: (v: string) => void;
  onApprove: (id: number) => void;
  onDeleteUser: (id: number) => void;
  onUpdateUser: () => void;
  startEditUser: (u: any) => void;
  clearUserForm: () => void;
  onUpdatePatient: () => void;
  onDeletePatient: (id: number) => void;
  startEdit: (p: any) => void;
  clearPatientForm: () => void;
  onDeleteCase: (id: number) => void;
}

export default function AdminPanel(props: Props) {
  const {
    adminTab, setAdminTab,
    allUsers, allPendingUsers, adminPatients, adminCases,
    doctorId, filterTag, setFilterTag, amkaFilter, setAmkaFilter,
    setSelectedCase, availableTags,
    editingUser,
    editUserFirstName, setEditUserFirstName,
    editUserLastName, setEditUserLastName,
    editUserEmail, setEditUserEmail,
    editUserUsername, setEditUserUsername,
    editUserRole, setEditUserRole,
    editingPatient, setEditingPatient,
    pFirstName, setPFirstName,
    pLastName, setPLastName,
    patientAmka, setPatientAmka,
    patientAge, setPatientAge,
    patientGender, setPatientGender,
    patientTelephone, setPatientTelephone,
    onApprove, onDeleteUser, onUpdateUser,
    startEditUser, clearUserForm,
    onUpdatePatient, onDeletePatient,
    startEdit, clearPatientForm,
    onDeleteCase,
  } = props;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Tabs Menu */}
      <div className="flex gap-4 border-b border-slate-200 pb-4 mb-6">
        <button onClick={() => setAdminTab('users')}
          className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${adminTab === 'users' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Χρήστες</button>
        <button onClick={() => setAdminTab('patients')}
          className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${adminTab === 'patients' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Ασθενείς</button>
        <button onClick={() => setAdminTab('cases')}
          className={`px-6 py-3 rounded-xl font-bold transition shadow-sm ${adminTab === 'cases' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Περιστατικά</button>
      </div>

      {/* Tab: Χρήστες */}
      {adminTab === 'users' && (
        <div className="space-y-6">
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
                <button onClick={onUpdateUser} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700">Ενημέρωση</button>
                <button onClick={clearUserForm} className="bg-slate-200 text-slate-600 px-8 py-3 rounded-xl font-semibold hover:bg-slate-300">Ακύρωση</button>
              </div>
            </div>
          )}

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
                    <button onClick={() => onDeleteUser(u.id)} className="text-red-500 hover:underline">Διαγραφή</button>
                  </div>
                </li>
              )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν εγγεγραμμένοι χρήστες.</p>}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-6 text-slate-700">Εκκρεμείς Εγκρίσεις ({allPendingUsers.length})</h3>
            <ul className="space-y-4">
              {allPendingUsers.length > 0 ? allPendingUsers.map((u: any) => (
                <li key={u.id} className="p-5 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg block text-slate-800">{u.firstName} {u.lastName}</span>
                    <span className="text-sm text-slate-500">@{u.username} • Ιδιότητα: Διαχειριστής (Αναμονή έγκρισης)</span>
                  </div>
                  <button onClick={() => onApprove(u.id)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-sm transition">Έγκριση</button>
                </li>
              )) : <p className="text-slate-500 font-medium">Δεν υπάρχουν νέοι χρήστες προς έγκριση.</p>}
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Ασθενείς */}
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
                <button onClick={onUpdatePatient} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700">Ενημέρωση</button>
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
                    <button onClick={() => onDeletePatient(p.patientId)} className="text-red-500 hover:underline">Διαγραφή</button>
                  </div>
                </li>
              )) : <p className="text-slate-500 font-medium">Δεν βρέθηκαν ασθενείς.</p>}
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Περιστατικά */}
      {adminTab === 'cases' && (() => {
        const filteredCases = adminCases.filter((c: any) => {
          if (!filterTag && !amkaFilter) return true;
          if (filterTag) {
            const caseTags = c.tags ? c.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
            if (!caseTags.includes(filterTag)) return false;
          }
          if (amkaFilter) {
            const patientAmkaVal = c.patient?.amka || '';
            if (!patientAmkaVal.toLowerCase().includes(amkaFilter.toLowerCase())) return false;
          }
          return true;
        });
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6 text-slate-700 flex justify-between items-center">
                Όλα τα Περιστατικά
                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-medium">{filteredCases.length} εγγραφές</span>
              </h3>

              <div className="mb-4">
                <input type="text" placeholder="Αναζήτηση με ΑΜΚΑ..."
                  value={amkaFilter} onChange={e => setAmkaFilter(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" />
              </div>

              <TagFilter tags={availableTags} selectedTag={filterTag} onSelectTag={setFilterTag} />

              <div className="grid gap-4">
                {filteredCases.length > 0 ? (
                  filteredCases.map((c: any) => {
                    let data: any = { diagnosis: "Προβολή...", confidence: "N/A" };
                    try { const p = JSON.parse(c.diagnosis); data = { diagnosis: p.diagnosis, confidence: p.confidence }; }
                    catch (e) { data = { diagnosis: c.diagnosis.split('\n')[0].replace("ΔΙΑΓΝΩΣΗ:", "").replace(/\*\*/g, '').trim(), confidence: "N/A" }; }

                    const caseTags = c.tags ? c.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];

                    return (
                      <div key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className="group cursor-pointer bg-white border rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 border-slate-100">
                        <div className="flex items-center gap-6 text-left">
                          <div className="w-28 flex-shrink-0 text-left">
                            <p className="text-[11px] font-bold text-slate-400 mb-1">
                              {new Date(c.date).toLocaleDateString('el-GR')}
                            </p>
                            <span className="inline-block px-2 py-1 bg-blue-50 text-[9px] font-bold text-blue-600 rounded-md uppercase border border-blue-100/50 leading-none">
                              {c.type || "Γενική"}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 border-l border-slate-50 pl-6 text-left">
                            {c.patient && (
                              <p className="text-[10px] text-slate-500 font-semibold mb-1">
                                {c.patient.firstName} {c.patient.lastName} — ΑΜΚΑ: {c.patient.amka}
                              </p>
                            )}
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

                          <div className="w-20 flex-shrink-0 flex flex-col items-end gap-1">
                            <div className="bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100 text-center w-full">
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 text-center">Score</p>
                              <p className="text-[11px] font-black text-blue-600 truncate text-center">{data.confidence}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteCase(c.id); }}
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
        );
      })()}
    </div>
  );
}

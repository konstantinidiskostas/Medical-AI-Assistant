/**
 * ================================================================
 * PatientDetailsView — Καρτέλα ασθενή με AI Assistant
 * ================================================================
 *
 * Δύο στήλες:
 * - Αριστερή: προφίλ ασθενή + ιστορικό περιστατικών
 * - Δεξιά: AI Assistant (συνομιλία, διαγνώσεις, ετικέτες)
 *
 * Λαμβάνει state και handlers από το App.tsx.
 */

import TagFilter from './TagFilter';
import ConversationHistory from './ConversationHistory';
import DiagnosisAnswerCard from './DiagnosisAnswerCard';

interface Props {
  selectedPatient: any;
  currentView: string;
  setCurrentView: (v: string) => void;
  medicalCases: any[];
  filterTag: string;
  setFilterTag: (t: string) => void;
  conversation: any[];
  currentCaseId: number | null;
  aiQuery: string;
  setAiQuery: (q: string) => void;
  aiQueryType: string;
  setAiQueryType: (t: string) => void;
  pendingDiagnosis: any;
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  availableTags: string[];
  customTagInput: string;
  setCustomTagInput: (v: string) => void;
  editingTag: string | null;
  setEditingTag: (t: string | null) => void;
  editTagValue: string;
  setEditTagValue: (v: string) => void;
  onAskAI: () => void;
  onSaveCase: () => void;
  onDeleteCase: (id: number) => void;
  onLoadCase: (caseData: any) => void;
  onNewAnalysis: () => void;
  onSaveTags: () => void;
  onAddCustomTag: () => void;
  onRenameTag: (oldTag: string) => void;
  onDeleteTag: (tag: string) => void;
  casesLoading: boolean;
}

export default function PatientDetailsView(props: Props) {
  const {
    selectedPatient, setCurrentView,
    medicalCases, filterTag, setFilterTag,
    conversation, currentCaseId,
    aiQuery, setAiQuery, aiQueryType, setAiQueryType,
    pendingDiagnosis,
    selectedTags, setSelectedTags,
    availableTags, customTagInput, setCustomTagInput,
    editingTag, setEditingTag, editTagValue, setEditTagValue,
    onAskAI, onSaveCase, onDeleteCase, onLoadCase,
    onNewAnalysis, onSaveTags, onAddCustomTag,
    onRenameTag, onDeleteTag,
    casesLoading,
  } = props;

  const Spinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  if (!selectedPatient) {
    return (
      <div className="grid md:grid-cols-2 gap-8 font-sans p-6">
        <div className="col-span-2 text-center p-20 bg-white rounded-3xl border border-slate-100">
          <p className="text-lg font-bold text-slate-500 italic">Επιλέξτε έναν ασθενή για να δείτε το ιστορικό του...</p>
          <button onClick={() => setCurrentView('patients')} className="mt-4 text-blue-600 font-bold hover:underline">Επιστροφή στη λίστα</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 font-sans p-6">
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

        <TagFilter tags={availableTags} selectedTag={filterTag} onSelectTag={setFilterTag} />

        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
          {casesLoading ? <Spinner /> : medicalCases.length > 0 ? (
            medicalCases.filter((m: any) => {
              if (!filterTag) return true;
              const caseTags = m.tags ? m.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
              return caseTags.includes(filterTag);
            }).map((m: any) => {
              let data: any = { diagnosis: "Προβολή...", confidence: "N/A" };
              try {
                const parsed = JSON.parse(m.diagnosis);
                data = { diagnosis: parsed.diagnosis, confidence: parsed.confidence };
              } catch (e) {
                data = {
                  diagnosis: m.diagnosis.split('\n')[0].replace("ΔΙΑΓΝΩΣΗ:", "").replace(/\*\*/g, '').trim(),
                  confidence: "N/A"
                };
              }

              return (
                <div
                  key={m.id}
                  onClick={() => onLoadCase(m)}
                  className={`group cursor-pointer bg-white border rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 ${
                    currentCaseId === m.id ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-6 text-left">
                    <div className="w-28 flex-shrink-0 text-left">
                      <p className="text-[11px] font-bold text-slate-400 mb-1">
                        {new Date(m.date).toLocaleDateString('el-GR')}
                      </p>
                      <span className="inline-block px-2 py-1 bg-blue-50 text-[9px] font-bold text-blue-600 rounded-md uppercase border border-blue-100/50 leading-none">
                        {m.type || "Γενική"}
                      </span>
                    </div>

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
                          onDeleteCase(m.id);
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">AI Medical Assistant</h3>
          {currentCaseId && (
            <button onClick={onNewAnalysis} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition">
              ✕ Νέα Ανάλυση
            </button>
          )}
        </div>

        {currentCaseId && (
          <div className="text-[10px] text-emerald-600 font-bold mb-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            Σε εξέλιξη: Περιστατικό #{currentCaseId} — {conversation.length} ερώτηση{conversation.length !== 1 ? 'εις' : ''}
          </div>
        )}

        {/* Tag editor */}
        {currentCaseId && (
          <div className="mb-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Ετικέτες</p>
              <button onClick={onSaveTags} className="text-[9px] font-bold text-blue-600 hover:text-blue-800 transition">
                ✓ Αποθήκευση
              </button>
            </div>
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
            {availableTags.filter(t => !selectedTags.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {availableTags.filter(t => !selectedTags.includes(t)).map(tag => (
                  <div key={tag} className="inline-flex items-center gap-0.5">
                    {editingTag === tag ? (
                      <input
                        value={editTagValue}
                        onChange={e => setEditTagValue(e.target.value)}
                        onBlur={() => onRenameTag(tag)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); onRenameTag(tag); }
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
                          onClick={() => onDeleteTag(tag)}
                          className="text-[9px] text-slate-300 hover:text-red-500 transition-colors"
                          title="Διαγραφή"
                        >✕</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddCustomTag(); } }}
                className="flex-1 min-w-0 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-blue-200 bg-white"
                placeholder="Νέα ετικέτα..."
              />
              <button
                onClick={onAddCustomTag}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold text-slate-600 transition"
              >+</button>
            </div>
          </div>
        )}

        <ConversationHistory conversations={conversation} maxHeight="420px" />

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
            onClick={onAskAI}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            Έναρξη Ανάλυσης
          </button>
        </div>

        {pendingDiagnosis && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {typeof pendingDiagnosis === 'object' ? (
              <div className="space-y-6">
                <DiagnosisAnswerCard data={pendingDiagnosis} />

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
                  onClick={onSaveCase}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition shadow-xl flex items-center justify-center gap-2"
                >
                  ✓ {currentCaseId ? 'Προσθήκη στο Περιστατικό' : 'Επιβεβαίωση & Αποθήκευση'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-slate-500 text-xs font-medium">{pendingDiagnosis}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

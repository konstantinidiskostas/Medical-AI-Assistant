/**
 * ================================================================
 * CaseModal — Modal προβολής πλήρους περιστατικού (Admin)
 * ================================================================
 *
 * Εμφανίζεται όταν ο admin κάνει κλικ σε ένα περιστατικό.
 * Περιέχει:
 * - Header: ημερομηνία, τύπος, στοιχεία ασθενή
 * - Ετικέτες
 * - Ιστορικό συνομιλίας (chat bubbles με διαγνώσεις)
 *
 * Χρησιμοποιεί το ConversationHistory για την προβολή
 * του ιστορικού.
 */

import type { MedicalCase } from '../types';
import ConversationHistory from './ConversationHistory';

interface Props {
  /** Το περιστατικό προς προβολή (null = κλειστό modal) */
  selectedCase: MedicalCase | null;
  /** Callback για κλείσιμο modal */
  onClose: () => void;
  /** Callback για διαγραφή περιστατικού */
  onDelete: (id: number) => void;
}

export default function CaseModal({ selectedCase, onClose, onDelete }: Props) {
  /* Αν δεν υπάρχει επιλεγμένο περιστατικό, δεν εμφανίζουμε τίποτα */
  if (!selectedCase) return null;

  /* Μετατροπή της συμβολοσειράς ετικετών σε πίνακα */
  const modalTags: string[] = selectedCase.tags
    ? selectedCase.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)
    : [];

  /* Μετατροπή του conversation από JSON string σε πίνακα εγγραφών */
  let convEntries: any[] = [];
  try {
    if (selectedCase.conversation) {
      const parsed = JSON.parse(selectedCase.conversation);
      if (Array.isArray(parsed) && parsed.length > 0) convEntries = parsed;
    }
  } catch {
    /* Αν αποτύχει, δημιουργούμε μία εγγραφή από τα βασικά πεδία */
  }
  if (convEntries.length === 0) {
    convEntries = [
      {
        question: selectedCase.symptoms,
        answer: selectedCase.diagnosis,
        type: selectedCase.type,
      },
    ];
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-50 w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
          <div className="text-left">
            {/* Τύπος + Ημερομηνία */}
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded-md uppercase border border-blue-100/50">
                {selectedCase.type}
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                • {new Date(selectedCase.date).toLocaleString('el-GR')}
              </p>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 text-left">
              Λεπτομέρειες Εγγραφής
            </h3>

            {/* Στοιχεία ασθενή */}
            {selectedCase.patient && (
              <p className="text-xs font-semibold text-slate-500 mt-1 text-left">
                {selectedCase.patient.firstName} {selectedCase.patient.lastName}{' '}
                — ΑΜΚΑ: {selectedCase.patient.amka}
              </p>
            )}
          </div>

          {/* Κουμπί κλεισίματος */}
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Σώμα modal */}
        <div className="p-8 max-h-[75vh] overflow-y-auto space-y-6 custom-scrollbar text-left">
          {/* Ετικέτες */}
          {modalTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {modalTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Ιστορικό συνομιλίας */}
          <ConversationHistory
            conversations={convEntries}
            showTitle={convEntries.length > 1}
          />
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t flex justify-between items-center">
          <button
            onClick={() => onDelete(selectedCase.id)}
            className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-all"
          >
            Διαγραφή Περιστατικού
          </button>
          <button
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
}

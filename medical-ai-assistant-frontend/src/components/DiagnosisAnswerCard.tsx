/**
 * ================================================================
 * DiagnosisAnswerCard — Κάρτα προβολής μίας απάντησης AI
 * ================================================================
 *
 * Χρησιμοποιείται σε:
 * - ConversationHistory.tsx (ιστορικό συνομιλίας)
 * - CaseModal.tsx (modal προβολής περιστατικού)
 * - App.tsx (προσωρινό αποτέλεσμα AI πριν αποθηκευτεί)
 *
 * Δέχεται ένα diagnosis αντικείμενο (JSON parsed) και
 * το εμφανίζει με σταθερό layout:
 * - Διάγνωση + Score (πάνω)
 * - Ανάλυση (μεσαίο)
 * - Προτάσεις + Red Flags (κάτω, διπλή στήλη)
 */

import type { Diagnosis } from '../types';

interface Props {
  /** Το parsed αντικείμενο διάγνωσης */
  data: Diagnosis;
  /** Αν θέλουμε να κρύψουμε το header label (π.χ. "Διάγνωση") */
  hideHeader?: boolean;
}

export default function DiagnosisAnswerCard({ data, hideHeader = false }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="text-left">
        {/* Header: Διάγνωση (αριστερά) + Score (δεξιά) */}
        <div className="p-4 border-b border-slate-50">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              {!hideHeader && (
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Διάγνωση</p>
              )}
              <h4 className="text-sm font-bold text-slate-800">{data.diagnosis}</h4>
            </div>
            {data.confidence != null && data.confidence !== '' && (
              <div className="text-right ml-2 shrink-0">
                <p className="text-[8px] font-bold text-slate-400 uppercase">Score</p>
                <span className="text-sm font-black text-blue-600">{data.confidence}</span>
              </div>
            )}
          </div>
          {/* Ανάλυση (περιγραφή) */}
          {data.analysis && (
            <p className="text-[11px] text-slate-500 italic mt-2 leading-relaxed">
              {data.analysis}
            </p>
          )}
        </div>

        {/* Κάτω μέρος: Προτάσεις | Red Flags (διπλή στήλη) */}
        {(data.recommendations && data.recommendations.length > 0) ||
        (data.red_flags && data.red_flags.length > 0) ? (
          <div className="grid grid-cols-2 gap-px bg-slate-100">
            {/* Προτάσεις */}
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="bg-emerald-50/60 p-3">
                <h5 className="text-[9px] font-bold text-emerald-700 uppercase mb-2">
                  📋 Προτάσεις
                </h5>
                <ul className="space-y-1">
                  {data.recommendations.map((rec, ri) => (
                    <li
                      key={ri}
                      className="flex items-start gap-1.5 text-[10px] text-emerald-900/80"
                    >
                      <span className="mt-0.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Red Flags */}
            {data.red_flags && data.red_flags.length > 0 && (
              <div className="bg-rose-50/60 p-3">
                <h5 className="text-[9px] font-bold text-rose-700 uppercase mb-2">
                  ⚠️ Red Flags
                </h5>
                <ul className="space-y-1">
                  {data.red_flags.map((flag, fi) => (
                    <li
                      key={fi}
                      className="flex items-start gap-1.5 text-[10px] text-rose-900/80"
                    >
                      <span className="mt-0.5 w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

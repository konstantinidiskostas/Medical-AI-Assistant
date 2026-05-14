/**
 * ================================================================
 * ConversationHistory — Ιστορικό συνομιλίας AI
 * ================================================================
 *
 * Εμφανίζει τις ερωτήσεις και απαντήσεις ενός περιστατικού
 * σε μορφή chat (bubbles). Κάθε ερώτηση εμφανίζεται δεξιά
 * και κάθε απάντηση αριστερά (σαν διάγνωση card).
 *
 * Δέχεται:
 * - conversations: λίστα από ConversationEntry[]
 * - maxHeight: προαιρετικό ύψος για scroll
 *
 * Χρησιμοποιεί το DiagnosisAnswerCard για την προβολή
 * κάθε απάντησης.
 */

import type { ConversationEntry } from '../types';
import DiagnosisAnswerCard from './DiagnosisAnswerCard';

interface Props {
  /** Οι εγγραφές της συνομιλίας */
  conversations: ConversationEntry[];
  /** Μέγιστο ύψος του container (π.χ. "420px") */
  maxHeight?: string;
  /** Εμφάνιση τίτλου "Ιστορικό Συνομιλίας" όταν >1 εγγραφές */
  showTitle?: boolean;
}

export default function ConversationHistory({
  conversations,
  maxHeight,
  showTitle = true,
}: Props) {
  if (conversations.length === 0) return null;

  return (
    <div
      className={`mb-6 space-y-4 pr-1 custom-scrollbar border border-slate-100 rounded-2xl p-3 bg-slate-50/30 ${maxHeight ? 'overflow-y-auto' : ''}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {showTitle && conversations.length > 1 && (
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
          Ιστορικό Συνομιλίας
        </h4>
      )}

      {conversations.map((entry, idx) => {
        /* Προσπάθεια parse της απάντησης σαν JSON */
        let diagnosisData: any = { diagnosis: entry.answer };
        try {
          diagnosisData = JSON.parse(entry.answer);
        } catch {
          /* Αν δεν είναι JSON, το χρησιμοποιούμε ως απλό κείμενο */
        }

        return (
          <div key={idx} className="space-y-2">
            {/* Φούσκα ερώτησης (δεξιά στοιχισμένη) */}
            <div className="flex justify-end">
              <div className="bg-blue-50 p-3 rounded-2xl rounded-br-md max-w-[92%] border border-blue-100">
                <p className="text-[9px] font-bold text-blue-500 uppercase mb-1">
                  Ερ. {idx + 1} • {entry.type}
                </p>
                <p className="text-xs text-slate-700">{entry.question}</p>
              </div>
            </div>

            {/* Κάρτα απάντησης (αριστερά) */}
            <DiagnosisAnswerCard data={diagnosisData} />
          </div>
        );
      })}
    </div>
  );
}

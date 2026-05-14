/**
 * ================================================================
 * TagFilter — Φίλτρο επιλογής ετικετών
 * ================================================================
 *
 * Εμφανίζει κουμπιά για κάθε διαθέσιμη ετικέτα.
 * Ο χρήστης κλικάρει μία ετικέτα για να φιλτράρει.
 * Το επιλεγμένο κουμπί τονίζεται με μπλε χρώμα.
 *
 * Χρησιμοποιείται σε:
 * - Λίστα περιστατικών του admin
 * - Λίστα περιστατικού του γιατρού (αριστερή στήλη)
 */

interface Props {
  /** Διαθέσιμες ετικέτες */
  tags: string[];
  /** Ποια ετικέτα είναι επιλεγμένη (κενό = όλες) */
  selectedTag: string;
  /** Callback όταν ο χρήστης επιλέγει ετικέτα */
  onSelectTag: (tag: string) => void;
}

export default function TagFilter({ tags, selectedTag, onSelectTag }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {/* Κουμπί "Όλα" */}
      <button
        onClick={() => onSelectTag('')}
        className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border ${
          !selectedTag
            ? 'bg-slate-800 text-white border-slate-800'
            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
        }`}
      >
        Όλα
      </button>

      {/* Κουμπί για κάθε ετικέτα */}
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag === selectedTag ? '' : tag)}
          className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border ${
            selectedTag === tag
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

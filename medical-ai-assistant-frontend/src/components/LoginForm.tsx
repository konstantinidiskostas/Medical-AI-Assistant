/**
 * ================================================================
 * LoginForm — Φόρμα σύνδεσης / εγγραφής
 * ================================================================
 *
 * Διαχειρίζεται όλη τη διεπαφή αυθεντικοποίησης:
 * - Είσοδος (email/username + password)
 * - Εγγραφή (όνομα, επώνυμο, email, username, password, ρόλος)
 *
 * Η φόρμα εναλλάσσεται μεταξύ login και register.
 * Στην εγγραφή Admin εμφανίζεται προειδοποίηση για έγκριση.
 */

import { useState } from 'react';

interface Props {
  /** Callback για είσοδο */
  onLogin: (username: string, password: string) => Promise<void>;
  /** Callback για εγγραφή */
  onRegister: (data: RegisterData) => Promise<void>;
}

/** Δεδομένα φόρμας εγγραφής */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

export default function LoginForm({ onLogin, onRegister }: Props) {
  /* Κατάσταση: true = εγγραφή, false = είσοδος */
  const [isRegistering, setIsRegistering] = useState(false);

  /* State για τα πεδία */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regRole, setRegRole] = useState('');

  /** Καθαρισμός όλων των πεδίων */
  const clearFields = () => {
    setUsername('');
    setPassword('');
    setRegFirstName('');
    setRegLastName('');
    setRegEmail('');
    setRegUsername('');
    setRegPassword('');
    setRegPasswordConfirm('');
    setRegRole('');
  };

  /** Εναλλαγή login ↔ register + καθαρισμός πεδίων */
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    clearFields();
  };

  /** Υποβολή login */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  /** Υποβολή εγγραφής */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regRole) {
      alert('Επιλέξτε ιδιότητα.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      alert('Οι κωδικοί δεν ταιριάζουν.');
      return;
    }
    await onRegister({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      username: regUsername,
      password: regPassword,
      role: regRole,
    });
    /* Μετά την επιτυχή εγγραφή, επιστροφή στη φόρμα login */
    setIsRegistering(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 flex flex-col items-center">
        {/* Εικονίδιο */}
        <div className="text-6xl mb-6">🩺</div>

        {/* Τίτλος */}
        <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
          {isRegistering ? 'Εγγραφή' : 'Είσοδος'}
        </h1>

        {/* Φόρμα */}
        <form
          onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
          className="flex flex-col gap-5 w-full"
        >
          {/* --- ΠΕΔΙΑ ΕΓΓΡΑΦΗΣ --- */}
          {isRegistering && (
            <>
              {/* Όνομα / Επώνυμο */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                    Όνομα
                  </label>
                  <input
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Όνομα"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                    Επώνυμο
                  </label>
                  <input
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Επώνυμο"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="email@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              {/* Ιδιότητα (ρόλος) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                  Ιδιότητα
                </label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-100"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Επιλέξτε Ιδιότητα
                  </option>
                  <option value="Doctor">Γιατρός</option>
                  <option value="Researcher">Ερευνητής</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              {/* Προειδοποίηση Admin */}
              {regRole === 'Admin' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-sm">
                  ⚠️ <strong>Προσοχή:</strong> Οι λογαριασμοί Admin χρειάζονται
                  έγκριση.
                </div>
              )}
            </>
          )}

          {/* --- ΚΟΙΝΑ ΠΕΔΙΑ (username + password) --- */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Username
            </label>
            <input
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Username"
              value={isRegistering ? regUsername : username}
              onChange={(e) =>
                isRegistering
                  ? setRegUsername(e.target.value)
                  : setUsername(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Κωδικός
            </label>
            <input
              type="password"
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="********"
              value={isRegistering ? regPassword : password}
              onChange={(e) =>
                isRegistering
                  ? setRegPassword(e.target.value)
                  : setPassword(e.target.value)
              }
              required
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Επιβεβαίωση Κωδικού
              </label>
              <input
                type="password"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="********"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                required
              />
            </div>
          )}

          {/* Κουμπί υποβολής */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition shadow-lg mt-2"
          >
            {isRegistering ? 'Εγγραφή' : 'Είσοδος'}
          </button>
        </form>

        {/* Εναλλαγή login/register */}
        <div className="w-full mt-8 text-center text-slate-500 text-sm font-medium">
          <p>
            {isRegistering
              ? 'Έχετε ήδη λογαριασμό;'
              : 'Δεν έχετε λογαριασμό;'}{' '}
            <button
              onClick={toggleMode}
              className="text-blue-600 font-bold hover:underline ml-1"
            >
              {isRegistering ? 'Είσοδος' : 'Εγγραφή'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

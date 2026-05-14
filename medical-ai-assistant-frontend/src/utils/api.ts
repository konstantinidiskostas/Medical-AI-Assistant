/**
 * ================================================================
 * Βοηθητικές συναρτήσεις για κλήσεις API
 * ================================================================
 *
 * Περιέχει:
 * - API_BASE_URL: η διεύθυνση του backend server
 * - getAuthHeaders(): δημιουργεί headers με το JWT token
 * - apiFetch(): wrapper του fetch() με logging στο console
 *
 * Το apiFetch γράφει στο τερματικό (console):
 * 1. Τη μέθοδο και το URL κάθε κλήσης
 * 2. Το σώμα του αιτήματος (αν υπάρχει)
 * 3. Τον κωδικό απόκρισης
 * 4. Το σώμα της απόκρισης
 */

/** Η διεύθυνση του Spring Boot backend */
export const API_BASE_URL = 'http://localhost:8080';

/**
 * Δημιουργεί τα HTTP headers για αυθεντικοποίηση.
 * Διαβάζει το JWT token από το localStorage.
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Wrapper για fetch() που γράφει request + response στο console.
 *
 * Μορφή εξόδου:
 *   >>> [POST] http://localhost:8080/api/...
 *   >>> REQUEST BODY: {...}
 *   <<< 200 OK
 *   <<< RESPONSE BODY: {...}
 *
 * @param url Το URL του αιτήματος
 * @param options Οι επιλογές του fetch (method, headers, body κλπ.)
 * @returns Το αντικείμενο Response (ίδιο με το κανονικό fetch)
 */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const method = options?.method || 'GET';
  let bodyToLog = options?.body || '(κανένα)';
  if (bodyToLog instanceof ReadableStream) bodyToLog = '(ReadableStream)';
  if (bodyToLog instanceof URLSearchParams) bodyToLog = bodyToLog.toString();

  console.log(`\n>>> [${method}] ${url}`);
  if (options?.body) {
    console.log(`>>> REQUEST BODY:`, options.body);
  }

  try {
    const response = await fetch(url, options);
    const statusText = response.statusText || '(χωρίς κείμενο)';
    console.log(`<<< ${response.status} ${statusText}`);

    /* Για να διαβάσουμε το σώμα χωρίς να το "καταναλώσουμε",
       κλωνοποιούμε το response */
    const cloned = response.clone();
    try {
      const responseBody = await cloned.text();
      if (responseBody) {
        console.log(`<<< RESPONSE BODY: ${responseBody}`);
      } else {
        console.log(`<<< RESPONSE BODY: (κενό)`);
      }
    } catch {
      console.log(`<<< RESPONSE BODY: (δεν είναι κείμενο)`);
    }

    return response;
  } catch (error) {
    console.error(`<<< NETWORK ERROR:`, error);
    throw error;
  }
}

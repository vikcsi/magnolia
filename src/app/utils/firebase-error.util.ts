const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email':        'Érvénytelen e-mail cím formátum!',
  'auth/user-not-found':       'Hibás e-mail cím vagy jelszó!',
  'auth/wrong-password':       'Hibás e-mail cím vagy jelszó!',
  'auth/invalid-credential':   'Hibás e-mail cím vagy jelszó!',
  'auth/email-already-in-use': 'Ez az e-mail cím már foglalt!',
  'auth/weak-password':        'A jelszó túl gyenge! Legalább 6 karakter szükséges.',
  'auth/too-many-requests':    'Túl sok sikertelen kísérlet. Próbáld újra később!',
  'auth/requires-recent-login':'A művelethez újra be kell jelentkezned!',
  'auth/network-request-failed':'Hálózati hiba. Ellenőrizd az internetkapcsolatod!',
};

const DEFAULT_AUTH_ERROR = 'Váratlan hiba történt. Kérlek, próbáld újra!';

export function mapAuthError(error: any): string {
  return AUTH_ERROR_MESSAGES[error?.code] ?? DEFAULT_AUTH_ERROR;
}

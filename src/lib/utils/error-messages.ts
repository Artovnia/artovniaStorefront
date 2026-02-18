const backendErrorMap: Record<string, string> = {
  // Auth
  "Invalid email or password": "Nieprawidłowy adres e-mail lub hasło",
  "Unauthorized": "Brak autoryzacji",
  "Email already exists": "Konto z tym adresem e-mail już istnieje",
  "Customer with this email already exists":
    "Klient z tym adresem e-mail już istnieje",
  "Google login failed": "Logowanie przez Google nie powiodło się",
  "Unexpected response from Google authentication":
    "Nieoczekiwana odpowiedź z uwierzytelniania Google",

  // Generic
  "Internal server error": "Błąd serwera. Spróbuj ponownie później",
  "Too many requests": "Zbyt wiele prób. Spróbuj ponownie później",
  "Not found": "Nie znaleziono",
  "Bad request": "Nieprawidłowe żądanie",
};

const FALLBACK_ERROR = "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";

export function translateError(error: string): string {
  // Exact match
  if (backendErrorMap[error]) {
    return backendErrorMap[error];
  }

  // Case-insensitive match
  const lowerError = error.toLowerCase();
  for (const [key, value] of Object.entries(backendErrorMap)) {
    if (key.toLowerCase() === lowerError) {
      return value;
    }
  }

  // Partial match (e.g. "Invalid email or password" inside a longer message)
  for (const [key, value] of Object.entries(backendErrorMap)) {
    if (lowerError.includes(key.toLowerCase())) {
      return value;
    }
  }

  return FALLBACK_ERROR;
}
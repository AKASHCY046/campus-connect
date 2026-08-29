// Runtime configuration for the frontend.
//
// Campus Connect runs on a local-first data layer: every service tries the
// Spring Boot API first (see /backend) and transparently falls back to
// localStorage when the API is unavailable. No database credentials are ever
// held in the browser.
//
// This module used to hold a MongoDB client; it is kept as the single place
// that reads `import.meta.env` so the rest of the app never touches it directly.

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
    model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini",
    get enabled() {
      return !!this.apiKey;
    },
  },
} as const;

/** No-op kept for backwards compatibility with older imports. */
export const validateEnvironment = (): void => {
  /* nothing is required to run the app */
};

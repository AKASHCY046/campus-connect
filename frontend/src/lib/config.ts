// The single place that reads `import.meta.env`. Nothing here is required —
// the app runs on its local data layer with no configuration at all.

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

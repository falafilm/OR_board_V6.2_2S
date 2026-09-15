export type RuntimeConfig = {
  API_BASE_URL: string;
};

const DEFAULT_CONFIG: RuntimeConfig = {
  API_BASE_URL: "http://localhost:5000/api",
};

export function getRuntimeConfig(): RuntimeConfig {
  const win = window as any;

  if (win.RUNTIME_CONFIG && win.RUNTIME_CONFIG.API_BASE_URL) {
    return win.RUNTIME_CONFIG;
  }

  return DEFAULT_CONFIG;
}

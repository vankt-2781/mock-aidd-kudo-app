import { execFileSync } from "node:child_process";

export interface SupabaseLocalEnv {
  apiUrl: string;
  anonKey: string;
  serviceRoleKey: string;
}

let cached: SupabaseLocalEnv | undefined;

function parseEnvOutput(output: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of output.split("\n")) {
    const match = /^([A-Z0-9_]+)="?([^"]*)"?$/.exec(line.trim());
    if (match) result[match[1]] = match[2];
  }
  return result;
}

/**
 * Resolves local Supabase connection details at runtime: process env first
 * (E2E_SUPABASE_*), otherwise `npx supabase status -o env`. Nothing is hardcoded.
 */
export function getSupabaseLocalEnv(): SupabaseLocalEnv {
  if (cached) return cached;
  const fromEnv = {
    apiUrl: process.env.E2E_SUPABASE_URL,
    anonKey: process.env.E2E_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.E2E_SUPABASE_SERVICE_ROLE_KEY,
  };
  if (fromEnv.apiUrl && fromEnv.anonKey && fromEnv.serviceRoleKey) {
    cached = { apiUrl: fromEnv.apiUrl, anonKey: fromEnv.anonKey, serviceRoleKey: fromEnv.serviceRoleKey };
    return cached;
  }
  let output: string;
  try {
    output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (err) {
    throw new Error(
      `Cannot read local Supabase status (is the stack running? try "npx supabase start"): ${String(err)}`,
    );
  }
  const parsed = parseEnvOutput(output);
  const { API_URL, ANON_KEY, SERVICE_ROLE_KEY } = parsed;
  if (!API_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
    throw new Error("supabase status output is missing API_URL / ANON_KEY / SERVICE_ROLE_KEY");
  }
  cached = { apiUrl: API_URL, anonKey: ANON_KEY, serviceRoleKey: SERVICE_ROLE_KEY };
  return cached;
}

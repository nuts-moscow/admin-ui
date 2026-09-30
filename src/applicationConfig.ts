import { Dictionary } from "@/core/types/types";
import { Environment } from "@/core/states/environment/Environment";

export interface ApplicationConfig {
  readonly environments: Dictionary<Environment>;
}

// Overridable at build time so a deploy can point at a different backend
// (e.g. a parallel host) without touching this file. Unset in the existing
// Vercel project, so that deploy keeps hitting the same URL as before.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://nuts.moscow";

export const applicationConfig: ApplicationConfig = {
  environments: {
    production: {
      key: "production",
      apiUrl,
    },
  },
};

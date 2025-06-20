import { env } from '@documenso/lib/utils/env';

import { NEXT_PUBLIC_POSTHOG_HOST } from './app';

const NEXT_PUBLIC_FEATURE_BILLING_ENABLED = () => env('NEXT_PUBLIC_FEATURE_BILLING_ENABLED');
const NEXT_PUBLIC_POSTHOG_KEY = () => env('NEXT_PUBLIC_POSTHOG_KEY');

/**
 * The flag name for global session recording feature flag.
 */
export const FEATURE_FLAG_GLOBAL_SESSION_RECORDING = 'global_session_recording';

/**
 * How frequent to poll for new feature flags in milliseconds.
 */
export const FEATURE_FLAG_POLL_INTERVAL = 30000;

/**
 * Feature flags that will be used when PostHog is disabled.
 *
 * Does not take any person or group properties into account.
 */
export const LOCAL_FEATURE_FLAGS: Record<string, boolean> = {
  app_allow_encrypted_documents: false,
  app_billing: NEXT_PUBLIC_FEATURE_BILLING_ENABLED() === 'true',
  app_document_page_view_history_sheet: false,
  app_passkey: true,
  app_public_profile: true,
  marketing_header_single_player_mode: false,
  marketing_profiles_announcement_bar: true,
} as const;

/**
 * Extract the PostHog configuration from the environment.
 */
export function extractPostHogConfig(): { key: string; host: string } | null {
  const postHogKey = NEXT_PUBLIC_POSTHOG_KEY();
  const postHogHost = NEXT_PUBLIC_POSTHOG_HOST();

  if (!postHogKey || !postHogHost) {
    return null;
  }

  return {
    key: postHogKey,
    host: postHogHost,
  };
}

/**
 * Whether feature flags are enabled for the current instance.
 */
export function isFeatureFlagEnabled(): boolean {
  return extractPostHogConfig() !== null;
}

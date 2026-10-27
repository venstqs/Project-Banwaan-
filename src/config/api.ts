import { Platform, NativeModules } from 'react-native';

declare const process: { env: Record<string, string | undefined> };

/**
 * Dynamically resolves the host machine IP so that physical devices running Expo Go
 * on local Wi-Fi, web browsers, and Android emulators can all connect to the FastAPI backend.
 */
const getDevServerHost = (): string => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  }

  // React Native NativeModules.SourceCode.scriptURL gives Metro bundle URL (e.g. "http://172.16.26.191:8081/index.bundle...")
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return match[1];
    }
  }

  // Active detected LAN Wi-Fi IP for physical devices running Expo Go
  return '172.16.26.191';
};

const HOST = getDevServerHost();

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? `http://${HOST}:8000`;

export const AGENT_ENDPOINT = `${API_BASE}/api/agent/query`;
export const FIELD_REPORT_ENDPOINT = `${API_BASE}/api/mobile/field-report`;
export const FIELD_REPORTS_LIST_ENDPOINT = `${API_BASE}/api/mobile/field-reports`;
export const PROPOSALS_ENDPOINT = `${API_BASE}/api/proposals`;
export const PROPOSAL_REVIEW_ENDPOINT = (id: string) => `${API_BASE}/api/proposals/${id}/review`;
export const FIELD_REPORT_VERIFY_ENDPOINT = (id: string) => `${API_BASE}/api/mobile/field-reports/${id}/verify`;

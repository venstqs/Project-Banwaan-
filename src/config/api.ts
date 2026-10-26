import { Platform } from 'react-native';

declare const process: { env: Record<string, string | undefined> };

const EMULATOR_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? `http://${EMULATOR_HOST}:8000`;

export const AGENT_ENDPOINT = `${API_BASE}/api/agent/query`;
export const FIELD_REPORT_ENDPOINT = `${API_BASE}/api/mobile/field-report`;

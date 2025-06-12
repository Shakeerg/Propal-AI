// app/types.ts

// Define the structure for a User
export interface User {
  _id?: string; // MongoDB auto-generated ID
  username: string;
  email: string;
  password?: string; // Password can be optional for profile updates where it's not changed
  phoneNumber?: string;
  createdAt?: Date;
  // Add other user-related fields as needed
}

// Define structures for STT (Speech-to-Text) configuration
export interface Language {
  name: string;
  value: string;
}

export interface Model {
  name: string;
  value: string;
  languages: Language[];
}

export interface STTProvider {
  name: string;
  value: string;
  models: Model[];
}

export interface TTSData {
  stt: STTProvider[];
}

// Interface for Agent Configuration stored in DB
export interface AgentConfiguration {
  provider: string;
  model: string;
  language: string;
  displayName: string;
}
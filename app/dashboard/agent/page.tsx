'use client';

import { useState, useEffect } from 'react';
import {
  Language,
  Model,
  STTProvider,
  TTSData,
  AgentConfiguration,
} from '@/app/types'; // Assuming app/types.ts defines these interfaces
import {
  saveAgentConfiguration,
  getAgentConfiguration,
} from '@/actions/auth'; // Adjust path if needed
import { useAuth } from '@/app/components/AuthProvider';
import Head from 'next/head';

// Type guard for AgentConfiguration
function isAgentConfiguration(data: any): data is AgentConfiguration {
  return (
    data &&
    typeof data.provider === 'string' &&
    typeof data.model === 'string' &&
    typeof data.language === 'string' &&
    typeof data.displayName === 'string' // Added displayName to type guard for robustness
  );
}

export default function AgentPage() {
  const [mounted, setMounted] = useState(false);
  const [ttsData, setTtsData] = useState<TTSData | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<STTProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [agentDisplayName, setAgentDisplayName] = useState(''); // State for display name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { userEmail } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Updated handleSave to use current state, and always calculate display name
  const handleSave = async () => { // Removed parameters, now uses state directly
    if (!selectedProvider || !selectedModel || !selectedLanguage || !userEmail) {
      setError('Please select a provider, model, and language before saving.');
      return;
    }

    const calculatedDisplayName = `Agent in ${selectedLanguage.name || selectedLanguage.value}`;

    const configToSave: AgentConfiguration = {
      provider: selectedProvider.value,
      model: selectedModel.value,
      language: selectedLanguage.value,
      displayName: calculatedDisplayName, // Use the calculated display name
    };

    setError(null);
    setSuccessMessage(null);
    setLoading(true); // Indicate saving is in progress
    try {
      const result = await saveAgentConfiguration(configToSave, userEmail);
      if (result.success) {
        setSuccessMessage('Configuration saved successfully!');
        // Update the local state with the saved display name
        setAgentDisplayName(calculatedDisplayName);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to save configuration.');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err: any) {
      console.error("AgentPage save error:", err);
      setError(err.message || 'An unexpected error occurred during save.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false); // End saving indication
    }
  };

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      setError(null);
      try {
        const ttsResponse = await fetch('/tts.json');
        if (!ttsResponse.ok) {
          throw new Error(`Failed to fetch TTS config: ${ttsResponse.statusText}`);
        }
        const ttsJson: TTSData = await ttsResponse.json();
        setTtsData(ttsJson);

        if (!userEmail) {
          setError('No user email found. Please ensure you are logged in.');
          setLoading(false);
          return;
        }

        const configResult = await getAgentConfiguration(userEmail);
        if (!configResult.success) { // Simpler check, getAgentConfiguration handles initialization
          setError(configResult.error || 'Failed to load agent configuration.');
          setLoading(false);
          return;
        }

        // If success, configResult.data should be AgentConfiguration (either existing or default)
        if (!isAgentConfiguration(configResult.data)) {
            // This case should ideally not happen if getAgentConfiguration always returns a valid config or error
            setError('Received invalid agent configuration data from server.');
            setLoading(false);
            return;
        }

        const existingConfig = configResult.data;
        const provider = ttsJson.stt.find((p) => p.value === existingConfig.provider);
        const model = provider?.models.find((m) => m.value === existingConfig.model);
        const language = model?.languages.find((l) => l.value === existingConfig.language);

        setSelectedProvider(provider || null);
        setSelectedModel(model || null);
        setSelectedLanguage(language || null);
        setAgentDisplayName(existingConfig.displayName || ''); // Set display name from fetched config

      } catch (err: any) {
        console.error("AgentPage fetch error:", err);
        setError(err.message || 'Failed to load TTS config or agent configuration.');
      } finally {
        setLoading(false);
      }
    }

    if (mounted && userEmail !== undefined) {
      if (userEmail === null) { // User is explicitly not logged in
        setError('No user email found. Please log in to configure the agent.');
        setLoading(false);
      } else {
        fetchInitialData();
      }
    }
  }, [userEmail, mounted]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = ttsData?.stt.find((p) => p.value === e.target.value) || null;
    setSelectedProvider(provider);
    setSelectedModel(null);
    setSelectedLanguage(null);
    setAgentDisplayName(''); // Reset display name when provider changes
    setError(null);
    setSuccessMessage(null);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = selectedProvider?.models.find((m) => m.value === e.target.value) || null;
    setSelectedModel(model);
    setSelectedLanguage(null);
    setAgentDisplayName(''); // Reset display name when model changes
    setError(null);
    setSuccessMessage(null);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = selectedModel?.languages.find((l) => l.value === e.target.value) || null;
    setSelectedLanguage(language);
    // Automatically set the display name based on selected language
    if (language) {
      setAgentDisplayName(`Agent in ${language.name || language.value}`);
    } else {
      setAgentDisplayName('');
    }
    setError(null);
    setSuccessMessage(null);
  };

  const handleReset = async () => {
    setSelectedProvider(null);
    setSelectedModel(null);
    setSelectedLanguage(null);
    setAgentDisplayName('N/A'); // Reset display name for UI
    setSuccessMessage('Configuration reset. Please select new options to save.');
    setError(null);
    setTimeout(() => setSuccessMessage(null), 3000);

    // Optional: If you want to clear the saved config in DB on reset, you'd add another server action.
    // For now, this just resets the UI state.
  };

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[50vh] justify-center items-center w-full bg-[var(--ui-bg-primary)] dark:bg-[var(--ui-bg-dark)] text-[var(--ui-text-primary)] dark:text-[var(--ui-text-light)]">
        <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></span>
        <p className="ml-3 text-lg">Loading agent configuration...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Agent Configuration - PROPAL AI</title>
      </Head>
      <div className="min-h-screen w-full p-8 bg-[var(--ui-bg-primary)] dark:bg-[var(--ui-bg-dark)] text-[var(--ui-text-primary)] dark:text-[var(--ui-text-light)] flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 mt-10">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Agent Configuration
          </h1>

          {successMessage && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm px-4 py-3 rounded-md fade-in">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 border border-red-500 dark:border-red-600 text-sm px-4 py-3 rounded-md fade-in font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="provider" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                STT Provider <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(Engine)</span>
              </label>
              <select
                id="provider"
                value={selectedProvider?.value || ''}
                onChange={handleProviderChange}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-base rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300">-- Select Provider --</option>
                {ttsData?.stt.map((p) => (
                  <option key={p.value} value={p.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Model <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(By Provider)</span>
              </label>
              <select
                id="model"
                value={selectedModel?.value || ''}
                onChange={handleModelChange}
                disabled={!selectedProvider}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-base rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300">-- Select Model --</option>
                {selectedProvider?.models.map((m) => (
                  <option key={m.value} value={m.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Language <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(Interaction)</span>
              </label>
              <select
                id="language"
                value={selectedLanguage?.value || ''}
                onChange={handleLanguageChange}
                disabled={!selectedModel}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-base rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300">-- Select Language --</option>
                {selectedModel?.languages.map((l) => (
                  <option key={l.value} value={l.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Agent Display Name</label>
            <input
              type="text"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2.5 rounded-lg text-base cursor-not-allowed"
              readOnly
              value={agentDisplayName || 'N/A'} // Use the state for display name
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto text-base px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Reset
            </button>
            <button
              disabled={!selectedProvider || !selectedModel || !selectedLanguage || loading} // Disable while saving
              onClick={handleSave} // Calls the handleSave function directly
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 text-base"
            >
              {loading ? 'Saving...' : 'Save Now'} {/* Show saving state */}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
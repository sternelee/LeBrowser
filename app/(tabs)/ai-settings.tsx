import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAIContext } from '@/context/AIContext';

export default function AISettingsScreen() {
  const {
    providers,
    apiKeys: contextKeys,
    activeProvider: contextProvider,
    saveApiKey,
    setActiveProvider,
    isLoading,
  } = useAIContext();

  const [localApiKeys, setLocalApiKeys] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setLocalApiKeys(contextKeys);
  }, [contextKeys]);

  const handleSave = () => {
    Object.entries(localApiKeys).forEach(([provider, key]) => {
      // Only save if the key has changed from what's in the context
      if (key !== contextKeys[provider]) {
        saveApiKey(provider, key);
      }
    });
    alert('Settings saved!');
  };

  const handleKeyChange = (provider: string, key: string) => {
    setLocalApiKeys((prev) => ({ ...prev, [provider]: key }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Keys</Text>
          {providers.map((provider) => (
            <View key={provider} style={styles.inputContainer}>
              <Text style={styles.label}>{provider.toUpperCase()}</Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${provider} API Key`}
                value={localApiKeys[provider] || ''}
                onChangeText={(text) => handleKeyChange(provider, text)}
                secureTextEntry
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Provider</Text>
          {providers.map((provider) => (
            <TouchableOpacity
              key={provider}
              style={styles.radioContainer}
              onPress={() => setActiveProvider(provider)}
            >
              <View
                style={[
                  styles.radio,
                  contextProvider === provider && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioLabel}>{provider.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#007bff',
  },
  radioLabel: {
    color: 'white',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

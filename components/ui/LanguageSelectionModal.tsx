import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

const LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Mandarin Chinese',
  'Russian',
  'Arabic',
];

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage: (language: string) => void;
}

export function LanguageSelectionModal({
  visible,
  onClose,
  onSelectLanguage,
}: LanguageSelectionModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Select a Language</Text>
          <FlatList
            data={LANGUAGES}
            style={{ width: '100%' }}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 15, borderBottomColor: '#eee', borderBottomWidth: 1, width: '100%', alignItems: 'center' }}
                onPress={() => onSelectLanguage(item)}
              >
                <Text style={{ fontSize: 18 }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: '#ff3b30', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' }}
            onPress={onClose}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

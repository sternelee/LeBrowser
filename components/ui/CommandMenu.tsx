import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

export type Command = {
  name: string;
  description: string;
  onSelect: () => void;
};

interface CommandMenuProps {
  commands: Command[];
  filter: string;
}

export function CommandMenu({ commands, filter }: CommandMenuProps) {
  const filteredCommands = commands.filter((command) =>
    command.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 60, // Position above the text input
        left: 8,
        right: 8,
        backgroundColor: '#444',
        borderRadius: 8,
        maxHeight: 200,
        borderColor: '#555',
        borderWidth: 1,
      }}
    >
      <FlatList
        data={filteredCommands}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={item.onSelect}
            style={{ padding: 12, borderBottomColor: '#555', borderBottomWidth: 1 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ color: '#ccc' }}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

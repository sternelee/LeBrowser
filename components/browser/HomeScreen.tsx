import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Search, Mic, Camera } from 'lucide-react-native';
import { useBrowserContext } from '@/context/BrowserContext';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useColorScheme } from '~/lib/useColorScheme';

interface ShortcutProps {
  title: string;
  url: string;
  icon?: string;
  onPress: () => void;
  isPrivateMode: boolean;
}

function Shortcut({ title, url, icon, onPress, isPrivateMode }: ShortcutProps) {
  return (
    <TouchableOpacity className="w-20 items-center mb-4" onPress={onPress}>
      <View
        className={`
          w-14 h-14 rounded-full justify-center items-center mb-2 shadow-sm
          ${isPrivateMode ? 'bg-purple-800/50' : 'bg-secondary'}
        `}
      >
        {icon ? (
          <Image source={{ uri: icon }} className="w-6 h-6 rounded" />
        ) : (
          <Text className="text-foreground text-xl font-bold">
            {title.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text
        className="text-muted-foreground text-xs text-center"
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

interface HomeScreenProps {
  onSearch: (query: string) => void;
  onFocusSearch: () => void;
}

export function HomeScreen({ onSearch, onFocusSearch }: HomeScreenProps) {
  const { navigateToUrl, shortcuts } = useBrowserContext();
  const { isPrivateMode } = usePrivacyContext();
  const { isTablet, isDesktop } = useResponsiveSize();
  const { isDarkColorScheme } = useColorScheme();

  return (
    <ScrollView
      className={`
        flex-1
        ${isDarkColorScheme ? 'dark' : ''}
        ${isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'}
      `}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Google Logo */}
      <View className="items-center mt-15 mb-6">
        <Text className="text-foreground text-4xl font-bold">Google</Text>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        className={`
          flex-row items-center rounded-full mx-4 px-4 py-3 mb-8 shadow-sm
          ${isPrivateMode ? 'bg-purple-800/50' : 'bg-secondary'}
        `}
        onPress={onFocusSearch}
        activeOpacity={0.8}
      >
        <Search size={20} color={isDarkColorScheme ? '#9ca3af' : '#6b7280'} />
        <Text className="flex-1 ml-3 text-muted-foreground">
          Search or type URL
        </Text>
        <View className="flex-row items-center">
          <Mic
            size={20}
            color={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
            className="mr-4"
          />
          <Camera size={20} color={isDarkColorScheme ? '#9ca3af' : '#6b7280'} />
        </View>
      </TouchableOpacity>

      {/* Shortcuts */}
      <View className="mb-6">
        <View className="flex-row flex-wrap justify-around px-4">
          {shortcuts.slice(0, 8).map((shortcut, index) => (
            <Shortcut
              key={index}
              title={shortcut.title}
              url={shortcut.url}
              icon={shortcut.favicon}
              onPress={() => navigateToUrl(shortcut.url)}
              isPrivateMode={isPrivateMode}
            />
          ))}
        </View>
      </View>

      {/* Discover Section */}
      <View className="mx-4">
        <Card
          className={`
            ${isPrivateMode ? 'bg-purple-800/50 border-purple-700' : 'bg-card'}
          `}
        >
          <CardHeader>
            <View className="flex-row justify-between items-center">
              <CardTitle className="text-card-foreground">Discover</CardTitle>
              <TouchableOpacity>
                <Text className="text-muted-foreground text-base">•••</Text>
              </TouchableOpacity>
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-card-foreground text-sm mb-1">
              Can't refresh Discover
            </Text>
            <Text className="text-muted-foreground text-sm">
              Check back later for new stories
            </Text>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

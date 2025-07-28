import { useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Plus, Search, Grid3X3 } from 'lucide-react-native';
import { useBrowserContext } from '@/context/BrowserContext';
import { ChromeTabPreview } from '@/components/browser/ChromeTabPreview';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { useRouter } from 'expo-router';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabsScreen() {
  const { tabs, currentTab, addNewTab, removeTab, switchToTab, tabsInfo } =
    useBrowserContext();

  const { isPrivateMode } = usePrivacyContext();
  const router = useRouter();
  const { isTablet, isDesktop } = useResponsiveSize();
  const { isDarkColorScheme } = useColorScheme();

  const goBack = () => {
    router.back();
  };

  // Calculate number of columns based on screen size
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  // Add a new tab button at the end of the list
  const tabsWithNewTab = [...tabs, 'new'];

  return (
    <SafeAreaView
      className={`
        flex-1
        ${isDarkColorScheme ? 'dark' : ''}
        ${isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'}
      `}
      edges={['left', 'right']}
    >
      {/* Header */}
      <View className="border-b border-border px-4 py-3 mb-2">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            className={`
              w-10 h-10 justify-center items-center
              ${isTablet ? 'w-12 h-12' : ''}
              ${isDesktop ? 'w-14 h-14' : ''}
            `}
            onPress={addNewTab}
          >
            <Plus size={24} color={isDarkColorScheme ? '#ffffff' : '#000000'} />
          </TouchableOpacity>

          <View className="w-10 h-10 justify-center items-center bg-secondary rounded-full">
            <Text className="text-foreground font-medium text-base">
              {tabs.length}
            </Text>
          </View>

          <TouchableOpacity
            className={`
              w-10 h-10 justify-center items-center
              ${isTablet ? 'w-12 h-12' : ''}
              ${isDesktop ? 'w-14 h-14' : ''}
            `}
          >
            <Grid3X3
              size={24}
              color={isDarkColorScheme ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          className={`
            flex-row items-center rounded-full px-4 h-12
            ${isPrivateMode ? 'bg-purple-800/50' : 'bg-secondary'}
          `}
        >
          <Search size={20} color={isDarkColorScheme ? '#9ca3af' : '#6b7280'} />
          <TextInput
            className="flex-1 h-12 px-2 text-foreground"
            placeholder="Search your tabs"
            placeholderTextColor={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
          />
        </View>
      </View>

      <FlatList
        data={tabsWithNewTab}
        renderItem={({ item: tabId }) => {
          if (tabId === 'new') {
            return (
              <TouchableOpacity
                className={`
                  flex-1 rounded-md m-1 h-40 justify-center items-center border
                  ${
                    isPrivateMode
                      ? 'bg-purple-800/50 border-purple-700'
                      : 'bg-secondary border-border'
                  }
                `}
                onPress={addNewTab}
              >
                <View className="justify-center items-center">
                  <Plus
                    size={24}
                    color={isDarkColorScheme ? '#ffffff' : '#000000'}
                  />
                  <Text className="text-foreground font-medium mt-2">
                    New tab
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <ChromeTabPreview
              key={tabId}
              title={tabsInfo[tabId]?.title || 'New Tab'}
              url={tabsInfo[tabId]?.url || ''}
              isActive={tabId === currentTab}
              onPress={() => switchToTab(tabId)}
              onClose={() => removeTab(tabId)}
              favicon={tabsInfo[tabId]?.favicon}
              isPrivateMode={isPrivateMode}
            />
          );
        }}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 24 }}
        className="px-4"
        numColumns={numColumns}
        columnWrapperStyle={{
          flex: 1,
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      />
    </SafeAreaView>
  );
}


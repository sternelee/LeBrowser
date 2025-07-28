import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { BrowserView } from '@/components/browser/BrowserView';
import { useBrowserContext } from '@/context/BrowserContext';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { ChromeAddressBar } from '@/components/browser/ChromeAddressBar';
import { ChromeBottomBar } from '@/components/browser/ChromeBottomBar';
import { ChromeMenu } from '@/components/browser/ChromeMenu';
import { HomeScreen } from '@/components/browser/HomeScreen';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BrowserScreen() {
  const {
    currentTab,
    tabs,
    loadInitialUrl,
    refreshPage,
    currentUrl,
    updateUrl,
    isLoading,
    addNewTab,
  } = useBrowserContext();

  const { isPrivateMode, togglePrivateMode } = usePrivacyContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [addressBarFocused, setAddressBarFocused] = useState(false);
  const { isLandscape, isTablet, isDesktop } = useResponsiveSize();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  useEffect(() => {
    loadInitialUrl();
  }, []);

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleBookmarksPress = () => {
    console.log('Bookmarks pressed');
    router.navigate('/bookmarks');
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const handleAddressBarFocus = () => {
    setAddressBarFocused(true);
  };

  const handleAddressBarBlur = () => {
    setAddressBarFocused(false);
  };

  const useSideBySideLayout = (isTablet || isDesktop) && isLandscape;

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkColorScheme ? 'dark' : ''} ${
        isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'
      }`}
      edges={['left', 'right']}
    >
      <View
        className={`flex-1 ${useSideBySideLayout ? 'flex-row' : 'flex-col'}`}
      >
        {useSideBySideLayout ? (
          <>
            <View className="w-20 border-r border-border justify-center items-center">
              <ChromeBottomBar
                refreshPage={refreshPage}
                onSearchPress={handleSearchPress}
                onBookmarksPress={handleBookmarksPress}
                isPrivateMode={isPrivateMode}
                tabsCount={tabs.length}
                onLongPressRefresh={handleMenuPress}
              />
            </View>

            <View className="flex-1 flex-col">
              <ChromeAddressBar
                url={currentUrl}
                onSubmit={updateUrl}
                isLoading={isLoading}
                isPrivateMode={isPrivateMode}
                tabsCount={tabs.length}
                onMenuPress={handleMenuPress}
                onFocus={handleAddressBarFocus}
                onBlur={handleAddressBarBlur}
              />

              {!currentUrl && !addressBarFocused ? (
                <HomeScreen
                  onSearch={updateUrl}
                  onFocusSearch={handleAddressBarFocus}
                />
              ) : (
                <BrowserView url={currentUrl} tabId={currentTab} />
              )}
            </View>
          </>
        ) : (
          <>
            <ChromeAddressBar
              url={currentUrl}
              onSubmit={updateUrl}
              isLoading={isLoading}
              isPrivateMode={isPrivateMode}
              tabsCount={tabs.length}
              onMenuPress={handleMenuPress}
              onFocus={handleAddressBarFocus}
              onBlur={handleAddressBarBlur}
            />

            {!currentUrl && !addressBarFocused ? (
              <HomeScreen
                onSearch={updateUrl}
                onFocusSearch={handleAddressBarFocus}
              />
            ) : (
              <BrowserView url={currentUrl} tabId={currentTab} />
            )}

            <View className="pb-safe">
              <ChromeBottomBar
                refreshPage={refreshPage}
                onSearchPress={handleSearchPress}
                onBookmarksPress={handleBookmarksPress}
                isPrivateMode={isPrivateMode}
                tabsCount={tabs.length}
                onLongPressRefresh={handleMenuPress}
              />
            </View>
          </>
        )}
      </View>

      <ChromeMenu
        visible={menuVisible}
        onClose={handleCloseMenu}
        onRefresh={refreshPage}
        onNewTab={addNewTab}
        isPrivateMode={isPrivateMode}
        togglePrivateMode={togglePrivateMode}
      />
    </SafeAreaView>
  );
}


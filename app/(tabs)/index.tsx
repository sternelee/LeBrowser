import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { BrowserView } from '@/components/browser/BrowserView';
import { useBrowserContext } from '@/context/BrowserContext';
import { usePrivacyContext } from '@/context/PrivacyContext';
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

  // Tools Panel Handlers
  const handleTranslate = () => {
    console.log('Translate pressed');
    // TODO: Implement translation functionality
  };

  const handlePin = () => {
    console.log('Pin pressed');
    // TODO: Implement pin functionality
  };

  const handleFind = () => {
    console.log('Find pressed');
    // TODO: Implement find in page functionality
  };

  const handleShare = () => {
    console.log('Share pressed');
    // TODO: Implement share functionality
  };

  const handleZoomIn = () => {
    console.log('Zoom in pressed');
    // TODO: Implement zoom in functionality
  };

  const handleZoomOut = () => {
    console.log('Zoom out pressed');
    // TODO: Implement zoom out functionality
  };

  const handleResetZoom = () => {
    console.log('Reset zoom pressed');
    // TODO: Implement reset zoom functionality
  };

  const handleDesktopSite = () => {
    console.log('Desktop site pressed');
    // TODO: Implement desktop site toggle functionality
  };

  const handleSiteSettings = () => {
    console.log('Site settings pressed');
    // TODO: Implement site settings functionality
  };

  const useSideBySideLayout = (isTablet || isDesktop) && isLandscape;

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkColorScheme ? 'dark' : ''} ${
        isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'
      }`}
      edges={['top', 'left', 'right', 'bottom']}
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
                onTranslate={handleTranslate}
                onPin={handlePin}
                onFind={handleFind}
                onShare={handleShare}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onDesktopSite={handleDesktopSite}
                onSiteSettings={handleSiteSettings}
                zoomLevel={100}
              />
            </View>

            <View className="flex-1 flex-col">
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
            {!currentUrl && !addressBarFocused ? (
              <HomeScreen
                onSearch={updateUrl}
                onFocusSearch={handleAddressBarFocus}
              />
            ) : (
              <BrowserView url={currentUrl} tabId={currentTab} />
            )}

            <View>
              <ChromeBottomBar
                refreshPage={refreshPage}
                onSearchPress={handleSearchPress}
                onBookmarksPress={handleBookmarksPress}
                isPrivateMode={isPrivateMode}
                tabsCount={tabs.length}
                onLongPressRefresh={handleMenuPress}
                onTranslate={handleTranslate}
                onPin={handlePin}
                onFind={handleFind}
                onShare={handleShare}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onDesktopSite={handleDesktopSite}
                onSiteSettings={handleSiteSettings}
                zoomLevel={100}
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

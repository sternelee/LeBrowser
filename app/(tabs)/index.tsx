import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useColorScheme } from '~/lib/useColorScheme';
import { BrowserView } from '@/components/browser/BrowserView';
import { useBrowserContext } from '@/context/BrowserContext';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { ChromeBottomBar } from '@/components/browser/ChromeBottomBar';
import { ChromeMenu } from '@/components/browser/ChromeMenu';
import { SafariHomePage } from '@/components/browser/SafariHomePage';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BrowserScreen() {
  const {
    currentTab,
    tabs,
    loadInitialUrl,
    refreshPage,
    currentUrl,
    addNewTab,
    toggleDesktopMode,
    isDesktopMode,
    setBrowserViewRef,
    browserViewRef,
  } = useBrowserContext();

  const { isPrivateMode, togglePrivateMode } = usePrivacyContext();
  const [menuVisible, setMenuVisible] = useState(false);
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
    // For now, this is just a proof of concept.
    // A proper implementation would involve a UI to get the search query.
    browserViewRef.current?.findInPage('the');
  };

  const handleShare = async () => {
    if (currentUrl) {
      try {
        await Sharing.shareAsync(currentUrl);
      } catch (error) {
        console.error('Error sharing URL:', error);
      }
    } else {
      console.log('No URL to share');
    }
  };

  const handleZoomIn = () => {
    browserViewRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    browserViewRef.current?.zoomOut();
  };

  const handleResetZoom = () => {
    browserViewRef.current?.resetZoom();
  };

  const handleDesktopSite = () => {
    toggleDesktopMode();
    // A page refresh is likely needed to apply the new user agent
    setTimeout(() => {
      refreshPage();
    }, 100);
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
              {currentUrl === 'about:home' ? (
                <SafariHomePage />
              ) : (
                <BrowserView
                  ref={(node) => setBrowserViewRef(node)}
                  url={currentUrl}
                  tabId={currentTab}
                  isDesktopMode={isDesktopMode}
                />
              )}
            </View>
          </>
        ) : (
          <>
            {currentUrl === 'about:home' ? (
              <SafariHomePage />
            ) : (
              <BrowserView
                ref={(node) => setBrowserViewRef(node)}
                url={currentUrl}
                tabId={currentTab}
                isDesktopMode={isDesktopMode}
              />
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

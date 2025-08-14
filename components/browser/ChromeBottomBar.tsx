import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import {
  Home,
  Bookmark,
  Search,
  Layers,
  RefreshCw,
  ChevronUp,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { ToolsPanel } from './ToolsPanel';

interface ChromeBottomBarProps {
  refreshPage: () => void;
  onSearchPress: () => void;
  onBookmarksPress: () => void;
  isPrivateMode: boolean;
  tabsCount: number;
  onLongPressRefresh?: () => void;
  onTranslate?: () => void;
  onPin?: () => void;
  onFind?: () => void;
  onShare?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onDesktopSite?: () => void;
  onSiteSettings?: () => void;
  zoomLevel?: number;
}

export function ChromeBottomBar({
  refreshPage,
  onSearchPress,
  onBookmarksPress,
  isPrivateMode,
  tabsCount,
  onLongPressRefresh,
  onTranslate,
  onPin,
  onFind,
  onShare,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDesktopSite,
  onSiteSettings,
  zoomLevel = 100,
}: ChromeBottomBarProps) {
  const router = useRouter();
  const { isTablet, isDesktop } = useResponsiveSize();
  const { isDarkColorScheme } = useColorScheme();
  const [showToolsPanel, setShowToolsPanel] = useState(false);

  const navigateToTabs = () => {
    router.navigate('/tabs');
  };

  const navigateToAI = () => {
    router.navigate('/ai');
  };

  const navigateHome = () => {
    router.navigate('/');
  };

  const handleToolsPress = () => {
    setShowToolsPanel(true);
  };

  const handleCloseToolsPanel = () => {
    setShowToolsPanel(false);
  };

  const iconSize = isDesktop ? 28 : isTablet ? 26 : 24;
  const containerHeight = isDesktop ? 64 : isTablet ? 60 : 56;

  return (
    <View
      className={`
        flex-row justify-between items-center border-t border-border px-4 py-3
        ${isDarkColorScheme ? 'dark' : ''}
        ${isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'}
      `}
      style={{ height: containerHeight }}
    >
      {/* Home Button */}
      <TouchableOpacity
        className={`
          p-3 rounded-full justify-center items-center
          ${isTablet ? 'p-4' : ''}
          ${isDesktop ? 'p-5' : ''}
        `}
        onPress={navigateHome}
      >
        <Home
          size={iconSize}
          color={isDarkColorScheme ? '#ffffff' : '#000000'}
        />
      </TouchableOpacity>

      {/* Bookmarks Button */}
      <TouchableOpacity
        className={`
          p-3 rounded-full justify-center items-center
          ${isTablet ? 'p-4' : ''}
          ${isDesktop ? 'p-5' : ''}
        `}
        onPress={onBookmarksPress}
      >
        <Bookmark
          size={iconSize}
          color={isDarkColorScheme ? '#ffffff' : '#000000'}
        />
      </TouchableOpacity>

      {/* AI Button */}
      <TouchableOpacity
        className={`
          p-3 rounded-full justify-center items-center
          ${isTablet ? 'p-4' : ''}
          ${isDesktop ? 'p-5' : ''}
        `}
        onPress={navigateToAI}
      >
        <Sparkles
          size={iconSize}
          color={isDarkColorScheme ? '#ffffff' : '#000000'}
        />
      </TouchableOpacity>

      {/* Search Button */}
      <TouchableOpacity
        className={`
          p-3 rounded-full justify-center items-center
          ${isTablet ? 'p-4' : ''}
          ${isDesktop ? 'p-5' : ''}
        `}
        onPress={onSearchPress}
      >
        <Search
          size={iconSize}
          color={isDarkColorScheme ? '#ffffff' : '#000000'}
        />
      </TouchableOpacity>

      {/* Tabs Button */}
      <TouchableOpacity
        className={`
          p-3 rounded-full justify-center items-center relative
          ${isTablet ? 'p-4' : ''}
          ${isDesktop ? 'p-5' : ''}
        `}
        onPress={navigateToTabs}
      >
        <Layers
          size={iconSize}
          color={isDarkColorScheme ? '#ffffff' : '#000000'}
        />
        <View
          className={`
            absolute top-1 right-1 bg-primary rounded-full min-w-5 h-5 justify-center items-center px-1
            ${isTablet ? 'top-2 right-2 min-w-6 h-6' : ''}
            ${isDesktop ? 'top-3 right-3 min-w-6 h-6' : ''}
          `}
        >
          <Text
            className={`
              text-primary-foreground font-bold
              ${isTablet || isDesktop ? 'text-xs' : 'text-xs'}
            `}
          >
            {tabsCount}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Refresh Button */}
      {/* <TouchableOpacity
        className={`
          p-3 rounded-full justify-center items-center
          ${isTablet ? 'p-4' : ''}
          ${isDesktop ? 'p-5' : ''}
        `}
        onPress={refreshPage}
        onLongPress={onLongPressRefresh}
        delayLongPress={500}
      >
        <RefreshCw
          size={iconSize}
          color={isDarkColorScheme ? '#ffffff' : '#000000'}
        />
      </TouchableOpacity> */}

      {/* Tools Button */}
      <TouchableOpacity
        className={`
          p-3 rounded-full justify-center items-center
          ${isTablet ? 'p-4' : ''}
          ${isDesktop ? 'p-5' : ''}
        `}
        onPress={handleToolsPress}
      >
        <ChevronUp
          size={iconSize}
          color={isDarkColorScheme ? '#ffffff' : '#000000'}
        />
      </TouchableOpacity>

      {/* Tools Panel */}
      <ToolsPanel
        visible={showToolsPanel}
        onClose={handleCloseToolsPanel}
        isPrivateMode={isPrivateMode}
        onTranslate={onTranslate}
        onPin={onPin}
        onFind={onFind}
        onShare={onShare}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
        onDesktopSite={onDesktopSite}
        onSiteSettings={onSiteSettings}
        zoomLevel={zoomLevel}
      />
    </View>
  );
}

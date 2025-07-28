import { View, TouchableOpacity, Text } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Home, Bookmark, Search, Layers, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

interface ChromeBottomBarProps {
  refreshPage: () => void;
  onSearchPress: () => void;
  onBookmarksPress: () => void;
  isPrivateMode: boolean;
  tabsCount: number;
  onLongPressRefresh?: () => void;
}

export function ChromeBottomBar({
  refreshPage,
  onSearchPress,
  onBookmarksPress,
  isPrivateMode,
  tabsCount,
  onLongPressRefresh,
}: ChromeBottomBarProps) {
  const router = useRouter();
  const { isTablet, isDesktop } = useResponsiveSize();
  const { isDarkColorScheme } = useColorScheme();

  const navigateToTabs = () => {
    router.navigate('/tabs');
  };

  const navigateHome = () => {
    router.navigate('/');
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
      <TouchableOpacity
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
      </TouchableOpacity>
    </View>
  );
}

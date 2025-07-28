import { Text, View, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Globe, X } from 'lucide-react-native';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

interface ChromeTabPreviewProps {
  title: string;
  url: string;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  favicon?: string;
  isPrivateMode: boolean;
}

export function ChromeTabPreview({
  title,
  url,
  isActive,
  onPress,
  onClose,
  favicon,
  isPrivateMode,
}: ChromeTabPreviewProps) {
  const { isTablet, isDesktop } = useResponsiveSize();
  const { isDarkColorScheme } = useColorScheme();

  // Format URL for display
  const displayUrl = url
    ? url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
    : '';

  return (
    <TouchableOpacity
      className={`
        flex-1 rounded-md overflow-hidden m-1 h-40 shadow-sm
        ${isPrivateMode ? 'bg-purple-800/50' : 'bg-secondary'}
        ${isTablet ? 'rounded-lg shadow-md' : ''}
        ${isDesktop ? 'rounded-xl shadow-lg' : ''}
      `}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-1 flex-col relative">
        <TouchableOpacity
          className="absolute top-1 right-1 w-6 h-6 justify-center items-center bg-black/20 rounded-full z-10"
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={isDarkColorScheme ? '#ffffff' : '#000000'} />
        </TouchableOpacity>

        <View className="flex-1">
          {/* Thumbnail placeholder */}
          <View
            className={`
              flex-1 justify-center items-center relative
              ${isPrivateMode ? 'bg-purple-900/50' : 'bg-background'}
            `}
          >
            <View
              className={`
                absolute w-6 h-6 justify-center items-center rounded-full z-10
                ${isPrivateMode ? 'bg-purple-800/80' : 'bg-secondary/80'}
              `}
              style={{
                top: '50%',
                left: '50%',
                transform: [{ translateX: -12 }, { translateY: -12 }],
              }}
            >
              {favicon ? (
                <Image
                  source={{ uri: favicon }}
                  className="w-4 h-4 rounded-sm"
                />
              ) : (
                <Globe
                  size={16}
                  color={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
                />
              )}
            </View>
            <Text
              className={`
                text-center p-2 absolute bottom-0 left-0 right-0 text-foreground text-sm
                ${isPrivateMode ? 'bg-purple-800/80' : 'bg-secondary/80'}
              `}
            >
              {displayUrl}
            </Text>
          </View>
        </View>

        <Text
          className="mx-2 mb-2 mt-1 text-foreground font-medium text-xs"
          numberOfLines={1}
        >
          {title || 'New Tab'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}


import { Text, View, TouchableOpacity } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Globe, Trash, ExternalLink } from 'lucide-react-native';

interface BookmarkItemProps {
  title: string;
  url: string;
  onPress: () => void;
  onDelete: () => void;
  isPrivateMode: boolean;
}

export function BookmarkItem({
  title,
  url,
  onPress,
  onDelete,
  isPrivateMode,
}: BookmarkItemProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Format URL for display
  const displayUrl = url
    ? url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
    : '';

  return (
    <View
      className={`
        flex-row items-center rounded-lg mb-3 shadow-sm
        ${isPrivateMode ? 'bg-purple-800/50' : 'bg-secondary'}
      `}
    >
      <TouchableOpacity
        className="flex-1 flex-row items-center p-3"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          className={`
            w-9 h-9 justify-center items-center rounded-md mr-3
            ${isPrivateMode ? 'bg-purple-900/50' : 'bg-background'}
          `}
        >
          <Globe size={20} color={isDarkColorScheme ? '#9ca3af' : '#6b7280'} />
        </View>
        <View className="flex-1 mr-2">
          <Text
            className="text-foreground font-medium text-base mb-1"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text className="text-muted-foreground text-sm" numberOfLines={1}>
            {displayUrl}
          </Text>
        </View>
        <ExternalLink
          size={16}
          color={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="p-4 border-l border-border"
        onPress={onDelete}
      >
        <Trash size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { useBrowserContext } from '@/context/BrowserContext';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { Search, Clock } from 'lucide-react-native';

export function SafariHomePage() {
  const { isDarkColorScheme } = useColorScheme();
  const { shortcuts, history, navigateToUrl } = useBrowserContext();
  const { isPrivateMode } = usePrivacyContext();

  const handleUrlPress = (url: string) => {
    navigateToUrl(url);
  };

  return (
    <ScrollView
      className={`
        flex-1
        ${isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'}
      `}
      contentContainerStyle={{
        paddingTop: 16,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* 搜索栏 */}
      <View className="px-4 mb-8">
        <TouchableOpacity
          className={`
            flex-row items-center rounded-2xl p-4 shadow-sm
            ${
              isPrivateMode
                ? 'bg-purple-800/30 border border-purple-700/50'
                : 'bg-secondary/80 border border-border/30'
            }
          `}
          activeOpacity={0.7}
          onPress={() => {
            // 触发搜索栏焦点
            console.log('Search bar pressed');
          }}
        >
          <Search
            size={20}
            color={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
          />
          <Text className="ml-3 text-muted-foreground flex-1 text-base">
            搜索或输入网站名称
          </Text>
        </TouchableOpacity>
      </View>

      {/* 收藏网站 */}
      <View className="px-4 mb-8">
        <Text className="text-xl font-semibold mb-4 text-foreground">收藏</Text>
        <View className="flex-row flex-wrap justify-between">
          {shortcuts.slice(0, 8).map((site, index) => (
            <TouchableOpacity
              key={index}
              className="w-1/4 items-center mb-6"
              onPress={() => handleUrlPress(site.url)}
              activeOpacity={0.7}
            >
              <View
                className={`
                w-16 h-16 rounded-2xl justify-center items-center mb-2 shadow-sm
                ${isPrivateMode ? 'bg-purple-800/40' : 'bg-secondary'}
              `}
              >
                {site.favicon ? (
                  <Image
                    source={{ uri: site.favicon }}
                    className="w-10 h-10 rounded-lg"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-lg bg-blue-500 justify-center items-center">
                    <Text className="text-white text-lg font-semibold">
                      {site.title.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                className="text-xs text-center text-muted-foreground"
                numberOfLines={2}
                style={{ lineHeight: 14 }}
              >
                {site.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 隐私报告 */}
      <View className="px-4 mb-8">
        <View
          className={`
          rounded-2xl p-4 shadow-sm
          ${
            isPrivateMode
              ? 'bg-purple-800/30 border border-purple-700/50'
              : 'bg-secondary/60'
          }
        `}
        >
          <View className="flex-row items-center mb-2">
            <View
              className={`
              w-8 h-8 rounded-full justify-center items-center mr-3
              ${isPrivateMode ? 'bg-purple-600' : 'bg-blue-500'}
            `}
            >
              <Text className="text-white text-sm font-bold">🛡️</Text>
            </View>
            <Text className="text-base font-semibold text-foreground">
              隐私报告
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground leading-5">
            {isPrivateMode
              ? '隐私浏览模式已启用，您的浏览活动不会被记录。'
              : '在过去的 7 天内，已阻止 23 个跟踪器跟踪您的浏览活动。'}
          </Text>
        </View>
      </View>

      {/* 最近访问 */}
      {!isPrivateMode && history.length > 0 && (
        <View className="px-4 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-foreground">
              最近访问
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-blue-500 text-base font-medium">
                显示全部
              </Text>
            </TouchableOpacity>
          </View>
          <View className="bg-secondary/60 rounded-2xl overflow-hidden shadow-sm">
            {history.slice(0, 4).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                className={`
                  flex-row items-center p-4
                  ${index < 3 ? 'border-b border-border/30' : ''}
                `}
                onPress={() => handleUrlPress(item.url)}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-xl bg-background justify-center items-center mr-3 shadow-sm">
                  {item.favicon ? (
                    <Image
                      source={{ uri: item.favicon }}
                      className="w-6 h-6 rounded-md"
                      resizeMode="contain"
                    />
                  ) : (
                    <Clock
                      size={16}
                      color={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium text-foreground mb-1"
                    numberOfLines={1}
                  >
                    {item.title || '无标题'}
                  </Text>
                  <Text
                    className="text-xs text-muted-foreground"
                    numberOfLines={1}
                  >
                    {item.url}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 隐私模式提示 */}
      {isPrivateMode && (
        <View className="px-4 mb-8">
          <View className="bg-purple-800/30 border border-purple-700/50 rounded-2xl p-4">
            <Text className="text-purple-200 text-sm text-center leading-5">
              您正在使用隐私浏览模式。关闭所有隐私标签页后，您的浏览历史记录、搜索记录和自动填充信息将不会保存在此设备上。
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

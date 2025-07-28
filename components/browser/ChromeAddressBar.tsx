import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Search, Lock, X, Layers, MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

interface ChromeAddressBarProps {
  url: string;
  onSubmit: (url: string) => void;
  isLoading: boolean;
  isPrivateMode: boolean;
  tabsCount: number;
  onMenuPress: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ChromeAddressBar({
  url,
  onSubmit,
  isLoading,
  isPrivateMode,
  tabsCount,
  onMenuPress,
  onFocus,
  onBlur,
}: ChromeAddressBarProps) {
  const [inputValue, setInputValue] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { isTablet, isDesktop } = useResponsiveSize();
  const { isDarkColorScheme } = useColorScheme();

  useEffect(() => {
    if (url !== inputValue && !isFocused) {
      setInputValue(url);
    }
  }, [url]);

  const handleSubmit = () => {
    let processedUrl = inputValue.trim();
    if (processedUrl && !processedUrl.startsWith('http')) {
      if (processedUrl.includes(' ') || !processedUrl.includes('.')) {
        const searchEngine = 'https://www.google.com/search?q=';
        processedUrl = searchEngine + encodeURIComponent(processedUrl);
      } else {
        processedUrl = 'https://' + processedUrl;
      }
    }
    onSubmit(processedUrl);
    setIsFocused(false);
  };

  const handleClear = () => {
    setInputValue('');
  };

  const navigateToTabs = () => {
    router.navigate('/tabs');
  };

  const getDisplayUrl = () => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  const isSecure = url.startsWith('https://');
  const displayUrl = isFocused ? inputValue : getDisplayUrl();

  return (
    <View
      className={`
        border-b border-border px-4 py-3
        ${isDarkColorScheme ? 'dark' : ''}
        ${isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'}
      `}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`
            flex-1 h-12 rounded-full px-4 flex-row items-center
            ${isTablet ? 'h-13 px-6' : ''}
            ${isDesktop ? 'h-14 px-8' : ''}
            ${
              isFocused
                ? 'bg-background border border-ring'
                : 'bg-secondary border border-input'
            }
            ${isPrivateMode && !isFocused ? 'bg-purple-800/50' : ''}
          `}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={isDarkColorScheme ? '#ffffff' : '#000000'}
              className="mr-2"
            />
          ) : (
            <>
              {isSecure ? (
                <Lock
                  size={16}
                  color={isDarkColorScheme ? '#10b981' : '#059669'}
                  className="mr-2"
                />
              ) : (
                <Search
                  size={16}
                  color={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
                  className="mr-2"
                />
              )}
            </>
          )}

          <TextInput
            className={`
              flex-1 text-foreground text-base
              ${!isFocused ? 'text-center' : ''}
            `}
            value={isFocused ? inputValue : displayUrl}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmit}
            onFocus={() => {
              setIsFocused(true);
              if (onFocus) onFocus();
            }}
            onBlur={() => {
              setIsFocused(false);
              if (onBlur) onBlur();
            }}
            placeholder="Search or type web address"
            placeholderTextColor={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
            autoCapitalize="none"
            keyboardType="url"
            returnKeyType="go"
            selectTextOnFocus
          />

          {inputValue !== '' && isFocused && (
            <TouchableOpacity onPress={handleClear} className="p-1">
              <X size={16} color={isDarkColorScheme ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          className={`
            w-12 h-12 rounded-full justify-center items-center relative
            ${isTablet ? 'w-13 h-13' : ''}
            ${isDesktop ? 'w-14 h-14' : ''}
          `}
          onPress={navigateToTabs}
        >
          <Layers size={20} color={isDarkColorScheme ? '#ffffff' : '#000000'} />
          <View className="absolute top-1 right-1 bg-primary rounded-full min-w-5 h-5 justify-center items-center px-1">
            <Text className="text-primary-foreground text-xs font-bold">
              {tabsCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`
            w-12 h-12 rounded-full justify-center items-center
            ${isTablet ? 'w-13 h-13' : ''}
            ${isDesktop ? 'w-14 h-14' : ''}
          `}
          onPress={onMenuPress}
        >
          <MoreVertical
            size={20}
            color={isDarkColorScheme ? '#ffffff' : '#000000'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}


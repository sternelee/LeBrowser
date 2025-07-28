import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { useColorScheme } from '~/lib/useColorScheme';
import { commonStyles } from '@/styles/theme'; // Import commonStyles
import { useBrowserContext } from '@/context/BrowserContext';
import { Search, Clock } from 'lucide-react-native';

interface BrowserViewProps {
  url: string;
  tabId: string;
}

export function BrowserView({ url, tabId }: BrowserViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [pageTitle, setPageTitle] = useState('');
  const [pageFavicon, setPageFavicon] = useState<string | undefined>(undefined);
  const [showHomePage, setShowHomePage] = useState(
    url === 'about:home' || url === ''
  );

  const {
    setCanGoBack,
    setCanGoForward,
    setIsLoading,
    updateTabInfo,
    setCurrentUrl: setContextUrl,
    addHistoryItem,
    shortcuts,
    history,
    navigateToUrl,
  } = useBrowserContext();

  const {
    isPrivateMode,
    scriptBlockingEnabled,
    httpsOnlyEnabled,
    fingerprintProtectionEnabled,
    cookieControlEnabled,
  } = usePrivacyContext();
  const { isDarkColorScheme } = useColorScheme();
  // const { isMobileMode } = useColorScheme();
  const dynamicStyles = commonStyles(isDarkColorScheme);

  useEffect(() => {
    if (url !== currentUrl) {
      setCurrentUrl(url);

      // 检查是否应该显示首页
      if (url === 'about:home' || url === '') {
        setShowHomePage(true);
      } else {
        setShowHomePage(false);
        // It's generally better to change the source prop of WebView for navigation
        // rather than injecting JS for location change, but keeping existing logic.
        // webViewRef.current?.loadUrl(url); // Alternative
        webViewRef.current?.injectJavaScript(
          `window.location.href = "${url}";`
        );
      }
    }
  }, [url]);

  // JavaScript to inject for privacy features
  const getInjectedJavaScript = () => {
    let script = '';

    if (fingerprintProtectionEnabled) {
      // Basic fingerprint protection
      script += `
        // Override properties used for fingerprinting
        Object.defineProperty(navigator, 'userAgent', {
          get: function() { return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'; }
        });
        Object.defineProperty(navigator, 'platform', {
          get: function() { return 'Win32'; }
        });
        Object.defineProperty(navigator, 'plugins', {
          get: function() { return []; }
        });
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: function() { return 4; }
        });
        // Hide canvas fingerprinting
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type) {
          if (this.width > 16 && this.height > 16) {
            return originalToDataURL.call(this, 'image/png');
          }
          return originalToDataURL.apply(this, arguments);
        };
      `;
    }

    if (cookieControlEnabled) {
      // Block third-party cookies
      script += `
        // Monitor cookie attempts
        (function() {
          const currentDomain = window.location.hostname;
          const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

          Object.defineProperty(document, 'cookie', {
            get: function() {
              return originalCookie.get.call(this);
            },
            set: function(val) {
              // Simple check for third-party cookies
              if (document.referrer && (new URL(document.referrer)).hostname !== currentDomain) {
                console.log('Blocked third-party cookie:', val);
                return '';
              }
              return originalCookie.set.call(this, val);
            }
          });
        })();
      `;
    }

    if (scriptBlockingEnabled) {
      // Basic script blocking (note: this is very basic and not as effective as extension-based blocking)
      script += `
        // Block commonly known tracking scripts
        const scriptObserver = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(node => {
                if (node.nodeName === 'SCRIPT') {
                  const src = node.src || '';
                  const blockedDomains = [
                    'googletagmanager.com',
                    'facebook.net',
                    'doubleclick.net',
                    'google-analytics.com'
                  ];

                  if (blockedDomains.some(domain => src.includes(domain))) {
                    node.remove();
                    console.log('Blocked script:', src);
                  }
                }
              });
            }
          });
        });

        scriptObserver.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      `;
    }

    return script;
  };

  // Handle navigation state changes
  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setContextUrl(navState.url);
    setPageTitle(navState.title); // Store title
    setPageFavicon(navState.favicon); // Store favicon

    // Update tab info
    updateTabInfo(tabId, {
      url: navState.url,
      title: navState.title,
      favicon: navState.favicon,
    });

    // Check for HTTPS enforcement
    if (
      httpsOnlyEnabled &&
      navState.url.startsWith('http:') &&
      !navState.url.startsWith('http://localhost')
    ) {
      const httpsUrl = navState.url.replace('http://', 'https://');
      webViewRef.current?.injectJavaScript(
        `window.location.href = "${httpsUrl}";`
      );
    }
  };

  // WebView custom user agent
  // WebView custom user agent - Dynamic based on mobile/desktop mode
  const mobileUserAgent =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 SecureBrowser/1.0';
  const desktopUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 SecureBrowser/1.0';
  const userAgent = true ? mobileUserAgent : desktopUserAgent;

  // Safari-style home page component
  const SafariHomePage = () => {
    const { isDarkColorScheme } = useColorScheme();

    const handleUrlPress = (url: string) => {
      navigateToUrl(url);
      setShowHomePage(false);
    };

    return (
      <ScrollView
        className={`
          flex-1
          ${
            isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'
          }
        `}
        contentContainerStyle={{ 
          paddingTop: 16,
          paddingBottom: 100 
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
          <Text className="text-xl font-semibold mb-4 text-foreground">
            收藏
          </Text>
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
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isPrivateMode
            ? dynamicStyles.privateMode.backgroundColor
            : dynamicStyles.container.base.backgroundColor,
        },
      ]}
    >
      {showHomePage ? (
        <SafariHomePage />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl || 'https://www.google.com' }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            // Add to history when page loads
            if (
              currentUrl &&
              currentUrl !== 'about:blank' &&
              currentUrl !== 'about:home'
            ) {
              addHistoryItem({
                url: currentUrl,
                title: pageTitle || currentUrl, // Use stored pageTitle
                timestamp: Date.now(),
                favicon: pageFavicon, // Use stored pageFavicon
              });
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={getInjectedJavaScript()}
          incognito={isPrivateMode}
          userAgent={userAgent}
          pullToRefreshEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base style, background color applied inline
    flex: 1,
  },
  webView: {
    flex: 1,
    // WebView background is tricky; the content sets its own.
    // Setting a backgroundColor here might be overridden or cause flashes.
    // The container's background will show if web content has no bg.
  },
});

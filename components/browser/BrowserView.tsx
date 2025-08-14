import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { useColorScheme } from '~/lib/useColorScheme';
import { commonStyles } from '@/styles/theme'; // Import commonStyles
import { useBrowserContext } from '@/context/BrowserContext';
import { SafariHomePage } from './SafariHomePage';

export interface BrowserViewRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  findInPage: (query: string) => void;
  findNext: (forward: boolean) => void;
  clearFind: () => void;
  getPageContent: () => Promise<string>;
}

interface BrowserViewProps {
  url: string;
  tabId: string;
  isDesktopMode?: boolean;
}

export const BrowserView = forwardRef<BrowserViewRef, BrowserViewProps>(
  ({ url, tabId, isDesktopMode = false }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const contentPromiseResolveRef = useRef<((content: string) => void) | null>(
      null
    );
    const [currentUrl, setCurrentUrl] = useState(url);
  const [pageTitle, setPageTitle] = useState('');
  const [pageFavicon, setPageFavicon] = useState<string | undefined>(undefined);
  const [showHomePage, setShowHomePage] = useState(
    url === 'about:home' || url === ''
  );
  const [zoomLevel, setZoomLevel] = useState(100);

  const {
    setCanGoBack,
    setCanGoForward,
    setIsLoading,
    updateTabInfo,
    setCurrentUrl: setContextUrl,
    addHistoryItem,
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

  useImperativeHandle(ref, () => ({
    getPageContent: (): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (webViewRef.current) {
          contentPromiseResolveRef.current = resolve;
          webViewRef.current.injectJavaScript(
            `window.ReactNativeWebView.postMessage(document.body.innerText); true;`
          );
          setTimeout(() => {
            if (contentPromiseResolveRef.current) {
              reject(new Error('Timeout getting page content'));
              contentPromiseResolveRef.current = null;
            }
          }, 5000); // 5-second timeout
        } else {
          reject(new Error('WebView ref is not available'));
        }
      });
    },
    findInPage: (query: string) => {
      webViewRef.current?.findAllAsync(query);
    },
    findNext: (forward: boolean) => {
      webViewRef.current?.findNextAsync(forward);
    },
    clearFind: () => {
      webViewRef.current?.findAllAsync('');
    },
    zoomIn: () => {
      const newZoomLevel = zoomLevel + 10;
      setZoomLevel(newZoomLevel);
      webViewRef.current?.injectJavaScript(
        `document.body.style.zoom = '${newZoomLevel}%';`
      );
    },
    zoomOut: () => {
      const newZoomLevel = Math.max(50, zoomLevel - 10);
      setZoomLevel(newZoomLevel);
      webViewRef.current?.injectJavaScript(
        `document.body.style.zoom = '${newZoomLevel}%';`
      );
    },
    resetZoom: () => {
      setZoomLevel(100);
      webViewRef.current?.injectJavaScript(`document.body.style.zoom = '100%';`);
    },
  }));

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
  const userAgent = isDesktopMode ? desktopUserAgent : mobileUserAgent;

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
          onMessage={(event) => {
            if (contentPromiseResolveRef.current) {
              contentPromiseResolveRef.current(event.nativeEvent.data);
              contentPromiseResolveRef.current = null;
            }
          }}
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
);

BrowserView.displayName = 'BrowserView';

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

import { StyleSheet, ScrollView, Text, View, Switch, TouchableOpacity, Alert, ViewStyle, TextStyle, Modal, FlatList, TextInput } from 'react-native';
import { theme as staticTheme, commonStyles } from '@/styles/theme'; // Renamed to staticTheme to avoid conflict
import { Shield, Lock, Cookie, Trash2, ArrowLeft, Fingerprint, Globe, Settings, Moon, Sun, Monitor, Smartphone, Home, Search, ChevronRight, Check, X } from 'lucide-react-native';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { useTheme } from '@/context/ThemeContext';
import { useBrowserContext } from '@/context/BrowserContext';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function PrivacyScreen() {
  const {
    isPrivateMode,
    togglePrivateMode,
    adBlockingEnabled,
    toggleAdBlocking,
    cookieControlEnabled,
    toggleCookieControl,
    fingerprintProtectionEnabled,
    toggleFingerprintProtection,
    httpsOnlyEnabled,
    toggleHttpsOnly,
    scriptBlockingEnabled,
    toggleScriptBlocking,
    clearBrowsingData
  } = usePrivacyContext();

  const {
    currentSearchEngine,
    availableSearchEngines,
    currentHomepage,
    availableHomepages,
    customHomepageUrl,
    setSearchEngine,
    setHomepage,
    setCustomHomepageUrl
  } = useBrowserContext();

  const router = useRouter();
  const { isTablet, isDesktop, getIconSize, getFontSize, getResponsivePadding } = useResponsiveSize();
  const { styles: safeAreaStyles } = useSafeArea();
  const { isDarkMode, toggleTheme, isMobileMode, toggleUserAgentMode } = useTheme();

  const [showSearchEngineModal, setShowSearchEngineModal] = useState(false);
  const [showHomepageModal, setShowHomepageModal] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(customHomepageUrl);

  const dynamicStyles = commonStyles(isDarkMode);

  const goBack = () => {
    router.back();
  };

  const handleSaveCustomUrl = () => {
    let url = customUrlInput.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (url) {
      setCustomHomepageUrl(url);
      setHomepage({ name: 'Custom', url: '' });
      setShowCustomUrlInput(false);
      setShowHomepageModal(false);
    }
  };

  const getHomepageDisplayText = () => {
    if (currentHomepage.name === 'Custom' && customHomepageUrl) {
      try {
        const urlObj = new URL(customHomepageUrl);
        return urlObj.hostname;
      } catch (e) {
        return customHomepageUrl;
      }
    }
    return currentHomepage.name;
  };

  const handleClearBrowsingData = () => {
    Alert.alert(
      'Clear browsing data',
      'Are you sure you want to clear all browsing data? This will remove your history, cookies, and site data.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          onPress: clearBrowsingData,
          style: 'destructive'
        }
      ]
    );
  };

  // Get responsive values
  const iconSize = getIconSize(20);
  const fontSize = getFontSize(16);
  const responsivePadding = getResponsivePadding();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: dynamicStyles.container.base.backgroundColor },
        isPrivateMode && { backgroundColor: dynamicStyles.privateMode.backgroundColor } // Apply dynamic private background
      ]}
    >
      {/* StatusBar is handled by RootLayout, no need for one here */}

      <View style={[
        styles.header,
        { borderBottomColor: dynamicStyles.button.secondary.borderColor }, // Use theme border
        responsivePadding,
        safeAreaStyles.safeAreaTop
      ]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.headerButton}
          >
            <ArrowLeft size={iconSize} color={dynamicStyles.text.primary.color} />
          </TouchableOpacity>

          <Text style={[
            styles.title,
            { color: dynamicStyles.text.primary.color, fontSize: getFontSize(18) },
            isPrivateMode && styles.privateText // Keep private mode distinction if needed
          ]}>
            Privacy and security
          </Text>

          <View style={styles.headerButton} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          responsivePadding,
          safeAreaStyles.safeAreaBottom
        ]}
      >
        {/* Appearance Section */}
        <View style={[styles.section, { borderBottomColor: dynamicStyles.button.secondary.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.text.secondary.color }]}>
            Appearance
          </Text>
          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              {isDarkMode ? <Moon size={20} color={dynamicStyles.iconAccent.color} /> : <Sun size={20} color={dynamicStyles.iconAccent.color} />}
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }]}>
                {isDarkMode ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={isDarkMode ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]} // These might need adjustment for light theme
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              {isMobileMode ? <Smartphone size={20} color={dynamicStyles.iconAccent.color} /> : <Monitor size={20} color={dynamicStyles.iconAccent.color} />}
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }]}>
                Mobile Mode
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }]}>
                {isMobileMode ? 'Browse as mobile device' : 'Browse as desktop device'}
              </Text>
            </View>
            <Switch
              value={isMobileMode}
              onValueChange={toggleUserAgentMode}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={isMobileMode ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]}
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderBottomColor: dynamicStyles.button.secondary.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateText]}>
            Basics
          </Text>

          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              <Lock size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Incognito
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {isPrivateMode
                  ? 'Currently browsing in Incognito mode'
                  : 'Browse privately'}
              </Text>
            </View>
            <Switch
              value={isPrivateMode}
              onValueChange={togglePrivateMode}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={isPrivateMode ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]}
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              <Cookie size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Cookies
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {cookieControlEnabled ? 'Blocking third-party cookies' : 'Allow all cookies'}
              </Text>
            </View>
            <Switch
              value={cookieControlEnabled}
              onValueChange={toggleCookieControl}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={cookieControlEnabled ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]}
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, styles.settingButton]}
            onPress={() => setShowHomepageModal(true)}
          >
            <View style={styles.settingIcon}>
              <Home size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Homepage
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {getHomepageDisplayText()}
              </Text>
            </View>
            <View style={styles.settingIcon}>
              <ChevronRight size={20} color={dynamicStyles.iconAccent.color} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, styles.settingButton]}
            onPress={() => setShowSearchEngineModal(true)}
          >
            <View style={styles.settingIcon}>
              <Search size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Search Engine
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {currentSearchEngine.name}
              </Text>
            </View>
            <View style={styles.settingIcon}>
              <ChevronRight size={20} color={dynamicStyles.iconAccent.color} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderBottomColor: dynamicStyles.button.secondary.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateText]}>
            Advanced
          </Text>

          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              <Shield size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Ad & Tracker Blocking
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {adBlockingEnabled ? 'Blocking ads and trackers' : 'Ads and trackers allowed'}
              </Text>
            </View>
            <Switch
              value={adBlockingEnabled}
              onValueChange={toggleAdBlocking}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={adBlockingEnabled ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]}
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              <Globe size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                HTTPS-Only Mode
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {httpsOnlyEnabled ? 'Only connect to secure sites' : 'Allow all connections'}
              </Text>
            </View>
            <Switch
              value={httpsOnlyEnabled}
              onValueChange={toggleHttpsOnly}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={httpsOnlyEnabled ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]}
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              <Settings size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Script Blocking
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {scriptBlockingEnabled ? 'Blocking potentially harmful scripts' : 'Scripts allowed'}
              </Text>
            </View>
            <Switch
              value={scriptBlockingEnabled}
              onValueChange={toggleScriptBlocking}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={scriptBlockingEnabled ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]}
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, styles.settingButton]}>
            <View style={styles.settingIcon}>
              <Fingerprint size={20} color={isPrivateMode ? staticTheme.colors.primary.light : dynamicStyles.iconAccent.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Fingerprint Protection
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                {fingerprintProtectionEnabled ? 'Preventing browser fingerprinting' : 'Fingerprinting allowed'}
              </Text>
            </View>
            <Switch
              value={fingerprintProtectionEnabled}
              onValueChange={toggleFingerprintProtection}
              trackColor={{ false: staticTheme.colors.neutral[300], true: staticTheme.colors.primary.dark }}
              thumbColor={fingerprintProtectionEnabled ? staticTheme.colors.primary.main : staticTheme.colors.neutral[100]}
              ios_backgroundColor={staticTheme.colors.neutral[300]}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderBottomColor: dynamicStyles.button.secondary.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateText]}>
            Data
          </Text>

          <TouchableOpacity
            style={[styles.settingRow, styles.settingButton, styles.clearDataButton]}
            onPress={handleClearBrowsingData}
          >
            <View style={styles.settingIcon}>
              <Trash2 size={20} color={staticTheme.colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: dynamicStyles.text.primary.color }, isPrivateMode && styles.privateText]}>
                Clear browsing data
              </Text>
              <Text style={[styles.settingDescription, { color: dynamicStyles.text.secondary.color }, isPrivateMode && styles.privateDescription]}>
                Clear history, cookies, and site data
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Search Engine Selection Modal */}
      <Modal
        visible={showSearchEngineModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSearchEngineModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: isPrivateMode ? dynamicStyles.privateMode.backgroundColor : dynamicStyles.container.base.backgroundColor }
          ]}>
            <View style={[styles.modalHeader, { borderBottomColor: dynamicStyles.button.secondary.borderColor }]}>
              <Text style={[styles.modalTitle, { color: dynamicStyles.text.primary.color }]}>
                Select Search Engine
              </Text>
              <TouchableOpacity onPress={() => setShowSearchEngineModal(false)}>
                <ArrowLeft size={24} color={dynamicStyles.text.primary.color} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableSearchEngines}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    currentSearchEngine.name === item.name && { backgroundColor: dynamicStyles.button.secondary.backgroundColor }
                  ]}
                  onPress={() => {
                    setSearchEngine(item);
                    setShowSearchEngineModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: dynamicStyles.text.primary.color }]}>
                    {item.name}
                  </Text>
                  {currentSearchEngine.name === item.name && (
                    <View style={styles.selectedIndicator}>
                      <Text style={{ color: dynamicStyles.iconAccent.color }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Homepage Selection Modal */}
      <Modal
        visible={showHomepageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHomepageModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: isPrivateMode ? dynamicStyles.privateMode.backgroundColor : dynamicStyles.container.base.backgroundColor }
          ]}>
            <View style={[styles.modalHeader, { borderBottomColor: dynamicStyles.button.secondary.borderColor }]}>
              <Text style={[styles.modalTitle, { color: dynamicStyles.text.primary.color }]}>
                Select Homepage
              </Text>
              <TouchableOpacity onPress={() => setShowHomepageModal(false)}>
                <ArrowLeft size={24} color={dynamicStyles.text.primary.color} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableHomepages}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    currentHomepage.name === item.name && { backgroundColor: dynamicStyles.button.secondary.backgroundColor }
                  ]}
                  onPress={() => {
                    if (item.name === 'Custom') {
                      setCustomUrlInput(customHomepageUrl);
                      setShowCustomUrlInput(true);
                    } else {
                      setHomepage(item);
                      setShowHomepageModal(false);
                    }
                  }}
                >
                  <Text style={[styles.modalItemText, { color: dynamicStyles.text.primary.color }]}>
                    {item.name === 'Custom' && customHomepageUrl ? `Custom (${customHomepageUrl.includes('://') ? new URL(customHomepageUrl).hostname : customHomepageUrl})` : item.name}
                  </Text>
                  {currentHomepage.name === item.name && (
                    <View style={styles.selectedIndicator}>
                      <Text style={{ color: dynamicStyles.iconAccent.color }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Custom URL Input Modal */}
      <Modal
        visible={showCustomUrlInput}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomUrlInput(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: isPrivateMode ? dynamicStyles.privateMode.backgroundColor : dynamicStyles.container.base.backgroundColor }
          ]}>
            <View style={[styles.modalHeader, { borderBottomColor: dynamicStyles.button.secondary.borderColor }]}>
              <Text style={[styles.modalTitle, { color: dynamicStyles.text.primary.color }]}>
                Custom Homepage URL
              </Text>
              <TouchableOpacity onPress={() => setShowCustomUrlInput(false)}>
                <X size={24} color={dynamicStyles.text.primary.color} />
              </TouchableOpacity>
            </View>

            <View style={styles.customUrlContainer}>
              <Text style={[styles.customUrlLabel, { color: dynamicStyles.text.primary.color }]}>
                Enter website URL:
              </Text>
              <TextInput
                style={[
                  styles.customUrlInput,
                  {
                    backgroundColor: dynamicStyles.input.base.backgroundColor,
                    borderColor: dynamicStyles.input.base.borderColor,
                    color: dynamicStyles.text.primary.color
                  }
                ]}
                value={customUrlInput}
                onChangeText={setCustomUrlInput}
                placeholder="e.g., example.com or https://example.com"
                placeholderTextColor={dynamicStyles.text.secondary.color}
                autoCapitalize="none"
                keyboardType="url"
                returnKeyType="done"
                onSubmitEditing={handleSaveCustomUrl}
                autoFocus={true}
              />

              <View style={styles.customUrlButtons}>
                <TouchableOpacity
                  style={[
                    styles.customUrlButton,
                    styles.cancelButton,
                    { borderColor: dynamicStyles.button.secondary.borderColor }
                  ]}
                  onPress={() => {
                    setCustomUrlInput(customHomepageUrl);
                    setShowCustomUrlInput(false);
                  }}
                >
                  <Text style={[styles.buttonText, { color: dynamicStyles.text.primary.color }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.customUrlButton,
                    styles.saveButton,
                    { backgroundColor: staticTheme.colors.primary.main }
                  ]}
                  onPress={handleSaveCustomUrl}
                >
                  <Text style={[styles.buttonText, { color: staticTheme.colors.neutral[900] }]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { // Base container style, background color will be overridden by dynamicStyles
    flex: 1,
  } as ViewStyle,
  // privateContainer style object removed from StyleSheet as it's now fully dynamic inline
  header: {
    marginBottom: 8,
    borderBottomWidth: 1, // Added for consistency
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { // Base title style, color will be overridden
    fontFamily: staticTheme.typography.families.sansMedium,
  } as TextStyle,
  privateText: { // Style for text in private mode, color might need to be dynamic too
    color: staticTheme.colors.neutral[600], // Example: keep distinct private mode text color
  } as TextStyle,
  content: {
    paddingBottom: 24,
  },
  section: {
    paddingVertical: staticTheme.spacing.md,
    borderBottomWidth: 1,
    // borderBottomColor will be overridden by dynamicStyles
  } as ViewStyle,
  sectionTitle: { // Base section title, color will be overridden
    fontFamily: staticTheme.typography.families.sansMedium,
    fontSize: staticTheme.typography.sizes.sm,
    paddingHorizontal: staticTheme.spacing.lg,
    paddingVertical: staticTheme.spacing.sm,
    textTransform: 'uppercase',
  } as TextStyle,
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingButton: {
    paddingVertical: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 8,
    marginRight: 16,
  },
  settingLabel: { // Base label, color will be overridden
    fontFamily: staticTheme.typography.families.sansMedium,
    fontSize: staticTheme.typography.sizes.base,
    marginBottom: 2,
  } as TextStyle,
  settingDescription: { // Base description, color will be overridden
    fontFamily: staticTheme.typography.families.sans,
    fontSize: staticTheme.typography.sizes.sm,
  } as TextStyle,
  privateDescription: { // Style for description in private mode
    color: staticTheme.colors.neutral[400], // Example: keep distinct private mode description color
  } as TextStyle,
  clearDataButton: {
    borderBottomWidth: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: staticTheme.radius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: staticTheme.spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: staticTheme.typography.sizes.lg,
    fontFamily: staticTheme.typography.families.sansMedium,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: staticTheme.spacing.lg,
  },
  modalItemText: {
    fontSize: staticTheme.typography.sizes.base,
    fontFamily: staticTheme.typography.families.sans,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customUrlContainer: {
    padding: staticTheme.spacing.lg,
  },
  customUrlLabel: {
    fontSize: staticTheme.typography.sizes.base,
    fontFamily: staticTheme.typography.families.sansMedium,
    marginBottom: staticTheme.spacing.md,
  },
  customUrlInput: {
    borderWidth: 1,
    borderRadius: staticTheme.radius.md,
    padding: staticTheme.spacing.md,
    fontSize: staticTheme.typography.sizes.base,
    fontFamily: staticTheme.typography.families.sans,
    marginBottom: staticTheme.spacing.lg,
  },
  customUrlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: staticTheme.spacing.md,
  },
  customUrlButton: {
    flex: 1,
    paddingVertical: staticTheme.spacing.md,
    paddingHorizontal: staticTheme.spacing.lg,
    borderRadius: staticTheme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor applied inline
  },
  buttonText: {
    fontSize: staticTheme.typography.sizes.base,
    fontFamily: staticTheme.typography.families.sansMedium,
  },
});

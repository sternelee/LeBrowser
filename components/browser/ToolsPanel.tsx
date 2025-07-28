import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import {
  Languages,
  Pin,
  Search,
  Share,
  ZoomIn,
  ZoomOut,
  Monitor,
  Settings,
  X,
} from 'lucide-react-native';

interface ToolsPanelProps {
  visible: boolean;
  onClose: () => void;
  isPrivateMode: boolean;
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

export function ToolsPanel({
  visible,
  onClose,
  isPrivateMode,
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
}: ToolsPanelProps) {
  const { isDarkColorScheme } = useColorScheme();

  const ToolButton = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      className="flex-1 items-center py-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-xl bg-secondary/60 justify-center items-center mb-2">
        {icon}
      </View>
      <Text className="text-xs text-muted-foreground text-center">{label}</Text>
    </TouchableOpacity>
  );

  const SettingRow = ({
    icon,
    label,
    onPress,
    rightContent,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    rightContent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 justify-center items-center mr-4">{icon}</View>
      <Text className="flex-1 text-base text-foreground">{label}</Text>
      {rightContent}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View
          className={`
            rounded-t-3xl p-6 max-h-4/5
            ${
              isPrivateMode
                ? 'bg-purple-900 dark:bg-purple-950'
                : 'bg-background'
            }
          `}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-semibold text-foreground">工具</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-secondary/60 justify-center items-center"
              activeOpacity={0.7}
            >
              <X size={16} color={isDarkColorScheme ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Grid */}
          <View className="flex-row mb-8">
            <ToolButton
              icon={
                <Languages
                  size={20}
                  color={isDarkColorScheme ? '#ffffff' : '#000000'}
                />
              }
              label="Translate"
              onPress={onTranslate}
            />
            <ToolButton
              icon={
                <Pin
                  size={20}
                  color={isDarkColorScheme ? '#ffffff' : '#000000'}
                />
              }
              label="Pin"
              onPress={onPin}
            />
            <ToolButton
              icon={
                <Search
                  size={20}
                  color={isDarkColorScheme ? '#ffffff' : '#000000'}
                />
              }
              label="Find"
              onPress={onFind}
            />
            <ToolButton
              icon={
                <Share
                  size={20}
                  color={isDarkColorScheme ? '#ffffff' : '#000000'}
                />
              }
              label="Share"
              onPress={onShare}
            />
          </View>

          {/* Zoom Controls */}
          <SettingRow
            icon={
              <ZoomIn
                size={20}
                color={isDarkColorScheme ? '#ffffff' : '#000000'}
              />
            }
            label="Reset Zoom"
            onPress={onResetZoom}
            rightContent={
              <View className="flex-row items-center">
                <Text className="text-sm text-muted-foreground mr-3">
                  {zoomLevel}%
                </Text>
                <TouchableOpacity
                  onPress={onZoomIn}
                  className="w-8 h-8 rounded-full bg-secondary/60 justify-center items-center mr-2"
                  activeOpacity={0.7}
                >
                  <ZoomIn
                    size={16}
                    color={isDarkColorScheme ? '#ffffff' : '#000000'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onZoomOut}
                  className="w-8 h-8 rounded-full bg-secondary/60 justify-center items-center"
                  activeOpacity={0.7}
                >
                  <ZoomOut
                    size={16}
                    color={isDarkColorScheme ? '#ffffff' : '#000000'}
                  />
                </TouchableOpacity>
              </View>
            }
          />

          {/* Desktop Site */}
          <SettingRow
            icon={
              <Monitor
                size={20}
                color={isDarkColorScheme ? '#ffffff' : '#000000'}
              />
            }
            label="Desktop Site"
            onPress={onDesktopSite}
          />

          {/* Site Settings */}
          <SettingRow
            icon={
              <Settings
                size={20}
                color={isDarkColorScheme ? '#ffffff' : '#000000'}
              />
            }
            label="Site Settings"
            onPress={onSiteSettings}
          />
        </View>
      </View>
    </Modal>
  );
}

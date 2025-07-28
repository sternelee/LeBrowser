import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  ExternalLink,
  Star,
  Shield,
  Zap,
} from 'lucide-react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { usePrivacyContext } from '@/context/PrivacyContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HelpScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { isPrivateMode } = usePrivacyContext();

  const goBack = () => {
    router.back();
  };

  const helpTopics = [
    {
      icon: <Shield />,
      title: 'Privacy & Security',
      description:
        'Learn about incognito mode, ad blocking, and data protection',
      badge: 'Popular',
    },
    {
      icon: <Zap />,
      title: 'Getting Started',
      description: 'Basic browsing, bookmarks, and navigation tips',
      badge: 'New',
    },
    {
      icon: <HelpCircle />,
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
    },
  ];

  const contactOptions = [
    {
      icon: <MessageCircle />,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
    },
    {
      icon: <Mail />,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'Send Email',
    },
  ];

  return (
    <SafeAreaView
      className={`
        flex-1
        ${isDarkColorScheme ? 'dark' : ''}
        ${isPrivateMode ? 'bg-purple-900 dark:bg-purple-950' : 'bg-background'}
      `}
    >
      {/* Header */}
      <View className="border-b border-border px-4 py-3 mb-4">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center"
            onPress={goBack}
          >
            <ArrowLeft
              size={20}
              color={isDarkColorScheme ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>

          <Text className="text-foreground text-lg font-medium">
            Help & Support
          </Text>

          <View className="w-10 h-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Welcome Section */}
        <Card
          className={`
            mb-6
            ${isPrivateMode ? 'bg-purple-800/50 border-purple-700' : 'bg-card'}
          `}
        >
          <CardHeader>
            <CardTitle className="text-card-foreground text-xl">
              How can we help you?
            </CardTitle>
            <CardDescription>
              Find answers to common questions or get in touch with our support
              team
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Help Topics */}
        <View className="mb-6">
          <Text className="text-foreground text-lg font-semibold mb-3">
            Popular Topics
          </Text>
          {helpTopics.map((topic, index) => (
            <Card
              key={index}
              className={`
                mb-3
                ${
                  isPrivateMode
                    ? 'bg-purple-800/50 border-purple-700'
                    : 'bg-card'
                }
              `}
            >
              <CardContent className="p-4">
                <TouchableOpacity className="flex-row items-center">
                  <View className="w-10 h-10 justify-center items-center bg-primary/10 rounded-full mr-3">
                    {React.cloneElement(topic.icon as React.ReactElement, {
                      size: 20,
                      color: isDarkColorScheme ? '#3b82f6' : '#2563eb',
                    })}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-card-foreground font-medium text-base mr-2">
                        {topic.title}
                      </Text>
                      {topic.badge && (
                        <Badge
                          variant={
                            topic.badge === 'New' ? 'default' : 'secondary'
                          }
                        >
                          {topic.badge}
                        </Badge>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-sm">
                      {topic.description}
                    </Text>
                  </View>
                  <ExternalLink
                    size={16}
                    color={isDarkColorScheme ? '#9ca3af' : '#6b7280'}
                  />
                </TouchableOpacity>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Contact Support */}
        <View className="mb-6">
          <Text className="text-foreground text-lg font-semibold mb-3">
            Contact Support
          </Text>
          {contactOptions.map((option, index) => (
            <Card
              key={index}
              className={`
                mb-3
                ${
                  isPrivateMode
                    ? 'bg-purple-800/50 border-purple-700'
                    : 'bg-card'
                }
              `}
            >
              <CardContent className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 justify-center items-center bg-secondary rounded-full mr-3">
                      {React.cloneElement(option.icon as React.ReactElement, {
                        size: 20,
                        color: isDarkColorScheme ? '#ffffff' : '#000000',
                      })}
                    </View>
                    <View className="flex-1">
                      <Text className="text-card-foreground font-medium text-base mb-1">
                        {option.title}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  <Button variant="outline" size="sm" title={option.action} />
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* App Info */}
        <Card
          className={`
            ${isPrivateMode ? 'bg-purple-800/50 border-purple-700' : 'bg-card'}
          `}
        >
          <CardHeader>
            <CardTitle className="text-card-foreground">
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Version</Text>
                <Text className="text-card-foreground">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Build</Text>
                <Text className="text-card-foreground">2024.01.15</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Platform</Text>
                <Text className="text-card-foreground">React Native</Text>
              </View>
            </View>

            <View className="mt-4 pt-4 border-t border-border">
              <Button variant="ghost" className="w-full" onPress={() => {}}>
                <View className="flex-row items-center">
                  <Star
                    size={16}
                    color={isDarkColorScheme ? '#fbbf24' : '#f59e0b'}
                  />
                  <Text className="ml-2 text-current">Rate this app</Text>
                </View>
              </Button>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

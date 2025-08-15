import { generateAPIUrl } from '@/utils';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, SendMessage } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useBrowserContext } from '@/context/BrowserContext';
import { useAIContext } from '@/context/AIContext';
import { Command, CommandMenu } from '@/components/ui/CommandMenu';
import { LanguageSelectionModal } from '@/components/ui/LanguageSelectionModal';
import TypingIndicator from '@/components/ui/TypingIndicator';
import { useRouter } from 'expo-router';
import { FileText, Languages, HelpCircle, Copy, AlertTriangle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const ErrorDisplay = ({ error }: { error: Error }) => (
  <View style={styles.errorContainer}>
    <AlertTriangle color="#ff453a" size={20} />
    <Text style={styles.errorText}>{error.message}</Text>
  </View>
);

const ToolUIWrapper = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View style={styles.toolUIContainer}>
    {icon}
    <Text style={styles.toolUIText}>{text}</Text>
  </View>
);

function SummarizeToolUI({ sendMessage }: { sendMessage: SendMessage }) {
  const { browserViewRef } = useBrowserContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const summarize = async () => {
      try {
        const pageContent = await browserViewRef.current?.getPageContent();
        if (pageContent) {
          sendMessage({
            role: 'user',
            content: `Please summarize the following text:\n\n${pageContent}`,
          });
        } else {
          throw new Error('Could not get page content.');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error summarizing page:', errorMessage);
        setError(errorMessage);
      }
    };
    summarize();
  }, [browserViewRef, sendMessage]);

  if (error) {
    return <ToolUIWrapper icon={<FileText color="#ff453a" size={18} />} text={`Error: ${error}`} />;
  }

  return <ToolUIWrapper icon={<ActivityIndicator size="small" />} text="Summarizing page..." />;
}

function TranslateToolUI({ sendMessage, language }: { sendMessage: SendMessage; language: string }) {
  const { browserViewRef } = useBrowserContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const translate = async () => {
      try {
        const pageContent = await browserViewRef.current?.getPageContent();
        if (pageContent) {
          sendMessage({
            role: 'user',
            content: `Please translate the following text to ${language}:\n\n${pageContent}`,
          });
        } else {
          throw new Error('Could not get page content.');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error translating page:', errorMessage);
        setError(errorMessage);
      }
    };
    translate();
  }, [browserViewRef, sendMessage, language]);

  if (error) {
    return <ToolUIWrapper icon={<Languages color="#ff453a" size={18} />} text={`Error: ${error}`} />;
  }

  return <ToolUIWrapper icon={<ActivityIndicator size="small" />} text={`Translating to ${language}...`} />;
}

function AnswerQuestionToolUI({ sendMessage, question }: { sendMessage: SendMessage; question: string }) {
  const { browserViewRef } = useBrowserContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const answer = async () => {
      try {
        const pageContent = await browserViewRef.current?.getPageContent();
        if (pageContent) {
          sendMessage({
            role: 'user',
            content: `Using the following text, please answer the question "${question}":\n\n${pageContent}`,
          });
        } else {
          throw new Error('Could not get page content.');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error answering question:', errorMessage);
        setError(errorMessage);
      }
    };
    answer();
  }, [browserViewRef, sendMessage, question]);

  if (error) {
    return <ToolUIWrapper icon={<HelpCircle color="#ff453a" size={18} />} text={`Error: ${error}`} />;
  }

  return <ToolUIWrapper icon={<ActivityIndicator size="small" />} text={`Searching page for answer...`} />;
}


export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandFilter, setCommandFilter] = useState('');
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const { browserViewRef, currentUrl } = useBrowserContext();
  const { activeProvider, apiKeys } = useAIContext();
  const router = useRouter();

  const { messages, error, sendMessage, setMessages, isLoading } = useChat({
    body: {
      provider: activeProvider,
      apiKey: apiKeys[activeProvider],
    },
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/api/chat'),
    }),
    onError: (error) => console.error(error, 'ERROR'),
  });

  const handleSummarizePress = () => {
    if (currentUrl && currentUrl !== 'about:home') {
      // Add a placeholder message to let the user know something is happening
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          parts: [{ type: 'tool-summarizeWebsite', name: 'summarizeWebsite', input: {} }],
        },
      ]);
    } else {
      alert('Navigate to a webpage to summarize.');
    }
  };

  const handleTranslatePress = (language: string) => {
    if (currentUrl && currentUrl !== 'about:home') {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          parts: [
            {
              type: 'tool-translateWebsite',
              name: 'translateWebsite',
              input: { language },
            },
          ],
        },
      ]);
    } else {
      alert('Navigate to a webpage to translate.');
    }
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    alert('Copied to clipboard!');
  };

  const commands: Command[] = [
    {
      name: 'summarize',
      description: 'Summarize the current webpage',
      onSelect: () => {
        handleSummarizePress();
        setShowCommandMenu(false);
        setInput('');
      },
    },
    {
      name: 'translate',
      description: 'Translate the current webpage to another language',
      onSelect: () => {
        setShowCommandMenu(false);
        setIsLanguageModalVisible(true);
        setInput('');
      },
    },
  ];

  const onLanguageSelect = (language: string) => {
    handleTranslatePress(language);
    setIsLanguageModalVisible(false);
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (text.startsWith('/')) {
      setShowCommandMenu(true);
      setCommandFilter(text.substring(1));
    } else {
      setShowCommandMenu(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LanguageSelectionModal
        visible={isLanguageModalVisible}
        onClose={() => setIsLanguageModalVisible(false)}
        onSelectLanguage={onLanguageSelect}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Chat</Text>
        <TouchableOpacity onPress={() => router.push('/ai-settings')}>
          <Text style={styles.settingsButton}>Settings</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.chatContainer}>
        <ScrollView style={styles.messagesContainer}>
          {error && <ErrorDisplay error={error} />}
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userMessageRow : styles.aiMessageRow,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userMessageBubble : styles.aiMessageBubble,
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageRole}>
                      {isUser ? 'You' : 'AI'}
                    </Text>
                    {!isUser && m.parts.some(p => p.type === 'text') && (
                      <TouchableOpacity
                        onPress={() =>
                          handleCopy(
                            m.parts
                              .filter((p) => p.type === 'text')
                              .map((p) => (p as any).text)
                              .join('')
                          )
                        }
                      >
                        <Copy color="#c9d1d9" size={16} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {m.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Text key={`${m.id}-${i}`} style={styles.messageText}>
                            {part.text}
                          </Text>
                        );
                      case 'tool-summarizeWebsite':
                        return (
                          <SummarizeToolUI
                            key={`${m.id}-${i}`}
                            sendMessage={sendMessage}
                          />
                        );
                      case 'tool-translateWebsite':
                        return (
                          <TranslateToolUI
                            key={`${m.id}-${i}`}
                            sendMessage={sendMessage}
                            language={part.input.language}
                          />
                        );
                      case 'tool-answerQuestionAboutWebsite':
                        return (
                          <AnswerQuestionToolUI
                            key={`${m.id}-${i}`}
                            sendMessage={sendMessage}
                            question={part.input.question}
                          />
                        );
                    }
                  })}
                </View>
              </View>
            );
          })}
          {isLoading && (
            <View style={styles.aiMessageRow}>
              <View style={styles.aiMessageBubble}>
                <TypingIndicator />
              </View>
            </View>
          )}
        </ScrollView>
        <View style={styles.inputRow}>
          {showCommandMenu && (
            <CommandMenu commands={commands} filter={commandFilter} />
          )}
          <TextInput
            style={styles.input}
            placeholder="Ask a question or type '/' for commands..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={(e) => {
              if (showCommandMenu || input === '') return;
              e.preventDefault();
              sendMessage({ role: 'user', content: input });
              setInput('');
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toolUIContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  toolUIText: {
    color: '#c9d1d9',
    fontSize: 14,
    marginLeft: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    color: '#58a6ff',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messageRow: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userMessageBubble: {
    backgroundColor: '#30363d',
    borderBottomRightRadius: 5,
  },
  aiMessageBubble: {
    backgroundColor: '#1f2328',
    borderBottomLeftRadius: 5,
  },
  messageRole: {
    fontWeight: 'bold',
    color: '#c9d1d9',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  messageText: {
    color: '#c9d1d9',
    fontSize: 16,
    lineHeight: 22,
  },
  inputRow: {
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2328',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    borderRadius: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
    padding: 12,
    borderRadius: 12,
    margin: 8,
  },
  errorText: {
    color: '#ff453a',
    fontSize: 16,
    marginLeft: 10,
  },
});

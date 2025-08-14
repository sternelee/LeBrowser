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
} from 'react-native';
import { useBrowserContext } from '@/context/BrowserContext';
import { Command, CommandMenu } from '@/components/ui/CommandMenu';

function SummarizeToolUI({
  sendMessage,
}: {
  sendMessage: SendMessage;
}) {
  const { browserViewRef } = useBrowserContext();
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error('Error summarizing page:', error);
        sendMessage({
          role: 'user',
          content: `I tried to summarize the page, but I encountered an error: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    summarize();
  }, [browserViewRef, sendMessage]);

  return (
    <View style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Text>Summarizing page content...</Text>
      )}
    </View>
  );
}

function TranslateToolUI({
  sendMessage,
  language,
}: {
  sendMessage: SendMessage;
  language: string;
}) {
  const { browserViewRef } = useBrowserContext();
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error('Error translating page:', error);
        sendMessage({
          role: 'user',
          content: `I tried to translate the page, but I encountered an error: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    translate();
  }, [browserViewRef, sendMessage, language]);

  return (
    <View style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Text>Translating page content to {language}...</Text>
      )}
    </View>
  );
}

function AnswerQuestionToolUI({
  sendMessage,
  question,
}: {
  sendMessage: SendMessage;
  question: string;
}) {
  const { browserViewRef } = useBrowserContext();
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error('Error answering question:', error);
        sendMessage({
          role: 'user',
          content: `I tried to answer the question, but I encountered an error: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    answer();
  }, [browserViewRef, sendMessage, question]);

  return (
    <View style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Text>Finding answer on page...</Text>
      )}
    </View>
  );
}


export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandFilter, setCommandFilter] = useState('');
  const { browserViewRef, currentUrl } = useBrowserContext();

  const { messages, error, sendMessage, setMessages } = useChat({
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
      description: 'Translate the current webpage to Spanish',
      onSelect: () => {
        handleTranslatePress('Spanish');
        setShowCommandMenu(false);
        setInput('');
      },
    },
  ];

  const handleInputChange = (text: string) => {
    setInput(text);
    if (text.startsWith('/')) {
      setShowCommandMenu(true);
      setCommandFilter(text.substring(1));
    } else {
      setShowCommandMenu(false);
    }
  };

  if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ height: '100%', backgroundColor: '#000' }}>
      <View
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingHorizontal: 8,
        }}
      >
        <ScrollView style={{ flex: 1 }}>
          {messages.map((m) => (
            <View key={m.id} style={{ marginVertical: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <View style={{ backgroundColor: m.role === 'user' ? '#007bff' : '#333', padding: 10, borderRadius: 10 }}>
                <Text style={{ fontWeight: '700', color: 'white' }}>{m.role}</Text>
                {m.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <Text key={`${m.id}-${i}`} style={{color: 'white'}}>{part.text}</Text>;
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
          ))}
        </ScrollView>
        <View style={{ paddingBottom: 8 }}>
          {showCommandMenu && (
            <CommandMenu commands={commands} filter={commandFilter} />
          )}
          <TextInput
            style={{ flex: 1, backgroundColor: 'white', padding: 8, color: 'black', borderRadius: 8 }}
            placeholder="Ask a question or type '/' for commands..."
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={(e) => {
              if (showCommandMenu) return; // Don't submit if menu is open
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

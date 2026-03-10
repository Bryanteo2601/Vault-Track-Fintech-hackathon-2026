import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCallback } from 'react';
import { chatWithAI } from '@/lib/gemini-ai-service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { data, refreshData } = useAppData();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! 👋 I\'m your Financial Wellness & Portfolio Analysis Assistant. I analyze your portfolio data to identify concentration risks, liquidity gaps, and asset allocation imbalances. I provide specific, data-driven insights—not generic advice. Try asking me to "analyze my portfolio" or "review my investments."',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Refresh portfolio data whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Convert messages to format expected by AI service
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content,
      }));

      // Use client-side AI service for dynamic responses
      const aiResponse = await chatWithAI(
        userMessage.content,
        data,
        conversationHistory
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScreenContainer containerClassName="bg-background">
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable onPress={() => router.replace('/(tabs)/index' as any)} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </Pressable>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>Portfolio Analysis</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Powered by Gemini</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, paddingVertical: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={{
                marginBottom: 12,
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <View
                style={{
                  maxWidth: '80%',
                  backgroundColor: message.role === 'user' ? colors.primary : colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderColor: colors.border,
                  borderWidth: message.role === 'user' ? 0 : 1,
                }}
              >
                <Text
                  style={{
                    color: message.role === 'user' ? '#FFFFFF' : colors.foreground,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {message.content}
                </Text>
                <Text
                  style={{
                    color: message.role === 'user' ? 'rgba(255,255,255,0.6)' : colors.muted,
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderColor: colors.border, borderWidth: 1 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                fontSize: 14,
                maxHeight: 100,
              }}
              placeholder="Ask about your finances..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!loading}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!input.trim() || loading}
              style={({ pressed }) => [
                {
                  backgroundColor: !input.trim() || loading ? colors.border : colors.primary,
                  borderRadius: 8,
                  padding: 10,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>📤</Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

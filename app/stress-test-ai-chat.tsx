import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STRESS_TEST_AI_RESPONSES: Record<string, string> = {
  'market crash': 'In a market crash scenario like 2008, your portfolio could experience significant losses across equities and real estate. The key is to maintain your emergency fund and avoid panic selling. Consider this an opportunity to rebalance and buy quality assets at lower prices.',
  'interest rate': 'Rising interest rates typically hurt bond prices and real estate valuations. However, they can benefit your savings and fixed-income investments. Review your debt obligations as higher rates will increase borrowing costs.',
  'inflation': 'Inflation erodes purchasing power. Real assets like real estate and commodities tend to perform well during inflation. Consider increasing allocation to inflation-protected securities and dividend-paying stocks.',
  'recession': 'During recessions, defensive stocks, bonds, and cash perform better. Ensure your emergency fund covers 6-12 months of expenses. Review your job security and consider diversifying income sources.',
  'currency': 'Currency devaluation affects foreign investments and imports. If you have international exposure, this could impact returns. Consider hedging with currency-diversified investments or foreign bonds.',
  'resilience': 'Your portfolio resilience score reflects how well your assets withstand market shocks. A score above 70 is considered good. Improve resilience through diversification, maintaining emergency funds, and regular rebalancing.',
  'diversification': 'Diversification is your best defense against market volatility. Spread investments across stocks, bonds, real estate, and commodities. Within each category, diversify further by geography, sector, and company size.',
  'stress test': 'Stress testing helps identify vulnerabilities in your portfolio. Regular stress testing (quarterly or semi-annually) helps you prepare for market downturns and adjust your strategy proactively.',
  'default': 'That\'s a great question about portfolio stress testing. Stress tests simulate various market scenarios to help you understand how your portfolio might perform during economic downturns. They\'re essential for risk management and long-term financial planning.',
};

export default function StressTestAIChatScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! 👋 I\'m your Portfolio Stress Testing AI Assistant. I can help you understand how your portfolio might perform under different market scenarios. Ask me about market crashes, interest rate changes, inflation, recessions, or any stress testing concerns!',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    for (const [keyword, response] of Object.entries(STRESS_TEST_AI_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    return STRESS_TEST_AI_RESPONSES['default'];
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputText),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer containerClassName="bg-background">
        {/* Header */}
        <View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12 }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSymbol name="chevron.left" size={24} color={colors.accent} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.accent }}>Back</Text>
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground }}>Stress Test AI Chat</Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>Ask about portfolio resilience and market scenarios</Text>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, marginBottom: 12 }}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={{
                flexDirection: 'row',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 12,
                paddingHorizontal: 4,
              }}
            >
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: message.role === 'user' ? colors.primary : colors.surface,
                    borderColor: colors.border,
                    maxWidth: '85%',
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: message.role === 'user' ? 'white' : colors.foreground,
                    lineHeight: 20,
                  }}
                >
                  {message.content}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : colors.muted,
                    marginTop: 6,
                    textAlign: 'right',
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 12, paddingHorizontal: 4 }}>
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 14, color: colors.muted }}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="Ask about stress testing..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <IconSymbol name="paperplane.fill" size={18} color={inputText.trim() && !isLoading ? 'white' : colors.muted} />
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

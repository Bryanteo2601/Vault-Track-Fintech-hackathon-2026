import { ScrollView, View, Text, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { getStockAnalysis, StockAnalysis } from '@/lib/finnhub-service';
import { ChartContainer } from '@/components/chart-container';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    if (!symbol || typeof symbol !== 'string') return;

    setLoading(true);
    setError('');

    try {
      const data = await getStockAnalysis(symbol);
      if (data) {
        setAnalysis(data);
      } else {
        setError('Failed to load stock data');
      }
    } catch (err) {
      setError('Error loading stock data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2F6FED" />
        <Text className="text-muted text-sm mt-4">Loading {symbol}...</Text>
      </ScreenContainer>
    );
  }

  if (error || !analysis) {
    return (
      <ScreenContainer className="bg-background flex-1">
        <View className="px-6 py-4 border-b border-border flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary text-lg">←</Text>
          </Pressable>
          <Text className="text-lg font-semibold text-foreground">{symbol}</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-error text-center">{error || 'No data available'}</Text>
          <Pressable
            onPress={loadStockData}
            className="mt-6 px-6 py-3 bg-primary rounded-md"
          >
            <Text className="text-foreground font-semibold">Retry</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const { quote, profile, news, recommendation } = analysis;
  const isPositive = quote.change >= 0;

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <Text className="text-primary text-lg">←</Text>
            </Pressable>
            <View>
              <Text className="text-lg font-semibold text-foreground">{quote.symbol}</Text>
              <Text className="text-xs text-muted">{profile.name}</Text>
            </View>
          </View>
          <Pressable
            onPress={loadStockData}
            className="px-3 py-2 bg-surface border border-border rounded-md"
          >
            <Text className="text-foreground text-xs font-semibold">Refresh</Text>
          </Pressable>
        </View>

        <View className="p-6 gap-6">
          {/* Price Card */}
          <View className="bg-surface border border-border rounded-lg p-6">
            <Text className="text-muted text-xs uppercase tracking-wide mb-2">Current Price</Text>
            <Text className="text-4xl font-bold text-foreground mb-2">
              ${quote.price.toFixed(2)}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
                {isPositive ? '+' : ''}{quote.change.toFixed(2)}
              </Text>
              <Text className={`text-sm ${isPositive ? 'text-success' : 'text-error'}`}>
                ({quote.changePercent.toFixed(2)}%)
              </Text>
            </View>
            <View className="mt-4 pt-4 border-t border-border flex-row justify-between">
              <View>
                <Text className="text-xs text-muted">Open</Text>
                <Text className="text-sm font-mono text-foreground">${quote.open.toFixed(2)}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">High</Text>
                <Text className="text-sm font-mono text-foreground">${quote.high.toFixed(2)}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Low</Text>
                <Text className="text-sm font-mono text-foreground">${quote.low.toFixed(2)}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Prev Close</Text>
                <Text className="text-sm font-mono text-foreground">${quote.previousClose.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Recommendation */}
          <View className="bg-primary/10 border border-primary rounded-lg p-4">
            <Text className="text-xs text-muted uppercase tracking-wide mb-2">AI Recommendation</Text>
            <Text className="text-sm font-semibold text-foreground">{recommendation}</Text>
          </View>

          {/* Company Profile */}
          <View className="bg-surface border border-border rounded-lg p-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Company Profile</Text>
            <View className="gap-3">
              <View>
                <Text className="text-xs text-muted">Industry</Text>
                <Text className="text-sm text-foreground">{profile.industry || 'N/A'}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Country</Text>
                <Text className="text-sm text-foreground">{profile.country || 'N/A'}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Exchange</Text>
                <Text className="text-sm text-foreground">{profile.exchange || 'N/A'}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Market Cap</Text>
                <Text className="text-sm font-mono text-foreground">
                  ${(profile.marketCap / 1e9).toFixed(2)}B
                </Text>
              </View>
              {profile.website && (
                <View>
                  <Text className="text-xs text-muted">Website</Text>
                  <Text className="text-sm text-primary">{profile.website}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Latest News */}
          {news.length > 0 && (
            <View>
              <Text className="text-sm font-semibold text-foreground mb-3">Latest News</Text>
              <FlatList
                scrollEnabled={false}
                data={news}
                keyExtractor={(item, index) => `${index}`}
                renderItem={({ item }) => (
                  <View className="bg-surface border border-border rounded-lg p-4 mb-3">
                    <Text className="text-sm font-semibold text-foreground mb-2">{item.headline}</Text>
                    <Text className="text-xs text-muted mb-2">{item.source}</Text>
                    <Text className="text-xs text-muted">
                      {new Date(item.datetime).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              />
            </View>
          )}

          {/* Chart Placeholder */}
          <ChartContainer
            title="Price Chart"
            subtitle="Real-time data"
            height={250}
          >
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted text-sm">Chart visualization coming soon</Text>
            </View>
          </ChartContainer>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

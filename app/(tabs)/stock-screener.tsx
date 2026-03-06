import { ScrollView, View, Text, Pressable, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { searchStocks, getStockQuote, StockQuote } from '@/lib/finnhub-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WatchlistItem {
  symbol: string;
  addedAt: number;
}

export default function StockScreenerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; description: string }>>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistQuotes, setWatchlistQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    if (watchlist.length > 0) {
      loadWatchlistQuotes();
    }
  }, [watchlist]);

  const loadWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('stock_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const loadWatchlistQuotes = async () => {
    setLoadingQuotes(true);
    const quotes: Record<string, StockQuote> = {};

    for (const item of watchlist) {
      const quote = await getStockQuote(item.symbol);
      if (quote) {
        quotes[item.symbol] = quote;
      }
    }

    setWatchlistQuotes(quotes);
    setLoadingQuotes(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchStocks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol: string) => {
    const newItem: WatchlistItem = {
      symbol,
      addedAt: Date.now(),
    };

    const updated = [...watchlist, newItem];
    setWatchlist(updated);

    try {
      await AsyncStorage.setItem('stock_watchlist', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }

    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFromWatchlist = async (symbol: string) => {
    const updated = watchlist.filter((item) => item.symbol !== symbol);
    setWatchlist(updated);

    try {
      await AsyncStorage.setItem('stock_watchlist', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleStockTap = (symbol: string) => {
    router.push({
      pathname: '/stock-detail',
      params: { symbol },
    });
  };

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">Stock Screener</Text>
          <Text className="text-sm text-muted mt-1">Search and monitor stocks</Text>
        </View>

        <View className="p-6 gap-6">
          {/* Search Box */}
          <View className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center gap-2">
            <Text className="text-muted">🔍</Text>
            <TextInput
              placeholder="Search stocks (e.g., AAPL, TSLA)"
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={handleSearch}
              className="flex-1 text-foreground text-sm"
            />
          </View>

          {/* Search Results */}
          {searchQuery && (
            <View>
              <Text className="text-xs text-muted uppercase tracking-wide mb-3">Search Results</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#2F6FED" />
              ) : searchResults.length > 0 ? (
                <FlatList
                  scrollEnabled={false}
                  data={searchResults}
                  keyExtractor={(item) => item.symbol}
                  renderItem={({ item }) => (
                    <View className="bg-surface border border-border rounded-lg p-4 mb-2 flex-row items-center justify-between">
                      <Pressable
                        onPress={() => handleStockTap(item.symbol)}
                        className="flex-1"
                      >
                        <Text className="text-sm font-semibold text-foreground">{item.symbol}</Text>
                        <Text className="text-xs text-muted mt-1">{item.description}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => addToWatchlist(item.symbol)}
                        className="px-3 py-2 bg-primary rounded-md"
                      >
                        <Text className="text-foreground text-xs font-semibold">Add</Text>
                      </Pressable>
                    </View>
                  )}
                />
              ) : (
                <Text className="text-sm text-muted text-center py-4">No results found</Text>
              )}
            </View>
          )}

          {/* Watchlist */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs text-muted uppercase tracking-wide">My Watchlist</Text>
              <Text className="text-xs text-muted">{watchlist.length} stocks</Text>
            </View>

            {loadingQuotes && watchlist.length > 0 ? (
              <ActivityIndicator size="small" color="#2F6FED" />
            ) : watchlist.length > 0 ? (
              <FlatList
                scrollEnabled={false}
                data={watchlist}
                keyExtractor={(item) => item.symbol}
                renderItem={({ item }) => {
                  const quote = watchlistQuotes[item.symbol];
                  const isPositive = quote?.change >= 0;

                  return (
                    <Pressable
                      onPress={() => handleStockTap(item.symbol)}
                      className="bg-surface border border-border rounded-lg p-4 mb-2 flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">{item.symbol}</Text>
                        {quote && (
                          <View className="flex-row items-center gap-2 mt-1">
                            <Text className="text-sm font-mono text-foreground">
                              ${quote.price.toFixed(2)}
                            </Text>
                            <Text className={`text-xs ${isPositive ? 'text-success' : 'text-error'}`}>
                              {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                            </Text>
                          </View>
                        )}
                      </View>
                      <Pressable
                        onPress={() => removeFromWatchlist(item.symbol)}
                        className="px-3 py-2 bg-error/20 border border-error rounded-md"
                      >
                        <Text className="text-error text-xs font-semibold">Remove</Text>
                      </Pressable>
                    </Pressable>
                  );
                }}
              />
            ) : (
              <View className="bg-surface border border-border rounded-lg p-6 items-center">
                <Text className="text-muted text-sm">No stocks in watchlist</Text>
                <Text className="text-muted text-xs mt-2">Search and add stocks to monitor them</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

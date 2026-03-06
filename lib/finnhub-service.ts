/**
 * Finnhub Stock Data Service
 * Provides real-time stock quotes, technical indicators, and company news
 * Supports US and international stocks (via ADR)
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface StockQuote {
  symbol: string;
  price: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface TechnicalIndicators {
  rsi: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  movingAverage50: number | null;
  movingAverage200: number | null;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  description: string;
  country: string;
  currency: string;
  exchange: string;
  marketCap: number;
  website: string;
  logo: string;
  industry: string;
  sector: string;
}

export interface StockNews {
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
}

export interface StockAnalysis {
  quote: StockQuote;
  technicals: TechnicalIndicators;
  profile: CompanyProfile;
  news: StockNews[];
  recommendation: string;
}

/**
 * Fetch real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch quote for ${symbol}:`, response.status);
      return null;
    }

    const data = await response.json();

    return {
      symbol,
      price: data.c || 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
      previousClose: data.pc || 0,
      change: (data.c || 0) - (data.pc || 0),
      changePercent: data.pc ? (((data.c || 0) - (data.pc || 0)) / (data.pc || 0)) * 100 : 0,
      timestamp: data.t ? data.t * 1000 : Date.now(),
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
}

/**
 * Fetch company profile
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch profile for ${symbol}:`, response.status);
      return null;
    }

    const data = await response.json();

    return {
      symbol,
      name: data.name || '',
      description: data.description || '',
      country: data.country || '',
      currency: data.currency || 'USD',
      exchange: data.exchange || '',
      marketCap: data.marketCapitalization || 0,
      website: data.weburl || '',
      logo: data.logo || '',
      industry: data.finnhubIndustry || '',
      sector: data.finnhubIndustry || '',
    };
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

/**
 * Fetch company news
 */
export async function getCompanyNews(symbol: string, limit: number = 5): Promise<StockNews[]> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&limit=${limit}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch news for ${symbol}:`, response.status);
      return [];
    }

    const data = await response.json();

    return (data || []).map((item: any) => ({
      headline: item.headline || '',
      summary: item.summary || '',
      source: item.source || '',
      url: item.url || '',
      image: item.image || '',
      datetime: item.datetime ? item.datetime * 1000 : Date.now(),
      sentiment: 'neutral' as const,
      category: item.category || '',
    }));
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}

/**
 * Calculate technical indicators (simplified)
 * Note: Finnhub free tier doesn't include technical indicators
 * This is a placeholder for future enhancement with paid tier
 */
export function calculateTechnicalIndicators(prices: number[]): TechnicalIndicators {
  return {
    rsi: null,
    macd: null,
    bollingerBands: null,
    movingAverage50: null,
    movingAverage200: null,
  };
}

/**
 * Generate AI recommendation based on stock data
 */
export function generateRecommendation(quote: StockQuote, profile: CompanyProfile): string {
  const changePercent = quote.changePercent;

  if (changePercent > 5) {
    return 'Strong Buy - Significant positive momentum';
  } else if (changePercent > 2) {
    return 'Buy - Positive trend';
  } else if (changePercent > -2) {
    return 'Hold - Stable performance';
  } else if (changePercent > -5) {
    return 'Sell - Negative trend';
  } else {
    return 'Strong Sell - Significant decline';
  }
}

/**
 * Fetch complete stock analysis
 */
export async function getStockAnalysis(symbol: string): Promise<StockAnalysis | null> {
  try {
    const [quote, profile, news] = await Promise.all([
      getStockQuote(symbol),
      getCompanyProfile(symbol),
      getCompanyNews(symbol, 3),
    ]);

    if (!quote || !profile) {
      return null;
    }

    const technicals = calculateTechnicalIndicators([]);
    const recommendation = generateRecommendation(quote, profile);

    return {
      quote,
      technicals,
      profile,
      news,
      recommendation,
    };
  } catch (error) {
    console.error('Error fetching stock analysis:', error);
    return null;
  }
}

/**
 * Search for stocks by symbol or company name
 */
export async function searchStocks(query: string): Promise<Array<{ symbol: string; description: string }>> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/search?q=${query}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error('Failed to search stocks:', response.status);
      return [];
    }

    const data = await response.json();

    return (data.result || [])
      .slice(0, 10)
      .map((item: any) => ({
        symbol: item.symbol || '',
        description: item.description || '',
      }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

/**
 * Get stock recommendations for a symbol
 */
export async function getStockRecommendations(symbol: string): Promise<Array<{ symbol: string; rating: string }>> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error('Failed to fetch recommendations:', response.status);
      return [];
    }

    const data = await response.json();

    return (data || [])
      .slice(0, 5)
      .map((item: any) => ({
        symbol: item.symbol || symbol,
        rating: item.rating || 'hold',
      }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

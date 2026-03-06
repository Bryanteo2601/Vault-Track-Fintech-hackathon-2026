import { describe, it, expect } from 'vitest';

describe('Finnhub API Integration', () => {
  const apiKey = process.env.FINNHUB_API_KEY;

  it('should have FINNHUB_API_KEY environment variable set', () => {
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it('should validate API key format', () => {
    expect(apiKey).toMatch(/^[a-z0-9]+$/i);
  });

  it('should be able to make a test API call to Finnhub', async () => {
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not set');
    }

    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.c).toBeDefined(); // current price
      expect(data.h).toBeDefined(); // high price
      expect(data.l).toBeDefined(); // low price
      expect(data.o).toBeDefined(); // open price
      expect(data.pc).toBeDefined(); // previous close
    } catch (error) {
      throw new Error(`Finnhub API call failed: ${error}`);
    }
  });

  it('should support international stocks via ADR', async () => {
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not set');
    }

    try {
      // Test with Nestle ADR (Swiss company trading on US exchanges)
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=NSRGY&token=${apiKey}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.c).toBeDefined();
    } catch (error) {
      throw new Error(`International stock API call failed: ${error}`);
    }
  });
});

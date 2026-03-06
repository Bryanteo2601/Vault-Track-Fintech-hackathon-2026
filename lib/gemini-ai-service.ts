import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { auth, db } from './firebase-config';
import { AppData } from './types';

let modelInstance: any = null;

/**
 * Initialize the Gemini AI model
 */
export async function initializeGeminiAI() {
  try {
    const ai = getAI(undefined, { backend: new GoogleAIBackend() });
    modelInstance = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });
    console.log('✓ Gemini AI initialized successfully');
    return modelInstance;
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw error;
  }
}

/**
 * Get or initialize the model
 */
async function getModel() {
  if (!modelInstance) {
    await initializeGeminiAI();
  }
  return modelInstance;
}

/**
 * Format wealth data into a context string for AI analysis
 */
function formatWealthDataForAI(data: AppData): string {
  const bankBalance = data.bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  const investmentValue = data.holdings.reduce((sum: number, h: any) => sum + h.quantity * h.currentPrice, 0);
  const loanBalance = data.loans.reduce((sum: number, loan: any) => sum + loan.outstandingBalance, 0);
  const insuranceValue = data.insurancePolicies.reduce((sum: number, p: any) => sum + p.coverageAmount, 0);
  const netWorth = bankBalance + investmentValue - loanBalance;

  const bankAccounts = data.bankAccounts.map((acc: any) => 
    `- ${acc.accountName} (${acc.accountType}): SGD ${acc.balance.toLocaleString()}`
  ).join('\n');

  const investments = data.holdings.map((h: any) => 
    `- ${h.symbol}: ${h.quantity} units @ SGD ${h.currentPrice.toFixed(2)} = SGD ${(h.quantity * h.currentPrice).toLocaleString()}`
  ).join('\n');

  const loans = data.loans.map((loan: any) => 
    `- ${loan.loanType}: SGD ${loan.outstandingBalance.toLocaleString()} (${loan.interestRate}% p.a., ${loan.monthlyInstalment} monthly)`
  ).join('\n');

  const insurance = data.insurancePolicies.map((policy: any) => 
    `- ${policy.policyType}: SGD ${policy.coverageAmount.toLocaleString()} coverage`
  ).join('\n');

  return `
WEALTH PORTFOLIO SUMMARY
========================
Net Worth: SGD ${netWorth.toLocaleString()}
Total Assets: SGD ${(bankBalance + investmentValue).toLocaleString()}
Total Liabilities: SGD ${loanBalance.toLocaleString()}

BANK ACCOUNTS (SGD ${bankBalance.toLocaleString()})
${bankAccounts || 'No bank accounts'}

INVESTMENTS (SGD ${investmentValue.toLocaleString()})
${investments || 'No investments'}

LOANS (SGD ${loanBalance.toLocaleString()})
${loans || 'No loans'}

INSURANCE COVERAGE (SGD ${insuranceValue.toLocaleString()})
${insurance || 'No insurance policies'}
`;
}

/**
 * Generate AI-powered financial recommendations
 */
export async function generateFinancialRecommendations(data: AppData): Promise<string[]> {
  try {
    const model = await getModel();
    const wealthContext = formatWealthDataForAI(data);

    const prompt = `You are a professional financial advisor. Analyze the following wealth portfolio and provide 3-4 specific, actionable recommendations to improve financial health. Be concise and practical.

${wealthContext}

Provide recommendations in a numbered list format. Focus on:
1. Risk management and diversification
2. Debt optimization
3. Emergency fund adequacy
4. Investment opportunities

Keep each recommendation to 1-2 sentences.`;

    const result = await model.generateContent(prompt);
    const response = (result as any).response;
    const text = response.text();

    // Parse recommendations from the response
    const recommendations = text
      .split('\n')
      .filter((line: string) => line.trim().match(/^\d+\./)) 
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((rec: string) => rec.length > 0);

    return recommendations.slice(0, 4);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return ['Unable to generate recommendations at this time. Please try again later.'];
  }
}

/**
 * Chat with AI about finances
 */
export async function chatWithAI(userMessage: string, data: AppData, conversationHistory: Array<{ role: string; content: string }>): Promise<string> {
  try {
    const model = await getModel();
    const wealthContext = formatWealthDataForAI(data);

    // Build conversation history for context
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Add current user message
    messages.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const systemPrompt = `You are a knowledgeable and friendly financial advisor assistant. You have access to the user's wealth portfolio data and can provide personalized financial advice.

${wealthContext}

Guidelines:
- Provide accurate, practical financial advice based on the user's portfolio
- Be conversational and helpful
- Ask clarifying questions if needed
- Suggest specific actions when appropriate
- Acknowledge limitations and recommend consulting a professional for complex matters
- Keep responses concise (2-3 sentences) unless more detail is needed`;

    // Use the chat API with history
    const result = await model.generateContent({
      contents: messages as any,
      systemInstruction: systemPrompt,
    });

    const response = (result as any).response;
    return response.text();
  } catch (error) {
    console.error('Error in AI chat:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

/**
 * Analyze specific financial aspect
 */
export async function analyzeFinancialAspect(aspect: 'investments' | 'debt' | 'savings' | 'insurance', data: AppData): Promise<string> {
  try {
    const model = await getModel();
    const wealthContext = formatWealthDataForAI(data);

    let prompt = '';
    switch (aspect) {
      case 'investments':
        prompt = `Analyze this person's investment portfolio and provide insights on diversification, risk level, and potential improvements.\n${wealthContext}`;
        break;
      case 'debt':
        prompt = `Analyze this person's debt situation and provide strategies for debt reduction and optimization.\n${wealthContext}`;
        break;
      case 'savings':
        prompt = `Analyze this person's savings and liquidity position. How adequate is their emergency fund?\n${wealthContext}`;
        break;
      case 'insurance':
        prompt = `Analyze this person's insurance coverage. Is it adequate for their financial situation?\n${wealthContext}`;
        break;
    }

    const result = await model.generateContent(prompt);
    const response = (result as any).response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing financial aspect:', error);
    return 'Unable to analyze this aspect at the moment. Please try again later.';
  }
}

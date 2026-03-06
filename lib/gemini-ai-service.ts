import { AppData } from './types';

/**
 * Simple mock AI responses for now - Firebase Gemini SDK has compatibility issues with React Native
 * In production, this would call the actual Gemini API via a backend service
 */

/**
 * Generate AI-powered financial recommendations
 */
export async function generateFinancialRecommendations(data: AppData): Promise<string[]> {
  try {
    // Calculate key metrics
    const bankBalance = data.bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
    const investmentValue = data.holdings.reduce((sum: number, h: any) => sum + h.quantity * h.currentPrice, 0);
    const loanBalance = data.loans.reduce((sum: number, loan: any) => sum + loan.outstandingBalance, 0);
    const totalAssets = bankBalance + investmentValue;
    const dta = totalAssets > 0 ? (loanBalance / totalAssets) * 100 : 0;

    const recommendations: string[] = [];

    if (dta > 60) {
      recommendations.push(`⚠️ High Debt-to-Asset Ratio: Your debt is ${dta.toFixed(0)}% of total assets. Consider accelerating loan repayments to improve financial resilience.`);
    }

    if (bankBalance < investmentValue * 0.2) {
      recommendations.push(`💧 Build Emergency Fund: Your liquid assets are low relative to investments. Aim to maintain 6 months of expenses in savings.`);
    }

    if (data.holdings.length < 3) {
      recommendations.push(`✨ Diversify Your Portfolio: Consider adding more asset classes like bonds, REITs, or international stocks to reduce volatility.`);
    }

    if (recommendations.length === 0) {
      recommendations.push(`🎯 Strong Financial Health: Your wealth wellness metrics are looking great. Continue your current strategy and review quarterly.`);
    }

    return recommendations.slice(0, 4);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return ['Unable to generate recommendations at this time. Please try again later.'];
  }
}

/**
 * Chat with AI about finances
 */
export async function chatWithAI(
  userMessage: string,
  data: AppData,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    // Calculate key metrics for context
    const bankBalance = data.bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
    const investmentValue = data.holdings.reduce((sum: number, h: any) => sum + h.quantity * h.currentPrice, 0);
    const loanBalance = data.loans.reduce((sum: number, loan: any) => sum + loan.outstandingBalance, 0);
    const netWorth = bankBalance + investmentValue - loanBalance;
    const totalAssets = bankBalance + investmentValue;

    // Generate contextual responses based on user message
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      const investmentCount = data.holdings.length;
      if (investmentCount === 0) {
        return `Based on your portfolio, you currently have no investments. With SGD ${bankBalance.toLocaleString()} in liquid assets, you could consider starting with index funds or ETFs for diversification. Would you like recommendations on investment options?`;
      } else {
        return `You currently hold ${investmentCount} investment(s) worth SGD ${investmentValue.toLocaleString()}. This represents ${((investmentValue / totalAssets) * 100).toFixed(0)}% of your total assets. For a balanced portfolio, consider diversifying across different asset classes and sectors.`;
      }
    }

    if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      const loanCount = data.loans.length;
      if (loanCount === 0) {
        return `Great news! You have no outstanding loans. This is excellent for your financial health. Focus on building your emergency fund and investing for long-term growth.`;
      } else {
        return `You have ${loanCount} loan(s) with total outstanding balance of SGD ${loanBalance.toLocaleString()}. Your debt-to-asset ratio is ${((loanBalance / totalAssets) * 100).toFixed(0)}%. Consider accelerating repayments if possible to improve your financial resilience.`;
      }
    }

    if (lowerMessage.includes('net worth') || lowerMessage.includes('wealth')) {
      return `Your current net worth is SGD ${netWorth.toLocaleString()}. This consists of SGD ${bankBalance.toLocaleString()} in liquid assets and SGD ${investmentValue.toLocaleString()} in investments, minus SGD ${loanBalance.toLocaleString()} in liabilities. Focus on growing your assets while managing debt responsibly.`;
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('savings')) {
      const savingsAccounts = data.bankAccounts.filter((acc: any) => acc.accountType === 'savings');
      const savingsBalance = savingsAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
      return `You have SGD ${savingsBalance.toLocaleString()} in savings accounts. Financial experts recommend maintaining 6 months of living expenses in an emergency fund. Ensure your savings are easily accessible in case of unexpected expenses.`;
    }

    if (lowerMessage.includes('insurance')) {
      const insuranceCount = data.insurancePolicies.length;
      if (insuranceCount === 0) {
        return `You currently have no insurance policies. Consider getting health, life, and property insurance based on your needs and dependents. Insurance is crucial for protecting your wealth against unexpected events.`;
      } else {
        return `You have ${insuranceCount} insurance policy/policies. Ensure your coverage is adequate for your current life situation and financial obligations. Review your policies annually to ensure they still meet your needs.`;
      }
    }

    if (lowerMessage.includes('goal') || lowerMessage.includes('plan')) {
      return `To achieve your financial goals, I recommend: (1) Define clear, measurable goals with timelines, (2) Create a budget aligned with your goals, (3) Automate savings and investments, (4) Review progress quarterly. What specific financial goal would you like to work towards?`;
    }

    // Default response
    return `Based on your current portfolio with a net worth of SGD ${netWorth.toLocaleString()}, I can help you with investment strategies, debt management, savings planning, or insurance coverage. What aspect of your finances would you like to discuss?`;
  } catch (error) {
    console.error('Error in AI chat:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

/**
 * Analyze specific financial aspect
 */
export async function analyzeFinancialAspect(
  aspect: 'investments' | 'debt' | 'savings' | 'insurance',
  data: AppData
): Promise<string> {
  try {
    const bankBalance = data.bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
    const investmentValue = data.holdings.reduce((sum: number, h: any) => sum + h.quantity * h.currentPrice, 0);
    const loanBalance = data.loans.reduce((sum: number, loan: any) => sum + loan.outstandingBalance, 0);

    switch (aspect) {
      case 'investments':
        return `You have ${data.holdings.length} investment(s) worth SGD ${investmentValue.toLocaleString()}. Diversification is key - consider spreading investments across different sectors and asset classes to reduce risk.`;

      case 'debt':
        return `Your total debt is SGD ${loanBalance.toLocaleString()}. Focus on paying off high-interest debt first while maintaining minimum payments on lower-interest loans. This strategy can save you money on interest.`;

      case 'savings':
        const savingsBalance = data.bankAccounts
          .filter((acc: any) => acc.accountType === 'savings')
          .reduce((sum: number, acc: any) => sum + acc.balance, 0);
        return `Your savings balance is SGD ${savingsBalance.toLocaleString()}. Aim for an emergency fund of 6 months of living expenses. Once achieved, redirect excess savings to investments for long-term growth.`;

      case 'insurance':
        return `You have ${data.insurancePolicies.length} insurance policy/policies. Ensure you have adequate coverage for health, life, and property. Review your policies annually and adjust coverage as your life circumstances change.`;

      default:
        return 'Unable to analyze this aspect at the moment.';
    }
  } catch (error) {
    console.error('Error analyzing financial aspect:', error);
    return 'Unable to analyze this aspect at the moment. Please try again later.';
  }
}

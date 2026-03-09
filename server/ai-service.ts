import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppData } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface PortfolioContext {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  bankBalance: number;
  investmentValue: number;
  loanBalance: number;
  debtToAssetRatio: number;
  liquidityRatio: number;
  investmentCount: number;
  assetAllocation: Record<string, { value: number; percentage: number }>;
  concentrationRisks: string[];
}

/**
 * Calculate portfolio metrics for AI context
 */
function calculatePortfolioMetrics(data: AppData): PortfolioContext {
  const bankBalance = data.bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  const investmentValue = data.holdings.reduce((sum: number, h: any) => sum + h.quantity * h.currentPrice, 0);
  const loanBalance = data.loans.reduce((sum: number, loan: any) => sum + loan.outstandingBalance, 0);
  const totalAssets = bankBalance + investmentValue;
  const netWorth = totalAssets - loanBalance;

  const assetAllocation: Record<string, { value: number; percentage: number }> = {
    "Cash & Savings": {
      value: bankBalance,
      percentage: totalAssets > 0 ? (bankBalance / totalAssets) * 100 : 0,
    },
    Investments: {
      value: investmentValue,
      percentage: totalAssets > 0 ? (investmentValue / totalAssets) * 100 : 0,
    },
  };

  const concentrationRisks: string[] = [];

  if (data.holdings.length > 0) {
    const assetClassValues: Record<string, number> = {};

    data.holdings.forEach((h: any) => {
      const ac = h.assetClass || "Unknown";
      assetClassValues[ac] = (assetClassValues[ac] || 0) + h.quantity * h.currentPrice;
    });

    Object.entries(assetClassValues).forEach(([assetClass, value]) => {
      const percentage = (value / investmentValue) * 100;
      if (percentage > 60) {
        concentrationRisks.push(
          `${assetClass} concentration: ${percentage.toFixed(0)}% of investment portfolio`
        );
      }
    });
  }

  if (bankBalance < investmentValue * 0.1 && investmentValue > 0) {
    concentrationRisks.push("Low liquidity: Cash reserves below 10% of investment portfolio");
  }

  return {
    totalAssets,
    totalLiabilities: loanBalance,
    netWorth,
    bankBalance,
    investmentValue,
    loanBalance,
    debtToAssetRatio: totalAssets > 0 ? (loanBalance / totalAssets) * 100 : 0,
    liquidityRatio: totalAssets > 0 ? (bankBalance / totalAssets) * 100 : 0,
    investmentCount: data.holdings.length,
    assetAllocation,
    concentrationRisks,
  };
}

/**
 * Chat with Gemini AI about portfolio
 */
export async function chatWithAI(
  userMessage: string,
  portfolioData: AppData,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const metrics = calculatePortfolioMetrics(portfolioData);

    // Build system prompt with portfolio context
    const systemPrompt = `You are a Financial Wellness & Portfolio Analysis Assistant. You provide specific, data-driven financial analysis based on the user's portfolio data.

**Current Portfolio Context:**
- Net Worth: SGD ${metrics.netWorth.toLocaleString("en-SG", { minimumFractionDigits: 0 })}
- Total Assets: SGD ${metrics.totalAssets.toLocaleString("en-SG", { minimumFractionDigits: 0 })}
- Total Liabilities: SGD ${metrics.totalLiabilities.toLocaleString("en-SG", { minimumFractionDigits: 0 })}
- Cash & Savings: SGD ${metrics.bankBalance.toLocaleString("en-SG", { minimumFractionDigits: 0 })} (${metrics.liquidityRatio.toFixed(1)}% of assets)
- Investments: SGD ${metrics.investmentValue.toLocaleString("en-SG", { minimumFractionDigits: 0 })} (${metrics.assetAllocation["Investments"].percentage.toFixed(0)}% of assets)
- Active Holdings: ${metrics.investmentCount}
- Debt-to-Asset Ratio: ${metrics.debtToAssetRatio.toFixed(1)}%
${metrics.concentrationRisks.length > 0 ? `- Identified Risks: ${metrics.concentrationRisks.join("; ")}` : ""}

**Your Role:**
- Analyze portfolio data to identify concentration risks, liquidity gaps, and asset allocation imbalances
- Provide specific, data-driven insights (not generic advice)
- Ask clarifying questions about financial goals, time horizon, and risk tolerance
- Suggest actionable improvements based on the portfolio data
- Focus on Singapore financial context and instruments (CPF, HDB, local investments)

**Important:**
- Be conversational and helpful
- Reference specific numbers from the portfolio
- Avoid giving investment advice - focus on analysis and education
- Consider the user's life stage and financial goals`;

    // Build conversation history for Gemini
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ];

    // Call Gemini API
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw new Error("Failed to get AI response. Please try again.");
  }
}

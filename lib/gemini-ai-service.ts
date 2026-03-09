import { AppData } from './types';

/**
 * Financial Portfolio Analysis Assistant
 * 
 * This service provides specific, data-driven financial analysis based on the user's portfolio.
 * It avoids generic advice and focuses on:
 * - Concentration risk analysis
 * - Liquidity risk assessment
 * - Volatility exposure evaluation
 * - Asset allocation imbalance identification
 * - Trade-off explanations
 * - Data-driven insights
 * - Education and risk awareness
 */

interface PortfolioMetrics {
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
 * Calculate comprehensive portfolio metrics
 */
function calculatePortfolioMetrics(data: AppData): PortfolioMetrics {
  const bankBalance = data.bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  const investmentValue = data.holdings.reduce((sum: number, h: any) => sum + h.quantity * h.currentPrice, 0);
  const loanBalance = data.loans.reduce((sum: number, loan: any) => sum + loan.outstandingBalance, 0);
  const totalAssets = bankBalance + investmentValue;
  const netWorth = totalAssets - loanBalance;

  // Asset allocation by type
  const assetAllocation: Record<string, { value: number; percentage: number }> = {
    'Cash & Savings': { value: bankBalance, percentage: totalAssets > 0 ? (bankBalance / totalAssets) * 100 : 0 },
    'Investments': { value: investmentValue, percentage: totalAssets > 0 ? (investmentValue / totalAssets) * 100 : 0 },
  };

  // Identify concentration risks
  const concentrationRisks: string[] = [];
  
  // Check for asset class concentration
  if (data.holdings.length > 0) {
    const assetClassCounts: Record<string, number> = {};
    const assetClassValues: Record<string, number> = {};
    
    data.holdings.forEach((h: any) => {
      const assetClass = h.assetClass || 'Unknown';
      assetClassCounts[assetClass] = (assetClassCounts[assetClass] || 0) + 1;
      assetClassValues[assetClass] = (assetClassValues[assetClass] || 0) + h.quantity * h.currentPrice;
    });

    // Check for single asset class domination (>60% of portfolio)
    Object.entries(assetClassValues).forEach(([assetClass, value]) => {
      const percentage = (value / investmentValue) * 100;
      if (percentage > 60) {
        concentrationRisks.push(`${assetClass} concentration: ${percentage.toFixed(0)}% of investment portfolio`);
      }
    });
  }

  // Check for low liquidity
  if (bankBalance < investmentValue * 0.1) {
    concentrationRisks.push('Low liquidity: Cash reserves below 10% of investment portfolio');
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
 * Generate structured portfolio analysis following the 5-point format
 */
function generateStructuredAnalysis(
  userMessage: string,
  data: AppData,
  metrics: PortfolioMetrics
): string {
  const lines: string[] = [];

  // 1. SNAPSHOT SUMMARY
  lines.push('**1. SNAPSHOT SUMMARY**');
  lines.push('');
  if (metrics.netWorth === 0 && metrics.totalAssets === 0) {
    lines.push('Your portfolio is currently empty. No financial data to analyze.');
  } else {
    lines.push(`Net Worth: SGD ${metrics.netWorth.toLocaleString('en-SG', { minimumFractionDigits: 0 })}`);
    lines.push(`Total Assets: SGD ${metrics.totalAssets.toLocaleString('en-SG', { minimumFractionDigits: 0 })}`);
    lines.push(`Total Liabilities: SGD ${metrics.loanBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })}`);
    lines.push(`Debt-to-Asset Ratio: ${metrics.debtToAssetRatio.toFixed(1)}%`);
    lines.push(`Liquidity Ratio: ${metrics.liquidityRatio.toFixed(1)}%`);
    lines.push(`Active Investments: ${metrics.investmentCount}`);
  }
  lines.push('');

  // 2. KEY OBSERVATIONS
  lines.push('**2. KEY OBSERVATIONS**');
  lines.push('');
  
  if (metrics.totalAssets === 0) {
    lines.push('No assets to analyze. Start by adding bank accounts or investments.');
  } else {
    // Asset allocation observation
    lines.push(`Asset Allocation: ${metrics.assetAllocation['Cash & Savings'].percentage.toFixed(0)}% cash, ${metrics.assetAllocation['Investments'].percentage.toFixed(0)}% investments.`);
    
    // Debt observation
    if (metrics.loanBalance > 0) {
      lines.push(`Debt Position: You carry SGD ${metrics.loanBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })} in liabilities, representing ${metrics.debtToAssetRatio.toFixed(1)}% of your asset base.`);
    } else {
      lines.push('Debt Position: Debt-free. This is a strong foundation for wealth building.');
    }

    // Investment observation
    if (metrics.investmentCount === 0) {
      lines.push('Investment Portfolio: Currently empty. All assets are in cash.');
    } else {
      lines.push(`Investment Portfolio: ${metrics.investmentCount} holding(s) worth SGD ${metrics.investmentValue.toLocaleString('en-SG', { minimumFractionDigits: 0 })}.`);
    }
  }
  lines.push('');

  // 3. MAIN RISKS
  lines.push('**3. MAIN RISKS**');
  lines.push('');
  
  if (metrics.totalAssets === 0) {
    lines.push('No portfolio to assess.');
  } else {
    let risksIdentified = false;

    // Concentration risk
    if (metrics.concentrationRisks.length > 0) {
      lines.push('**Concentration Risk:**');
      metrics.concentrationRisks.forEach(risk => {
        lines.push(`• ${risk}`);
      });
      risksIdentified = true;
      lines.push('');
    }

    // Liquidity risk
    if (metrics.liquidityRatio < 10) {
      lines.push('**Liquidity Risk:**');
      lines.push(`Your liquid assets are only ${metrics.liquidityRatio.toFixed(1)}% of total assets. If you need cash quickly, you may face forced liquidation of investments at unfavorable prices.`);
      risksIdentified = true;
      lines.push('');
    }

    // Debt risk
    if (metrics.debtToAssetRatio > 50) {
      lines.push('**Leverage Risk:**');
      lines.push(`Your debt-to-asset ratio of ${metrics.debtToAssetRatio.toFixed(1)}% is elevated. A market downturn could significantly impact your net worth. Consider accelerating debt repayment.`);
      risksIdentified = true;
      lines.push('');
    }

    // Investment concentration
    if (metrics.investmentCount === 1) {
      lines.push('**Diversification Risk:**');
      lines.push('You hold only 1 investment. This creates significant unsystematic risk. A single adverse event could materially impact your portfolio.');
      risksIdentified = true;
      lines.push('');
    } else if (metrics.investmentCount < 5) {
      lines.push('**Diversification Risk:**');
      lines.push(`You hold ${metrics.investmentCount} investments. This is limited diversification. Consider adding more uncorrelated assets to reduce portfolio volatility.`);
      risksIdentified = true;
      lines.push('');
    }

    if (!risksIdentified) {
      lines.push('No major risks identified based on current data. Your portfolio appears reasonably balanced.');
      lines.push('');
    }
  }

  // 4. OPPORTUNITIES TO IMPROVE BALANCE
  lines.push('**4. OPPORTUNITIES TO IMPROVE BALANCE**');
  lines.push('');
  
  if (metrics.totalAssets === 0) {
    lines.push('Start by building your asset base. Begin with an emergency fund in savings, then gradually build investments.');
  } else {
    const opportunities: string[] = [];

    // Liquidity opportunity
    if (metrics.liquidityRatio < 15) {
      opportunities.push(`Increase Emergency Fund: Build cash reserves to 15-20% of total assets (currently ${metrics.liquidityRatio.toFixed(1)}%). This provides flexibility and reduces forced liquidation risk.`);
    }

    // Debt reduction opportunity
    if (metrics.debtToAssetRatio > 30) {
      opportunities.push(`Accelerate Debt Repayment: With a debt-to-asset ratio of ${metrics.debtToAssetRatio.toFixed(1)}%, prioritize paying down liabilities. This improves financial resilience and reduces interest expense.`);
    }

    // Diversification opportunity
    if (metrics.investmentCount < 5 && metrics.investmentValue > 0) {
      opportunities.push(`Expand Diversification: Increase holdings to at least 5 uncorrelated assets across different sectors and asset classes. This reduces unsystematic risk.`);
    }

    // Asset allocation opportunity
    if (metrics.investmentValue > 0 && metrics.liquidityRatio > 30) {
      opportunities.push(`Optimize Allocation: Your cash position (${metrics.liquidityRatio.toFixed(0)}%) exceeds typical emergency fund needs. Consider redirecting excess cash to investments for long-term growth.`);
    }

    if (opportunities.length === 0) {
      lines.push('Your portfolio appears well-balanced. Continue monitoring and rebalancing quarterly.');
    } else {
      opportunities.forEach(opp => {
        lines.push(`• ${opp}`);
      });
    }
  }
  lines.push('');

  // 5. QUESTIONS TO CONSIDER NEXT
  lines.push('**5. QUESTIONS TO CONSIDER NEXT**');
  lines.push('');
  
  if (metrics.totalAssets === 0) {
    lines.push('• What is your monthly income and expense level?');
    lines.push('• How many months of expenses should your emergency fund cover?');
    lines.push('• What is your investment time horizon (5, 10, 20+ years)?');
    lines.push('• What is your risk tolerance (conservative, moderate, aggressive)?');
  } else {
    lines.push('• What is your target asset allocation by class (stocks, bonds, real estate, etc.)?');
    lines.push('• What is your investment time horizon and risk tolerance?');
    lines.push('• Are your liabilities at favorable interest rates, or should you prioritize repayment?');
    lines.push('• How frequently do you plan to rebalance your portfolio?');
    lines.push('• What specific financial goals are you working towards (retirement, home purchase, education)?');
    lines.push('• Are there any major life changes expected (career change, family, relocation)?');
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate AI-powered financial recommendations
 */
export async function generateFinancialRecommendations(data: AppData): Promise<string[]> {
  try {
    const metrics = calculatePortfolioMetrics(data);
    const recommendations: string[] = [];

    if (metrics.totalAssets === 0) {
      recommendations.push('Start building your financial foundation with an emergency fund of 3-6 months expenses.');
      return recommendations;
    }

    // Concentration risk
    if (metrics.concentrationRisks.length > 0) {
      recommendations.push(`⚠️ Concentration Risk Detected: ${metrics.concentrationRisks[0]}`);
    }

    // Liquidity risk
    if (metrics.liquidityRatio < 10) {
      recommendations.push(`💧 Low Liquidity: Only ${metrics.liquidityRatio.toFixed(0)}% in cash. Build emergency fund to 15-20% of assets.`);
    }

    // Debt risk
    if (metrics.debtToAssetRatio > 50) {
      recommendations.push(`📊 High Leverage: Debt-to-asset ratio is ${metrics.debtToAssetRatio.toFixed(0)}%. Prioritize debt reduction.`);
    }

    // Diversification
    if (metrics.investmentCount < 3 && metrics.investmentValue > 0) {
      recommendations.push(`🎯 Limited Diversification: Only ${metrics.investmentCount} investment(s). Add uncorrelated assets to reduce risk.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Your portfolio appears balanced. Continue regular monitoring and rebalancing.');
    }

    return recommendations.slice(0, 4);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return ['Unable to generate recommendations at this time. Please try again later.'];
  }
}

/**
 * Chat with AI about finances - provides structured analysis
 */
export async function chatWithAI(
  userMessage: string,
  data: AppData,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const metrics = calculatePortfolioMetrics(data);
    const lowerMessage = userMessage.toLowerCase();

    // Check if user is asking for general analysis or portfolio review
    if (
      lowerMessage.includes('analyze') ||
      lowerMessage.includes('review') ||
      lowerMessage.includes('portfolio') ||
      lowerMessage.includes('assessment') ||
      lowerMessage.includes('analysis') ||
      lowerMessage.includes('how am i doing') ||
      lowerMessage.includes('what do you think')
    ) {
      return generateStructuredAnalysis(userMessage, data, metrics);
    }

    // Specific topic queries - provide focused analysis
    if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      if (metrics.investmentCount === 0) {
        return `**Investment Status:**\n\nYou currently have no investments. With SGD ${metrics.bankBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })} in liquid assets, you have capital available.\n\n**Considerations:**\n• What is your investment time horizon? (5, 10, 20+ years)\n• What is your risk tolerance? (conservative, moderate, aggressive)\n• Do you have an emergency fund of 3-6 months expenses?\n• What asset classes interest you? (stocks, bonds, ETFs, real estate)\n\nOnce you clarify these, we can discuss specific allocation strategies.`;
      } else {
        const assetClassMap = data.holdings.reduce((acc: any, h: any) => {
          const ac = h.assetClass || 'Unknown';
          acc[ac] = (acc[ac] || 0) + h.quantity * h.currentPrice;
          return acc;
        }, {} as Record<string, number>);
        const topAssetClass = Object.entries(assetClassMap).sort((a, b) => (b[1] as number) - (a[1] as number))[0] || ['Unknown', 0];

        return `**Current Investment Portfolio:**\n\nTotal invested: SGD ${metrics.investmentValue.toLocaleString('en-SG', { minimumFractionDigits: 0 })}\nNumber of holdings: ${metrics.investmentCount}\nLargest position: ${topAssetClass[0] as string}\n\n**Analysis:**\nYour investments represent ${metrics.assetAllocation['Investments'].percentage.toFixed(0)}% of total assets. ${metrics.investmentCount < 5 ? 'Consider expanding to at least 5 holdings for better diversification.' : 'Your diversification is reasonable.'}\n\n**Questions to consider:**\n• Are your holdings aligned with your risk tolerance?\n• Do you have exposure to different sectors and asset classes?\n• When was your last portfolio rebalancing?`;
      }
    }

    if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      if (metrics.loanBalance === 0) {
        return `**Debt Status:**\n\n✅ You have no outstanding loans. This is excellent for financial health.\n\n**Next Steps:**\n• Focus on building your emergency fund (3-6 months expenses)\n• Once emergency fund is established, redirect savings to investments\n• Consider your long-term financial goals (retirement, home purchase, education)`;
      } else {
        return `**Debt Analysis:**\n\nTotal outstanding: SGD ${metrics.loanBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })}\nDebt-to-asset ratio: ${metrics.debtToAssetRatio.toFixed(1)}%\n\n**Risk Assessment:**\n${metrics.debtToAssetRatio > 50 ? '⚠️ Your leverage is elevated. Consider prioritizing debt reduction.' : '✅ Your debt level is manageable relative to your assets.'}\n\n**Strategy Options:**\n1. **Debt Snowball:** Pay off smallest debts first for psychological wins\n2. **Debt Avalanche:** Pay off highest-interest debt first to minimize interest expense\n3. **Balanced Approach:** Maintain minimum payments while building investments\n\nWhich approach aligns with your financial goals?`;
      }
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('savings') || lowerMessage.includes('liquidity')) {
      return `**Liquidity Analysis:**\n\nCurrent cash position: SGD ${metrics.bankBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })}\nAs % of total assets: ${metrics.liquidityRatio.toFixed(1)}%\n\n**Benchmark:**\nEmergency fund target: 3-6 months of living expenses\nOptimal liquidity ratio: 15-20% of total assets\n\n**Your Status:**\n${metrics.liquidityRatio < 10 ? '⚠️ Below optimal. You may face forced liquidation risk if unexpected expenses arise.' : metrics.liquidityRatio < 20 ? '✅ Acceptable, but could be strengthened.' : '✅ Strong liquidity position.'}\n\n**Action:**\n${metrics.liquidityRatio < 15 ? `Build cash reserves by SGD ${((metrics.totalAssets * 0.15) - metrics.bankBalance).toLocaleString('en-SG', { minimumFractionDigits: 0 })} to reach 15% of assets.` : 'Your emergency fund is well-positioned.'}\n\nOnce adequate, excess cash can be deployed to investments.`;
    }

    if (lowerMessage.includes('diversif') || lowerMessage.includes('allocation')) {
      if (metrics.investmentCount === 0) {
        return `**Diversification:**\n\nYou have no investments yet. Diversification is the process of spreading investments across different asset classes and sectors to reduce risk.\n\n**Key Principles:**\n• Don't put all eggs in one basket\n• Combine assets with low correlation (move independently)\n• Rebalance periodically to maintain target allocation\n\n**Common Allocation Strategies:**\n• Conservative (60% bonds, 40% stocks): For near-term goals\n• Moderate (50% bonds, 50% stocks): Balanced approach\n• Aggressive (20% bonds, 80% stocks): For long-term goals\n\nWhat is your investment time horizon?`;
      } else {
        return `**Diversification Assessment:**\n\nCurrent holdings: ${metrics.investmentCount}\nInvestment value: SGD ${metrics.investmentValue.toLocaleString('en-SG', { minimumFractionDigits: 0 })}\n\n**Analysis:**\n${metrics.investmentCount < 5 ? `⚠️ Limited diversification with only ${metrics.investmentCount} holding(s). Aim for at least 5 uncorrelated assets.` : `✅ Reasonable diversification with ${metrics.investmentCount} holdings.`}\n\n**Next Steps:**\n• Identify any concentrated positions (>30% of portfolio)\n• Add assets with low correlation to existing holdings\n• Consider different sectors: Technology, Healthcare, Finance, Consumer, Energy\n• Consider different asset classes: Stocks, Bonds, REITs, Commodities\n\nWhat asset classes are you most interested in?`;
      }
    }

    // Default: offer structured analysis
    return generateStructuredAnalysis(userMessage, data, metrics);
  } catch (error) {
    console.error('Error in AI chat:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

/**
 * Analyze specific financial aspect with detailed insights
 */
export async function analyzeFinancialAspect(
  aspect: 'investments' | 'debt' | 'savings' | 'insurance',
  data: AppData
): Promise<string> {
  try {
    const metrics = calculatePortfolioMetrics(data);

    switch (aspect) {
      case 'investments':
        if (metrics.investmentCount === 0) {
          return `**Investment Analysis:**\n\nNo current investments. You have SGD ${metrics.bankBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })} available to invest.\n\n**First Steps:**\n1. Define your investment horizon (5, 10, 20+ years)\n2. Assess risk tolerance\n3. Establish emergency fund first\n4. Start with diversified index funds or ETFs\n\nDiversification reduces unsystematic risk by spreading capital across uncorrelated assets.`;
        } else {
          return `**Investment Analysis:**\n\nTotal invested: SGD ${metrics.investmentValue.toLocaleString('en-SG', { minimumFractionDigits: 0 })}\nNumber of holdings: ${metrics.investmentCount}\nAs % of total assets: ${metrics.assetAllocation['Investments'].percentage.toFixed(0)}%\n\n**Concentration Assessment:**\n${metrics.concentrationRisks.length > 0 ? metrics.concentrationRisks.map(r => `⚠️ ${r}`).join('\n') : '✅ No major concentration risks identified.'}\n\n**Diversification Recommendation:**\n${metrics.investmentCount < 5 ? `Expand to at least 5 holdings across different sectors and asset classes.` : 'Your diversification is reasonable. Continue monitoring for concentration.'}`;
        }

      case 'debt':
        if (metrics.loanBalance === 0) {
          return `**Debt Analysis:**\n\n✅ Debt-free status. This is excellent for financial health.\n\n**Implications:**\n• No interest expense reducing your wealth\n• Maximum financial flexibility\n• Strong foundation for wealth building\n\n**Next Focus:**\n1. Build emergency fund (3-6 months expenses)\n2. Invest for long-term growth\n3. Plan for major goals (home, education, retirement)`;
        } else {
          return `**Debt Analysis:**\n\nTotal outstanding: SGD ${metrics.loanBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })}\nDebt-to-asset ratio: ${metrics.debtToAssetRatio.toFixed(1)}%\n\n**Risk Level:**\n${metrics.debtToAssetRatio > 60 ? '⚠️ High leverage. Prioritize debt reduction.' : metrics.debtToAssetRatio > 40 ? '⚠️ Moderate leverage. Consider accelerating repayment.' : '✅ Manageable debt level.'}\n\n**Repayment Strategy:**\nFocus on high-interest debt first (typically credit cards). Lower-interest debt (mortgages, student loans) can be managed alongside investments.`;
        }

      case 'savings':
        return `**Savings & Liquidity Analysis:**\n\nCash reserves: SGD ${metrics.bankBalance.toLocaleString('en-SG', { minimumFractionDigits: 0 })}\nAs % of total assets: ${metrics.liquidityRatio.toFixed(1)}%\n\n**Emergency Fund Target:**\n3-6 months of living expenses (typically 15-20% of assets)\n\n**Your Status:**\n${metrics.liquidityRatio < 10 ? `⚠️ Below target. Build to SGD ${(metrics.totalAssets * 0.15).toLocaleString('en-SG', { minimumFractionDigits: 0 })} (15% of assets).` : metrics.liquidityRatio < 20 ? `✅ Acceptable. Consider building to 20% for additional security.` : `✅ Strong emergency fund in place.`}\n\n**Once Emergency Fund is Established:**\nRedirect excess savings to investments for long-term growth.`;

      case 'insurance':
        const insuranceCount = data.insurancePolicies.length;
        if (insuranceCount === 0) {
          return `**Insurance Analysis:**\n\nNo insurance policies on file.\n\n**Types to Consider:**\n• **Health Insurance:** Protects against medical costs\n• **Life Insurance:** Provides for dependents if you pass away\n• **Property Insurance:** Protects home and possessions\n• **Disability Insurance:** Replaces income if you can't work\n\n**Recommendation:**\nBased on your net worth of SGD ${metrics.netWorth.toLocaleString('en-SG', { minimumFractionDigits: 0 })}, consider at least health and life insurance coverage.`;
        } else {
          return `**Insurance Analysis:**\n\nActive policies: ${insuranceCount}\n\n**Action Items:**\n1. Review coverage amounts against current net worth\n2. Check expiration dates and renewal terms\n3. Assess if coverage still matches your life situation\n4. Compare premiums annually for better rates\n\n**Coverage Adequacy:**\nLife insurance should typically cover 5-10x annual income or outstanding liabilities.`;
        }

      default:
        return 'Unable to analyze this aspect at the moment.';
    }
  } catch (error) {
    console.error('Error analyzing financial aspect:', error);
    return 'Unable to analyze this aspect at the moment. Please try again later.';
  }
}

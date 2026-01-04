
import { GoogleGenAI } from "@google/genai";
import { Budget, Expense, SavingsTip } from "../types";

export const getFinancialInsight = async (budget: Budget, expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = budget.amount - totalSpent;
  const netSavings = budget.income - totalSpent;
  const savingsRate = budget.income > 0 ? (netSavings / budget.income) * 100 : 0;

  const prompt = `
    Analyze this user's monthly financial performance:
    - Monthly Income: $${budget.income}
    - Budget Limit (Spending Goal): $${budget.amount}
    - Actual Spending: $${totalSpent}
    - Remaining Budget: $${remainingBudget}
    - Net Savings (Income - Spent): $${netSavings}
    - Savings Rate: ${savingsRate.toFixed(1)}%

    Task: Provide one supportive, behavioral financial insight based on their savings rate and budget adherence.
    Guidelines:
    - Use plain English.
    - Focus on the balance between income and spending.
    - Keep it short (max 2 sentences).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "You're building a great foundation for your finances!";
  } catch (error) {
    console.error("AI insight error:", error);
    return "Keep tracking to see your progress grow!";
  }
};

export const getMarketSavings = async (expenses: Expense[]): Promise<SavingsTip | null> => {
  if (expenses.length === 0) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Find top category
  const categories: Record<string, number> = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0];

  const prompt = `Find specific ways or local deals to save money on "${topCategory}" expenses. Focus on recent news, discount sites, or trending saving hacks for this year.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri
      }));

    return { text, links };
  } catch (error) {
    console.error("Search grounding error:", error);
    return null;
  }
};

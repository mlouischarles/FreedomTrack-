
import { GoogleGenAI, Type } from "@google/genai";
import { Budget, Expense, SavingsTip, SavingsGoal, ChatMessage, WealthScore } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const getFinancialInsight = async (budget: Budget, expenses: Expense[], rollover: number = 0): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAvailable = budget.amount + rollover;
  const netSavings = budget.income - totalSpent;

  const prompt = `
    Analyze:
    - Income: $${budget.income}
    - Budget: $${budget.amount} (+$${rollover} rollover)
    - Spent: $${totalSpent}
    - Savings: $${netSavings}

    Provide ONE short supportive financial insight (max 2 sentences).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Tracking is the first step to freedom!";
  } catch (error) {
    return "Keep up the great work tracking your goals.";
  }
};

export const calculateWealthScore = async (budget: Budget, expenses: Expense[], goal: SavingsGoal | null): Promise<WealthScore> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = budget.income - totalSpent;
  const savingsRate = budget.income > 0 ? (savings / budget.income) * 100 : 0;
  
  const prompt = `
    Based on this data, calculate a "Financial Health Score" from 0 to 100:
    - Monthly Income: $${budget.income}
    - Total Spent: $${totalSpent}
    - Savings Rate: ${savingsRate.toFixed(1)}%
    - Goal: ${goal ? goal.title + ' (Target: $' + goal.targetAmount + ')' : 'None'}

    Return JSON: { "score": number, "label": "string (e.g. Needs Attention, Healthy, Elite)", "color": "hex string", "advice": "One sentence tip" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            color: { type: Type.STRING },
            advice: { type: Type.STRING }
          },
          required: ["score", "label", "color", "advice"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { score: 50, label: "Evaluating", color: "#64748b", advice: "Track more data for a precise score." };
  }
};

export const chatWithAssistant = async (history: ChatMessage[], budget: Budget, expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const currentMonthData = expenses.filter(e => e.date.startsWith(budget.month));
  const totalSpent = currentMonthData.reduce((sum, e) => sum + e.amount, 0);

  const systemInstruction = `
    You are the "Freedom Assistant". You help users master their money.
    Context:
    - Month: ${budget.month}
    - Income: $${budget.income}
    - Budget Limit: $${budget.amount}
    - Total Spent: $${totalSpent}
    - Expense History: ${JSON.stringify(currentMonthData.map(e => ({ d: e.description, a: e.amount, c: e.category })))}
    
    Rules:
    1. Be concise (max 3 sentences).
    2. Refer to specific expenses if relevant.
    3. Use a helpful, non-judgmental tone.
    4. Don't give legal or professional tax advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: { systemInstruction }
    });
    return response.text || "I'm not sure, but I'm here to help you track your finances!";
  } catch (error) {
    return "I'm having a bit of trouble connecting right now. Try again in a second!";
  }
};

export const getSpendingForecast = async (budget: Budget, expenses: Expense[], rollover: number = 0): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAvailable = budget.amount + rollover;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const velocity = totalSpent / Math.max(currentDay, 1);
  const linearForecast = velocity * daysInMonth;

  const prompt = `
    Context: Day ${currentDay}/${daysInMonth}, Spent $${totalSpent}, Limit $${totalAvailable}.
    Predict if they will stay under limit. 
    Format: "Forecast: $[amount]. [One sentence advice]."
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || `Forecast: $${linearForecast.toFixed(0)}. Keep monitoring your pace.`;
  } catch (error) {
    return `Forecast: $${linearForecast.toFixed(0)}. Pace yourself.`;
  }
};

export const analyzeSubscriptions = async (expenses: Expense[]): Promise<string> => {
  const recurring = expenses.filter(e => e.isRecurring);
  if (recurring.length === 0) return "No recurring subscriptions found.";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const subData = recurring.map(r => `${r.description}: $${r.amount}`).join(', ');
  const prompt = `Analyze these recurring costs: ${subData}. Provide a critical/supportive audit in 2 sentences.`;
  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "Check your subscriptions regularly.";
  } catch (error) { return "Monitor recurring costs for better savings."; }
};

export const getGoalStrategy = async (budget: Budget, expenses: Expense[], goal: SavingsGoal, rollover: number = 0): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1;
  const prompt = `Goal: "${goal.title}" ($${goal.targetAmount}). Income: $${budget.income}. Spent: $${totalSpent}. Days left: ${daysLeft}. Provide a "Daily Safe Spend" amount and one tip.`;
  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "Track daily spending to reach your goal!";
  } catch (error) { return "Stay consistent with your savings."; }
};

export const getMarketSavings = async (expenses: Expense[]): Promise<SavingsTip | null> => {
  if (expenses.length === 0) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const topCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const cat = Object.entries(topCategory).sort((a,b) => b[1]-a[1])[0][0];
  const prompt = `Ways to save on "${cat}" expenses. Recent news or hacks.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri })) || [];
    return { text: response.text || "", links };
  } catch (error) { return null; }
};

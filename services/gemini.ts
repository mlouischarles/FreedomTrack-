
import { GoogleGenAI, Type } from "@google/genai";
import { Budget, Expense, SavingsGoal, WealthScore, SpendingAlert, CategoryOptimization, FreedomProjection, SavingsQuest, SpendingPersona, ChatMessage } from "../types";

// Standard model for financial analysis tasks
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Provides a short, supportive financial insight based on current income and spending.
 */
export const getFinancialInsight = async (budget: Budget, expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const prompt = `Analyze this financial summary: Monthly Income $${budget.income}, Total Spent so far $${totalSpent}. Provide ONE short, supportive financial insight (max 2 sentences) that encourages the user.`;
  
  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "Tracking is the first step to freedom!";
  } catch (error) {
    console.error("Error fetching financial insight:", error);
    return "Keep up the great work.";
  }
};

/**
 * Analyzes spending behavior to assign a psychological persona.
 */
export const getSpendingPersona = async (expenses: Expense[]): Promise<SpendingPersona | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const history = expenses.slice(-30).map(e => ({ d: e.description, a: e.amount, s: e.sentiment || 'Neutral' }));
  
  const prompt = `Analyze this user's spending psychology: ${JSON.stringify(history)}. 
    Assign a creative "Spending Persona" with a dominant trait, a description, supportive advice, and an emoji icon.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            trait: { type: Type.STRING },
            description: { type: Type.STRING },
            advice: { type: Type.STRING },
            icon: { type: Type.STRING }
          },
          required: ["name", "trait", "description", "advice", "icon"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating spending persona:", error);
    return null;
  }
};

/**
 * Creates a weekly savings challenge based on spending habits.
 */
export const generateSavingsQuest = async (expenses: Expense[]): Promise<SavingsQuest | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const history = expenses.slice(-20).map(e => ({ c: e.category, d: e.description, a: e.amount, s: e.sentiment }));
  const prompt = `Based on habits: ${JSON.stringify(history)}, create ONE achievable Savings Quest for the week. Return as JSON.`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            potentialSavings: { type: Type.NUMBER },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
          },
          required: ["title", "description", "potentialSavings", "difficulty"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return { 
      ...data, 
      id: Math.random().toString(36).substring(2, 11), 
      status: 'Available' 
    };
  } catch (error) {
    console.error("Error generating savings quest:", error);
    return null;
  }
};

/**
 * Audits expenses with negative emotional impact (regrets).
 */
export const getValueAudit = async (expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const regrets = expenses.filter(e => e.sentiment === 'Regret').map(e => ({ d: e.description, a: e.amount }));
  
  if (regrets.length === 0) return "No regrets found. Your spending is perfectly aligned with your values!";

  const prompt = `Audit these 'Regret' expenses: ${JSON.stringify(regrets)}. Provide 2 supportive sentences of behavioral advice to help the user align future spending with their goals.`;
  
  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "Tracking well!";
  } catch (error) {
    console.error("Error auditing regrets:", error);
    return "Reflect on past regrets to improve future spending decisions.";
  }
};

/**
 * Projects milestones toward financial independence.
 */
export const getFreedomHorizon = async (budget: Budget, expenses: Expense[]): Promise<FreedomProjection | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  
  const prompt = `Project a "Freedom Horizon" in JSON for a user with: 
    Income: $${budget.income}, Monthly Spending: $${totalSpent}. 
    Include 3 milestones and a projected freedom date.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  etaMonths: { type: Type.NUMBER },
                  confidence: { type: Type.STRING },
                  actionItem: { type: Type.STRING }
                },
                required: ["label", "etaMonths", "confidence", "actionItem"]
              }
            },
            yearlyGrowth: { type: Type.NUMBER },
            freedomDate: { type: Type.STRING }
          },
          required: ["milestones", "yearlyGrowth", "freedomDate"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error projecting freedom horizon:", error);
    return null;
  }
};

/**
 * Calculates a relative financial health score.
 */
export const calculateWealthScore = async (budget: Budget, expenses: Expense[], goal: SavingsGoal | null): Promise<WealthScore> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const prompt = `Calculate a Financial Health score (0-100) based on:
    Income: $${budget.income}, Total Spent: $${totalSpent}, Target Budget: $${budget.amount}.
    Savings Goal: ${goal ? `${goal.title} ($${goal.targetAmount})` : 'None'}.
    Return JSON with score, label, hex color, and short advice.`;

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
    console.error("Error calculating wealth score:", error);
    return { score: 50, label: "Analyzing", color: "#64748b", advice: "Add more transactions to get a precise score." };
  }
};

/**
 * Identifies spending anomalies based on historical limits.
 */
export const detectAnomalies = async (budget: Budget, expenses: Expense[]): Promise<SpendingAlert[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Find anomalies in spending vs limits. Limits: ${JSON.stringify(budget.categoryLimits || {})}. 
    Current spending: ${JSON.stringify(expenses.map(e => ({ c: e.category, a: e.amount })))}.
    Return a JSON array of alerts with category, type (danger/warning/info), and message.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["danger", "warning", "info"] },
              message: { type: Type.STRING }
            },
            required: ["category", "type", "message"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return [];
  }
};

/**
 * Suggests optimized budget allocations based on spending.
 */
export const getCategoryOptimization = async (budget: Budget, expenses: Expense[]): Promise<CategoryOptimization> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Optimize the allocation of a $${budget.amount} total budget across common spending categories based on history: ${JSON.stringify(expenses.slice(-50).map(e => ({ c: e.category, a: e.amount })))}. 
    Return JSON with suggestedLimits and reasoning.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedLimits: {
              type: Type.OBJECT,
              properties: {
                Food: { type: Type.NUMBER },
                Transport: { type: Type.NUMBER },
                Utilities: { type: Type.NUMBER },
                Shopping: { type: Type.NUMBER },
                Entertainment: { type: Type.NUMBER },
                Health: { type: Type.NUMBER },
                Other: { type: Type.NUMBER }
              }
            },
            reasoning: { type: Type.STRING }
          },
          required: ["suggestedLimits", "reasoning"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error optimizing budget:", error);
    return { suggestedLimits: {}, reasoning: "Could not optimize at this time." };
  }
};

/**
 * Orchestrates a multi-turn chat with the AI assistant about financial data.
 */
export const chatWithAssistant = async (history: ChatMessage[], budget: Budget, expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = `User Context: Income $${budget.income}, Current Total Spend $${expenses.reduce((s,e)=>s+e.amount,0)}.`;
  const contents = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: `You are Freedom Assistant, an expert financial coach. Help the user achieve financial freedom. 
          Context: ${context}. Be specific, encouraging, and data-driven.`
      }
    });
    return response.text || "I'm here to help you on your path to financial freedom.";
  } catch (error) {
    console.error("Error in chat assistant:", error);
    return "I'm currently unable to chat. Please check your network or try again later.";
  }
};

/**
 * Forecasts end-of-month spending totals.
 */
export const getSpendingForecast = async (budget: Budget, expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const prompt = `Current spending is $${totalSpent} out of a $${budget.amount} budget. Forecast end of month outcome and provide a short tip. 1 sentence.`;
  
  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "Keep monitoring your spending to stay within your limits.";
  } catch (error) {
    console.error("Error forecasting spending:", error);
    return "";
  }
};

/**
 * Analyzes recurring subscriptions for optimization opportunities.
 */
export const analyzeSubscriptions = async (expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const recurring = expenses.filter(e => e.isRecurring);
  const prompt = `Analyze these recurring costs: ${JSON.stringify(recurring.map(r => ({ d: r.description, a: r.amount }))) }. 
    Point out any "vampire costs" or potential areas to save. Be brief (1-2 sentences).`;
  
  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "Reviewing your subscriptions is a great way to find hidden savings.";
  } catch (error) {
    console.error("Error analyzing subscriptions:", error);
    return "";
  }
};

/**
 * Provides a tactical strategy for a specific savings goal.
 */
export const getGoalStrategy = async (budget: Budget, expenses: Expense[], goal: SavingsGoal): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const prompt = `Provide a 1-sentence tactical strategy for the goal: ${goal.title} (Target: $${goal.targetAmount}). 
    Income: $${budget.income}, Spending: $${totalSpent}.`;
  
  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "Consistency is key to reaching your target.";
  } catch (error) {
    console.error("Error fetching goal strategy:", error);
    return "";
  }
};

/**
 * Placeholder for future market-based analysis.
 */
export const getMarketSavings = async (expenses: Expense[]) => {
  return null;
};

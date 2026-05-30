import Groq from "groq-sdk";

type SafeDriverApplicant = {
  id?: string;
  name: string;
  city?: string;
  township: string;
  average_rating: number;
  experience_years: number;
  review_count?: number;
};

// Groq ကို စတင်ချိတ်ဆက်ခြင်း
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getBestDriverMatch = async (ownerTownship: string, applicants: any[]) => {
  try {
    // AI ကို တွက်ခိုင်းမည့် Prompt အကြမ်းဖျင်း
    const prompt = `
      You are an expert AI Matchmaker for a taxi rental service.
      Owner's Car Location: ${ownerTownship}
      Applicants: ${JSON.stringify(applicants)}
      
      Rank the applicants based on these rules:
      1. EXACT township match is the highest priority.
      2. If townships are equal or none match, rank by highest average_rating.
      3. If ratings are equal, rank by highest experience_years.
      
      Provide the result in strictly JSON format matching this structure:
      {
        "ranked_applicants": [
          {
            "name": "...",
            "township": "...",
            "average_rating": 0,
            "experience_years": 0,
            "rank": 1,
            "is_recommended": true,
            "summary": "Reasoning here..."
          }
        ]
      }
    `;

    // Groq API သို့ Request ပို့ခြင်း (Llama 3 8B မော်ဒယ်ကို အသုံးပြုထားပါသည်)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful matching assistant. You always return strictly valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // Recommended replacement for decommissioned llama3-8b-8192
      response_format: { type: "json_object" }, // JSON အဖြစ် အတင်းအကျပ် ထုတ်ခိုင်းခြင်း
      temperature: 0.2, // တိကျသေချာသော အဖြေရရန် အပူချိန်ကို လျှော့ထားခြင်း
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    
    // ပြန်ရလာသော JSON String ကို Object အဖြစ် ပြောင်းပေးခြင်း
    if (!aiResponse) throw new Error("AI did not return any content.");
    return JSON.parse(aiResponse);

  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error("Groq AI Error:", msg);
    throw new Error(`Failed to match drivers via AI: ${msg}`);
  }
};

export const getBestDriverSearchResults = async (
  requirements: string,
  applicants: SafeDriverApplicant[],
) => {
  try {
    const prompt = `
      You are an expert AI driver search assistant for a peer-to-peer taxi rental platform.
      Owner search requirements: ${requirements}
      Driver candidates from the database: ${JSON.stringify(applicants)}

      Rank the candidates based on these rules:
      1. If the owner mentions a township or city, exact location match is the highest priority.
      2. If locations are equal or no location is mentioned, rank by highest average_rating.
      3. If ratings are equal, rank by highest experience_years.
      4. Keep every returned id exactly the same as the candidate id.

      Provide the result in strictly JSON format matching this structure:
      {
        "ranked_applicants": [
          {
            "id": "...",
            "name": "...",
            "city": "...",
            "township": "...",
            "average_rating": 0,
            "experience_years": 0,
            "review_count": 0,
            "rank": 1,
            "is_recommended": true,
            "summary": "Short reasoning here..."
          }
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful matching assistant. You always return strictly valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) throw new Error("AI did not return any content.");

    return JSON.parse(aiResponse);
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error("Groq AI Search Error:", msg);
    throw new Error(`Failed to search drivers via AI: ${msg}`);
  }
};

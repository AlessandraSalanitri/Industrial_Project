// pages/api/ai.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { age, genre, setting, moral, tone, length, character } = req.body;

  if (!character || !age || !genre) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  // Map reading length to max tokens
  const lengthToTokens = {
    "Short (2 minutes)": 700,
    "Medium (5 minutes)": 1500,
    "Long (7 minutes)": 2200,
  };

  const maxTokens = lengthToTokens[length] || 700;

  const prompt = `
A magical bedtime story for a ${age}-year-old child.
Genre: ${genre}.
Setting: ${setting || "a magical world"}.
Moral of the story: ${moral || "kindness and bravery"}.
Tone: ${tone || "fun and warm"}.
Estimated reading time: ${length || "short (2–3 minutes)"}.
Main character or theme: ${character}.

The story should:
- Be friendly, imaginative, and age-appropriate.
- Begin the story with something to engage and capture the reader's attention and set the proper tone in accordance to the genre.
- Be easy to read aloud and include simple but creative language.
- End happily.

Only include the story, beginning with its title and no extra commentary.
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI that writes short magical bedtime stories for kids. Keep it warm, simple, and fun.",
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        temperature: 0.9,
        max_tokens: maxTokens,
        top_p: 0.95
      }),
    });

    const data = await response.json();

    console.log("🧠 AI response:", data);

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "No story generated." });
    }

    const aiStory = data.choices[0].message.content.trim();
    res.status(200).json({ response: aiStory });

  } catch (err) {
    console.error("❌ Error from Groq:", err);
    res.status(500).json({ error: "Server error while generating story" });
  }
}

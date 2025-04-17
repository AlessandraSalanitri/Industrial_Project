// pages/api/ai.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: "Bearer tCSPm6NBT3jjr9MAAfNmiqRc8YK5JQcz4ztqoQpY",  // Replace this with your actual key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command", // Or use "command-light" for a faster/lighter model
        prompt,
        max_tokens: 100,
        temperature: 0.9,
        k: 0,
        p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: ["--"], // Optional: custom stopping
        return_likelihoods: "NONE"
      }),
    });

    const data = await response.json();

    console.log("🧠 AI raw output:", data);

    if (!response.ok || !data.generations || data.generations.length === 0) {
      return res.status(500).json({ error: "Failed to generate story from Cohere" });
    }

    const aiStory = data.generations[0].text.trim();
    res.status(200).json({ response: aiStory });

  } catch (err) {
    console.error("❌ Cohere API call failed:", err.message);
    res.status(500).json({ error: "Server error while generating story" });
  }
}

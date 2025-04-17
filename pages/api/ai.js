export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/tiiuae/falcon-rw-1b", {

      method: "POST",
      headers: {
        Authorization: "Bearer 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", // Replace with your actual token
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0.9,
          max_new_tokens: 50, // You can go up to 500 later
          top_p: 0.95,
          return_full_text: false
        },
      }),
    });

    const data = await response.json();
    console.log("🧠 AI raw output:", data);

    const aiStory = data?.[0]?.generated_text?.trim() || "No story returned.";
    res.status(200).json({ response: aiStory });

  } catch (err) {
    console.error("❌ API call failed:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

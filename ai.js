export default function handler(req, res) {
  if (req.method === "POST") {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    // Simulating an AI model request
    const aiResponse = `AI response for: ${prompt}`;
    
    res.status(200).json({ response: aiResponse });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
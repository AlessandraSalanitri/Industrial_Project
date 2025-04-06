export default function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    
    // Simulating a request to a TTS engine
    const audioUrl = `https://tts.example.com/generate?text=${encodeURIComponent(text)}`;
    
    res.status(200).json({ audioUrl });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
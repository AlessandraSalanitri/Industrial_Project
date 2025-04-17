// pages/test-ai.js
import { useState } from "react";

export default function TestAI() {
  const [age, setAge] = useState("");
  const [genre, setGenre] = useState("");
  const [character, setCharacter] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!character || !age || !genre) return alert("Please fill in all fields!");

    const fullPrompt = `Please create a magical bedtime story for a child aged ${age}. The genre is ${genre}. The main character or theme of the story is : ${character}. The story should have a beginning, middle, and happy ending. Make it simple, magical, friendly, imaginative, and easy to read aloud to children. Keep it engaging and age-appropriate.`;
    



    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await res.json();
      setStory(data.response || "No story returned.");
    } catch (err) {
      console.error(err);
      setStory("Error generating story.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "auto" }}>
      <h2>🧚 AI Bedtime Story Generator</h2>

      {/* Age Selector */}
      <label>Child's Age Range:</label>
      <select value={age} onChange={(e) => setAge(e.target.value)} style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}>
        <option value="">Select age...</option>
        <option value="1-3">1–3 years</option>
        <option value="4-6">4–6 years</option>
        <option value="7-9">7–9 years</option>
      </select>

      {/* Genre Selector */}
      <label>Story Genre:</label>
      <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}>
        <option value="">Select genre...</option>
        <option value="Magical Fantasy">Magical Fantasy</option>
        <option value="Animal Adventure">Animal Adventure</option>
        <option value="Bedtime Calm">Bedtime Calm</option>
        <option value="Funny and Silly">Funny and Silly</option>
        <option value="Friendship">Friendship</option>
        <option value="Learning Something New">Learning Something New</option>
      </select>

      {/* Character input */}
      <label>Main Character or Theme:</label>
      <input
        type="text"
        placeholder='e.g., "A shy dragon named Luna"'
        value={character}
        onChange={(e) => setCharacter(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "15px" }}
      />

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        style={{ padding: "10px 20px", background: "#4B0082", color: "white", border: "none", borderRadius: "5px" }}
      >
        {loading ? "Generating..." : "Generate Story"}
      </button>

      {/* Output */}
      <div style={{ marginTop: "20px", whiteSpace: "pre-line" }}>
        {story && <p><strong>✨ Generated Story:</strong><br />{story}</p>}
      </div>
    </div>
  );
}

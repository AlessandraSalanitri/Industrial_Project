
/**
 * Generate a TTS audio blob + URL
 * For demo returns a blob and local object URL, NOT saved permanently.
 */

type VoiceKey =
  | "Rachel" | "Domi" | "Sarah" | "Elli" | "Alice"
  | "Patrick" | "Harry" | "Josh" | "Jeremy";

  const voiceIdMap = {
    "Rachel": "21m00Tcm4TlvDq8ikWAM",
    "Domi": "AZnzlk1XvdvUeBnXmlld",
    "Sarah": "EXAVITQu4vr4xnSDxMaL",
    "Elli": "MF3mGyEYCl7XYWbV9V6O",
    "Alice": "Xb7hH8MSUJpSbSDYk0k2",

    "Patrick": "ODq5zmih8GrVes37Dizd",
    "Harry": "SOYHLrjzK2X1ezoPC6cr",
    "Josh": "TxGEqnHWrfWFTfGW9XjX",
    "Jeremy": "bVMeCyTHy58xNoL34h3p",  
  };

  export async function generateAudioFromText(
    text: string,
    voice: VoiceKey = "Elli"
  ): Promise<{ blob: Blob; url: string }> {
    if (!text.trim()) {
      throw new Error("To generate audio is required to have some text.");
    }
  
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("Please check if API key is set in environment variables.");
    }
  
    const voiceId = voiceIdMap[voice] || voiceIdMap.Elli;
  
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to generate audio.");
    }
  
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
  
    return { blob, url };
  }
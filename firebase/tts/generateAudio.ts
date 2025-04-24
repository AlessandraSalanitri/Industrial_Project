

//to save audio files in Firebase, needs storage (PAID PLAN)-- For demo purposes only, we're saving the file locally
// and retrive it from the cache when the play button is clicked, also
// giving opportunity to download the story/audio directly after saved. 
import { v4 as uuidv4 } from 'uuid'; 

export async function generateAudioFromText(
    text: string,
    voice: "Rachel" | "Domi" | "Sarah" | "Elli" | "Alice" | "Patrick" | "Harry" | "Josh" | "Jeremy"
  ) {
    if (!text) {
      throw new Error("Text is required to generate audio.");
    }

    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("API key is not set in environment variables.");
    }

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
  
    const voiceId = voiceIdMap[voice] || voiceIdMap["Elli"];
  
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey,
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
            }
        }),
    });
  
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);


  // for download
  const a = document.createElement("a");
  a.href = url;
  a.download = `story-audio-${uuidv4()}.mp3`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  return url; // to be saved as link to the story
}
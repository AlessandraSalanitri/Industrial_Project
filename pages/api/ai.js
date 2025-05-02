// pages/api/ai.js

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestoreDB } from "../../firebase/firebaseConfig";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, age, genre, setting, moral, tone, length, character, title, storyText, mode } = req.body;

  if (!userId) {
    console.error("❌ Missing userId in request body");
    return res.status(400).json({ error: "Missing user ID." });
  }

  // STEP 1: Check and update story generation credits
  try {
    const userRef = doc(firestoreDB, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(403).json({ error: "User not found." });
    }

    const userData = userSnap.data();
    const plan = userData.subscriptionPlan || "free";
    const today = new Date().toISOString().split("T")[0];
    let credits = userData.creditsToday ?? 0;
    const lastReset = userData.lastCreditReset;

    if (plan !== "unlimited") {
      let resetCredits = plan === "pro" ? 30 : 5;

      if (lastReset !== today) {
        credits = resetCredits - 1;
        await updateDoc(userRef, {
          creditsToday: credits,
          lastCreditReset: today,
        });
      } else if (credits <= 0) {
        return res.status(403).json({ error: "No story credits left for today." });
      } else {
        await updateDoc(userRef, {
          creditsToday: credits - 1,
        });
      }
    }

    
  } catch (err) {
    console.error("❌ Error checking user credits:", err);
    return res.status(500).json({ error: "Error checking user credits." });
  }

  // STEP 2: Continue story mode
  if (mode === "continue") {
    const continuePrompt = `
    Continue this ${genre.toLowerCase()} children's story titled "${title}":
    ${storyText || "Start a fun story that fits the title."}

    Write the next sentance or complete the sentance in a magical, imaginative, warm tone. Keep it friendly, age-appropriate, and fun to read aloud.
    Only include the sentance, no extra commentary.
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
              content: "You are a friendly AI that continues bedtime stories for kids. Keep it light, magical, and simple.",
            },
            {
              role: "user",
              content: continuePrompt,
            }
          ],
          temperature: 0.9,
          max_tokens: 500,
          top_p: 0.95
        }),
      });

      const data = await response.json();
      console.log("🧠 Continuation AI Response:", data);

      if (!data.choices || data.choices.length === 0) {
        return res.status(500).json({ error: "No continuation generated." });
      }

      const nextParagraph = data.choices[0].message.content.trim();
      return res.status(200).json({ response: nextParagraph });

    } catch (err) {
      console.error("❌ Error continuing story:", err);
      return res.status(500).json({ error: "Server error while continuing story" });
    }
  }

  // STEP 3: Create new story mode
  if (!age || !genre || !length) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const genreFallbacks = {
    "Fantasy": {
      settings: ["Fantasy", "Urban Fantasy", "Magical Realism"],
      morals: ["Courage and Bravery", "Kindness and Empathy", "Friendship and Teamwork", "Creativity and Imagination"],
      tones: ["Fantasy and Magical", "Heroic and Noble", "Lighthearted and Fun", "Adventurous and Exciting"],
      characters: ["Brave Young Hero", "Wise Wizard", "Kind Fairy", "Friendly Dragon", "Lost Prince or Princess", "Mischievous Elf", "Magical Animal Friend", "Evil Sorcerer (mildly spooky)"]
    },
    "Adventure": {
      settings: ["Adventure", "Survival", "Modern-Day"],
      morals: ["Courage and Bravery", "Perseverance and Hard Work", "Friendship and Teamwork", "Responsibility and Accountability"],
      tones: ["Adventurous and Exciting", "Optimistic and Hopeful", "Lighthearted and Fun"],
      characters: ["Fearless Explorer Kid", "Loyal Best Friend", "Clever Treasure Hunter", "Mysterious Guide", "Talking Map or Compass", "Animal Sidekick", "Brave Village Kid", "Tricky Rival Adventurer"]
    },
    "Science Fiction": {
      settings: ["Science Fiction", "Urban", "Modern-Day"],
      morals: ["Responsibility and Accountability", "Creativity and Imagination", "Environmental Awareness", "Courage and Bravery"],
      tones: ["Adventurous and Exciting", "Serious and Reflective", "Educational and Informative", "Optimistic and Hopeful"],
      characters: ["Space Kid Captain", "Helpful Robot Buddy", "Friendly Alien", "Inventive Scientist Kid", "Time Traveler", "AI Pet", "Brave Galactic Messenger", "Mischievous Alien Creature"]
    },
    "Mystery": {
      settings: ["Mystery", "Urban", "Modern-Day"],
      morals: ["Honesty and Integrity", "Patience and Temperance", "Friendship and Teamwork"],
      tones: ["Mysterious and Suspenseful", "Serious and Reflective", "Lighthearted and Fun"],
      characters: ["Junior Detective", "Curious Young Sleuth", "Helpful Librarian", "Secretive Witness Kid", "Mysterious Pet", "Shy Neighbor", "Funny Police Officer", "Sly Trickster"]
    },
    "Humor": {
      settings: ["Modern-Day", "Urban", "Animal-Based"],
      morals: ["Friendship and Teamwork", "Kindness and Empathy", "Self-Respect and Confidence"],
      tones: ["Funny and Humorous", "Lighthearted and Fun", "Optimistic and Hopeful"],
      characters: ["Everyday School Kid", "Sports Star Kid", "Helpful Teacher", "Creative Artist Kid", "Tech-Savvy Kid", "Caring Parent or Sibling", "Neighborhood Friend"]
    },
    "Historical Fiction": {
      settings: ["Historical", "Survival"],
      morals: ["Responsibility and Accountability", "Fairness and Justice", "Honesty and Integrity", "Perseverance and Hard Work"],
      tones: ["Serious and Reflective", "Educational and Informative", "Heroic and Noble"],
      characters: ["Young Knight or Squire", "Princess or Prince", "Inventive Blacksmith's Child", "Curious Explorer", "Village Storyteller", "Young Farmer", "Brave Messenger", "Friendly Noble"]
    },
    "Animal Stories": {
      settings: ["Animal-Based", "Survival", "Magical Realism"],
      morals: ["Kindness and Empathy", "Friendship and Teamwork", "Environmental Awareness", "Gratitude and Contentment"],
      tones: ["Lighthearted and Fun", "Optimistic and Hopeful", "Funny and Humorous", "Fantasy and Magical"],
      characters: ["Brave Lion Cub", "Curious Fox Kit", "Playful Puppy", "Wise Old Owl", "Shy Deer", "Bold Bunny Explorer", "Loyal Herd Leader", "Friendly Dolphin"]
    }
  };

  function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  const fallback = genreFallbacks[genre] || {};
  const finalSetting = setting || (fallback.settings ? pickRandom(fallback.settings) : "a magical world");
  const finalMoral = moral || (fallback.morals ? pickRandom(fallback.morals) : "kindness and bravery");
  const finalTone = tone || (fallback.tones ? pickRandom(fallback.tones) : "fun and warm");
  const finalCharacter = character || (fallback.characters ? pickRandom(fallback.characters) : "a brave child");

  const lengthToTokens = {
    "Short (2 minutes)": 700,
    "Medium (5 minutes)": 1500,
    "Long (7 minutes)": 2200,
  };
  const maxTokens = lengthToTokens[length] || 700;

  const prompt = `
  A magical bedtime story for a ${age}-year-old child.
  Genre: ${genre}.
  Setting: ${finalSetting || "a magical world"}.
  Moral of the story: ${finalMoral || "kindness and bravery"}.
  Tone: ${finalTone || "fun and warm"}.
  Estimated reading time: ${length || "short (2–3 minutes)"}.
  Main character or theme: ${finalCharacter}.

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
            content: "You are a friendly AI that writes magical bedtime stories for children.",
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
    console.log("🧠 Full Story AI Response:", data);

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "No story generated." });
    }

    const aiStory = data.choices[0].message.content.trim();
    return res.status(200).json({ response: aiStory });

  } catch (err) {
    console.error("❌ Error generating story:", err);
    return res.status(500).json({ error: "Server error while generating story" });
  }
}

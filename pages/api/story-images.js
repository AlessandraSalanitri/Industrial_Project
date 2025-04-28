//Customized pictures for eacg player and story

import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const dirPath = path.join(process.cwd(), "public/assets/story-images");

  try {
    const files = fs.readdirSync(dirPath).filter(file =>
      file.match(/\.(jpg|jpeg|png|gif)$/i)
    );

    res.status(200).json({ images: files });
  } catch (error) {
    console.error("Error reading story-images folder:", error);
    res.status(500).json({ error: "Failed to read images." });
  }
}

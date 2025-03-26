import express, { Request, Response } from "express";

// Initialize Express
const app = express();
app.use(express.json());

// Set port
const PORT = process.env.PORT || 3000;

// Using dynamic import for ESM module
async function main() {
  const { JSONFilePreset } = await import("lowdb/node");

  const db = await JSONFilePreset<{
    face: "heads" | "tails" | null;
  }>("game.json", { face: null });

  // Route to get the current face of the coin
  app.get("/api/coin-face", (req: Request, res: Response) => {
    const face = db.data.face;
    res.json({ face });
  });

  // Route to update the face of the coin
  app.post("/api/flip", async (req, res) => {
    const face = Math.random() >= 0.5 ? "heads" : "tails";
    db.data.face = face;
    await db.write();
    res.json({ face: db.data.face });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error("Server failed to start:", error);
});

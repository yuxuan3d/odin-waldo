const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma'); // Adjust the path to your generated Prisma client

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port =  process.env.PORT|| 3000;

app.use(express.json())
app.use(cors());

app.get('/api/pokemon', async (req, res) => {
    try {
      const pokemonTargets = await prisma.pokemon.findMany({
        // Select only the fields needed by the frontend
        select: {
          id: true, // Keep the DB id
          name: true,
          xPercent: true,
          yPercent: true,
          tolerance: true,
        }
      });
      res.json(pokemonTargets); // Send data as JSON
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
      res.status(500).json({ error: 'Failed to fetch Pokemon data' });
    }
  });

app.post('/api/submitScore', async (req, res) => {
    const { username, score } = req.body;
    try {
        const newScore = await prisma.score.create({
            data: {
                userId: username,
                score: score,
            },
        });
        res.json(newScore);
    } catch (error) {
        console.error("Error submitting score:", error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
})

app.get('/api/leaderboard', async (req, res) => {
    try {
        const scores = await prisma.score.findMany({
            orderBy: { score: 'desc' },
            take: 20,
        });
        res.json(scores);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
})

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});
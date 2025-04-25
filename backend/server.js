const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma'); // Adjust the path to your generated Prisma client

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port =  process.env.PORT|| 3000;

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

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});
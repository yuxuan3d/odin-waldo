const { PrismaClient } = require('./generated/prisma'); // Adjust the path to your generated Prisma client

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Data to seed
const pokemonData = [
  { name: "Exeggutor", xPercent: 49.5, yPercent: 43, tolerance: 3 },
  { name: "Slowpoke", xPercent: 84, yPercent: 85.5, tolerance: 3 },
  { name: "Snorlax", xPercent: 58.5, yPercent: 29, tolerance: 2 },
];

async function main() {
  console.log(`Start seeding ...`);

  for (const p of pokemonData) {
    // Using upsert: creates the pokemon if it doesn't exist (based on unique name),
    // or updates it if it already exists. This makes the seed script idempotent.
    const pokemon = await prisma.pokemon.upsert({
      where: { name: p.name }, // Use the unique name field to check existence
      update: { // Fields to update if it exists
        xPercent: p.xPercent,
        yPercent: p.yPercent,
        tolerance: p.tolerance,
      },
      create: { // Fields to use if creating new
        name: p.name,
        xPercent: p.xPercent,
        yPercent: p.yPercent,
        tolerance: p.tolerance,
      },
    });
    console.log(`Created or updated pokemon with id: ${pokemon.id} (${pokemon.name})`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    // Disconnect Prisma Client on success
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // Catch errors, log them, disconnect, and exit with failure code
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
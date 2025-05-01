// This script runs the TypeScript import script using ts-node
const { execSync } = require("child_process")
const path = require("path")

console.log("Starting recipe import process...")

try {
  // Run the TypeScript script using ts-node
  execSync("npx ts-node scripts/import-recipes.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  })

  console.log("Recipe import completed successfully!")
} catch (error) {
  console.error("Error running import script:", error)
  process.exit(1)
}

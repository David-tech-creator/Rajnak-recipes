import { NextResponse } from "next/server"
import { load } from "cheerio"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || !url.trim()) {
      return NextResponse.json({ message: "No URL provided" }, { status: 400 })
    }

    // Fetch the content from the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Use cheerio to parse the HTML
    const $ = load(html)

    // Try to extract recipe content
    let content = ""

    // First, look for structured recipe data
    const jsonLdScripts = $('script[type="application/ld+json"]')
    let foundRecipeData = false

    jsonLdScripts.each((_, element) => {
      if (foundRecipeData) return

      try {
        const scriptContent = $(element).html()
        if (!scriptContent) return

        const jsonData = JSON.parse(scriptContent)

        // Check if this is recipe data
        const recipeData = jsonData["@graph"]
          ? jsonData["@graph"].find((item: any) => item["@type"] === "Recipe")
          : jsonData["@type"] === "Recipe"
            ? jsonData
            : null

        if (recipeData) {
          foundRecipeData = true

          // Extract recipe information
          content += `Title: ${recipeData.name || ""}\n\n`

          if (recipeData.description) {
            content += `Description: ${recipeData.description}\n\n`
          }

          if (recipeData.prepTime || recipeData.cookTime || recipeData.totalTime) {
            content += "Time:\n"
            if (recipeData.prepTime) content += `Prep Time: ${recipeData.prepTime}\n`
            if (recipeData.cookTime) content += `Cook Time: ${recipeData.cookTime}\n`
            if (recipeData.totalTime) content += `Total Time: ${recipeData.totalTime}\n`
            content += "\n"
          }

          if (recipeData.recipeYield) {
            content += `Servings: ${recipeData.recipeYield}\n\n`
          }

          if (recipeData.recipeIngredient && Array.isArray(recipeData.recipeIngredient)) {
            content += "Ingredients:\n"
            recipeData.recipeIngredient.forEach((ingredient: string) => {
              content += `- ${ingredient}\n`
            })
            content += "\n"
          }

          if (recipeData.recipeInstructions) {
            content += "Instructions:\n"

            if (Array.isArray(recipeData.recipeInstructions)) {
              recipeData.recipeInstructions.forEach((instruction: any, index: number) => {
                const step = typeof instruction === "string" ? instruction : instruction.text || instruction.name || ""

                content += `${index + 1}. ${step}\n`
              })
            } else if (typeof recipeData.recipeInstructions === "string") {
              content += recipeData.recipeInstructions
            }

            content += "\n"
          }
        }
      } catch (error) {
        console.error("Error parsing JSON-LD:", error)
      }
    })

    // If no structured data found, try to extract from HTML
    if (!foundRecipeData) {
      // Look for common recipe elements

      // Title
      const title = $("h1").first().text().trim()
      if (title) {
        content += `Title: ${title}\n\n`
      }

      // Ingredients
      const ingredientSections = $(
        'section:contains("Ingredients"), div:contains("Ingredients"), ul:contains("Ingredients")',
      )
      if (ingredientSections.length > 0) {
        content += "Ingredients:\n"

        ingredientSections.find("li").each((_, element) => {
          const ingredient = $(element).text().trim()
          if (ingredient) {
            content += `- ${ingredient}\n`
          }
        })

        content += "\n"
      }

      // Instructions
      const instructionSections = $(
        'section:contains("Instructions"), div:contains("Instructions"), ol:contains("Instructions")',
      )
      if (instructionSections.length > 0) {
        content += "Instructions:\n"

        instructionSections.find("li, p").each((index, element) => {
          const instruction = $(element).text().trim()
          if (instruction) {
            content += `${index + 1}. ${instruction}\n`
          }
        })

        content += "\n"
      }
    }

    // If still no content, extract the main content of the page
    if (!content.trim()) {
      // Remove common non-content elements
      $(
        "header, footer, nav, aside, script, style, noscript, iframe, .comments, .sidebar, .ad, .advertisement",
      ).remove()

      // Get the main content
      const mainContent = $("main, article, .content, .post-content, .entry-content").text()

      if (mainContent) {
        content = mainContent
      } else {
        // Fallback to body content
        content = $("body").text()
      }

      // Clean up the content
      content = content.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim()
    }

    if (!content.trim()) {
      throw new Error("Could not extract content from the URL")
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error in extract-url API:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

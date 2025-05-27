import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client with the API key directly
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ message: "No text provided" }, { status: 400 })
    }

    // Call OpenAI API to extract recipe information
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a recipe extraction assistant. Extract structured recipe information from the provided text. 
          Return ONLY a JSON object with the following fields:
          - title: string (required)
          - description: string (optional)
          - prep_time: string (optional)
          - cook_time: string (optional)
          - servings: number (optional)
          - ingredients: string[] (required, array of strings)
          - instructions: string[] (required, array of strings)
          - notes: string (optional)
          - category: string (optional)
          
          Make sure to clean up and format the data properly. For ingredients and instructions, each item should be a separate string in the array.
          If you can't extract certain information, omit those fields from the JSON.
          Return only valid JSON, no explanations or text outside the JSON object.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
    })

    // Parse the response
    const content = response.choices[0].message.content

    if (!content) {
      throw new Error("Failed to extract recipe information")
    }

    let recipeData
    try {
      recipeData = JSON.parse(content)
    } catch (error) {
      console.error("Error parsing OpenAI response:", error)
      throw new Error("Failed to parse recipe information")
    }

    // Validate required fields
    if (!recipeData.title) {
      recipeData.title = "Untitled Recipe"
    }

    if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
      recipeData.ingredients = ["No ingredients found"]
    }

    if (!recipeData.instructions || !Array.isArray(recipeData.instructions) || recipeData.instructions.length === 0) {
      recipeData.instructions = ["No instructions found"]
    }

    return NextResponse.json(recipeData)
  } catch (error) {
    console.error("Error in extract-recipe API:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

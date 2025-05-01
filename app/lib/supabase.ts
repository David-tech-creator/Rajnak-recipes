import { createClient } from "@supabase/supabase-js"

// For server components (using service role key for higher privileges)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ympkbokirbnndytnfvem.supabase.co"
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcGtib2tpcmJubmR5dG5mdmVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDgzMzM1NywiZXhwIjoyMDYwNDA5MzU3fQ.N1-0nPy6kR401I8aCHPLaqtjXnAEfKf1nr2vZhGpVxc"

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    db: { schema: "public" },
  })
}

// For client components (using anon key for public access)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ympkbokirbnndytnfvem.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcGtib2tpcmJubmR5dG5mdmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzMzNTcsImV4cCI6MjA2MDQwOTM1N30.FA9IEQ_PV6eegVap-RRAAZ2Zo0uyePJCskWov63BzK8",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)

export type Recipe = {
  id: number
  title: string
  slug: string
  category: string
  prep_time: string | null
  cook_time: string | null
  servings: number | null
  ingredients: string[]
  instructions: string[]
  images: string[]
  created_at: string
}

// Update the sample recipes to reflect more international cuisines
export const sampleRecipes: Recipe[] = [
  {
    id: 1,
    title: "Cheesecake",
    slug: "cheesecake",
    category: "Desserts",
    prep_time: "30 mins",
    cook_time: "50 mins",
    servings: 8,
    ingredients: [
      "200g digestive biscuits",
      "100g butter, melted",
      "600g cream cheese",
      "150g sugar",
      "3 eggs",
      "1 tsp vanilla extract",
      "200ml sour cream",
    ],
    instructions: [
      "Crush biscuits and mix with melted butter. Press into the base of a springform tin.",
      "Beat cream cheese and sugar until smooth.",
      "Add eggs one at a time, mixing well after each addition.",
      "Stir in vanilla and sour cream.",
      "Pour over the biscuit base and smooth the top.",
      "Bake at 160°C for 45-50 minutes until set but still slightly wobbly in the center.",
      "Cool in the oven with the door ajar, then refrigerate for at least 4 hours.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Cheesecake"],
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Pad Thai",
    slug: "pad-thai",
    category: "Thai",
    prep_time: "20 mins",
    cook_time: "15 mins",
    servings: 4,
    ingredients: [
      "200g rice noodles",
      "2 tbsp vegetable oil",
      "2 cloves garlic, minced",
      "200g tofu or chicken, diced",
      "2 eggs, beaten",
      "100g bean sprouts",
      "3 tbsp fish sauce",
      "2 tbsp tamarind paste",
      "2 tbsp palm sugar",
      "Crushed peanuts and lime wedges to serve",
    ],
    instructions: [
      "Soak rice noodles in hot water until soft, then drain.",
      "Heat oil in a wok and fry garlic until fragrant.",
      "Add tofu or chicken and cook until done.",
      "Push ingredients to one side and scramble eggs on the other side.",
      "Add noodles, bean sprouts, fish sauce, tamarind paste, and palm sugar.",
      "Stir-fry until everything is well combined and heated through.",
      "Serve topped with crushed peanuts and lime wedges.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Pad+Thai"],
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Margherita Pizza",
    slug: "margherita-pizza",
    category: "Italian",
    prep_time: "2 hours",
    cook_time: "10 mins",
    servings: 4,
    ingredients: [
      "500g pizza dough",
      "200g San Marzano tomatoes, crushed",
      "200g fresh mozzarella, torn",
      "Fresh basil leaves",
      "2 tbsp olive oil",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Preheat oven to highest setting with a pizza stone if available.",
      "Stretch dough into a thin circle on a floured surface.",
      "Spread crushed tomatoes over the dough, leaving a border for the crust.",
      "Add torn mozzarella pieces evenly across the pizza.",
      "Bake for 8-10 minutes until crust is golden and cheese is bubbling.",
      "Remove from oven and immediately add fresh basil leaves and a drizzle of olive oil.",
      "Season with salt and pepper before serving.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Margherita+Pizza"],
    created_at: new Date().toISOString(),
  },
]

// Get all recipes with fallback to sample data
export async function getRecipes() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error fetching recipes:", error)
      return sampleRecipes
    }

    if (!data || data.length === 0) {
      console.warn("No recipes found in database, using sample data")
      return sampleRecipes
    }

    return data as Recipe[]
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return sampleRecipes
  }
}

// Get a recipe by slug with fallback
export async function getRecipeBySlug(slug: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("recipes").select("*").eq("slug", slug).single()

    if (error) {
      console.error(`Error fetching recipe with slug ${slug}:`, error)
      return sampleRecipes.find((r) => r.slug === slug) || sampleRecipes[0]
    }

    return data as Recipe
  } catch (error) {
    console.error(`Error fetching recipe with slug ${slug}:`, error)
    return sampleRecipes.find((r) => r.slug === slug) || sampleRecipes[0]
  }
}

// Get recipes by category with fallback
export async function getRecipesByCategory(category: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error fetching recipes in category ${category}:`, error)
      return sampleRecipes.filter((r) => r.category === category)
    }

    return data as Recipe[]
  } catch (error) {
    console.error(`Error fetching recipes in category ${category}:`, error)
    return sampleRecipes.filter((r) => r.category === category)
  }
}

// Search recipes with fallback
export async function searchRecipes(query: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .or(`title.ilike.%${query}%, ingredients.cs.{${query}}`)

    if (error) {
      console.error(`Error searching recipes for "${query}":`, error)
      return sampleRecipes.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.ingredients.some((i) => i.toLowerCase().includes(query.toLowerCase())),
      )
    }

    return data as Recipe[]
  } catch (error) {
    console.error(`Error searching recipes for "${query}":`, error)
    return sampleRecipes.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.ingredients.some((i) => i.toLowerCase().includes(query.toLowerCase())),
    )
  }
}

import { createClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Client for browser usage (with anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Function to create a server-side client (with service role key)
export function createServerSupabaseClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      auth: { persistSession: false },
    }
  )
}

// Recipe type definition
export type Recipe = {
  id: number
  title: string
  slug: string
  description?: string | null
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
  {
    id: 4,
    title: "Chicken Tikka Masala",
    slug: "chicken-tikka-masala",
    category: "Indian",
    prep_time: "30 mins",
    cook_time: "40 mins",
    servings: 4,
    ingredients: [
      "500g chicken thighs, boneless",
      "200g yogurt",
      "2 tbsp garam masala",
      "1 tbsp turmeric",
      "2 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "400g tomato sauce",
      "200ml cream",
      "Fresh coriander for garnish",
      "Rice for serving",
    ],
    instructions: [
      "Marinate chicken in yogurt, 1 tbsp garam masala, turmeric, garlic, and ginger for at least 30 minutes.",
      "Grill or bake chicken until cooked through and slightly charred.",
      "In a large pan, heat oil and add remaining garam masala.",
      "Add tomato sauce and simmer for 10 minutes.",
      "Cut chicken into bite-sized pieces and add to the sauce.",
      "Stir in cream and simmer for another 5-10 minutes.",
      "Garnish with fresh coriander and serve with rice.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Chicken+Tikka+Masala"],
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Guacamole",
    slug: "guacamole",
    category: "Mexican",
    prep_time: "15 mins",
    cook_time: "0 mins",
    servings: 6,
    ingredients: [
      "3 ripe avocados",
      "1 lime, juiced",
      "1 small onion, finely diced",
      "1 tomato, diced",
      "2 tbsp fresh cilantro, chopped",
      "1 jalapeño, seeded and minced",
      "Salt and pepper to taste",
      "Tortilla chips for serving",
    ],
    instructions: [
      "Cut avocados in half, remove pits, and scoop flesh into a bowl.",
      "Mash avocados with a fork, leaving some chunks for texture.",
      "Add lime juice, onion, tomato, cilantro, and jalapeño.",
      "Mix gently and season with salt and pepper to taste.",
      "Serve immediately with tortilla chips or refrigerate with plastic wrap pressed directly onto the surface to prevent browning.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Guacamole"],
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    title: "Swedish Meatballs",
    slug: "swedish-meatballs",
    category: "Swedish",
    prep_time: "30 mins",
    cook_time: "25 mins",
    servings: 4,
    ingredients: [
      "500g mixed ground beef and pork",
      "1 onion, finely chopped",
      "1 egg",
      "50g breadcrumbs",
      "100ml milk",
      "1 tsp allspice",
      "30g butter",
      "30g flour",
      "300ml beef stock",
      "100ml cream",
      "Lingonberry jam for serving",
    ],
    instructions: [
      "Soak breadcrumbs in milk for 5 minutes.",
      "Mix meat, onion, egg, soaked breadcrumbs, allspice, salt, and pepper.",
      "Form into small meatballs and fry in butter until browned all over.",
      "Remove meatballs and add flour to the pan, stirring to make a roux.",
      "Gradually add beef stock, stirring constantly to avoid lumps.",
      "Add cream and simmer until sauce thickens.",
      "Return meatballs to the sauce and simmer for 5 minutes.",
      "Serve with mashed potatoes and lingonberry jam.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Swedish+Meatballs"],
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    title: "Moroccan Tagine",
    slug: "moroccan-tagine",
    category: "Moroccan",
    prep_time: "30 mins",
    cook_time: "1 hour 30 mins",
    servings: 6,
    ingredients: [
      "800g lamb shoulder, cubed",
      "2 onions, sliced",
      "3 cloves garlic, minced",
      "2 tbsp ras el hanout spice mix",
      "1 cinnamon stick",
      "2 tbsp honey",
      "100g dried apricots",
      "50g almonds, toasted",
      "400g chickpeas, drained",
      "500ml vegetable stock",
      "Fresh coriander for garnish",
      "Couscous for serving",
    ],
    instructions: [
      "Brown lamb in batches in a large pot or tagine.",
      "Add onions and garlic, cooking until softened.",
      "Stir in ras el hanout and cinnamon stick, cooking until fragrant.",
      "Add honey, dried apricots, chickpeas, and stock.",
      "Bring to a simmer, cover, and cook on low heat for 1.5 hours until meat is tender.",
      "Sprinkle with toasted almonds and fresh coriander before serving.",
      "Serve with fluffy couscous.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Moroccan+Tagine"],
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    title: "Sushi Rolls",
    slug: "sushi-rolls",
    category: "Japanese",
    prep_time: "45 mins",
    cook_time: "15 mins",
    servings: 4,
    ingredients: [
      "300g sushi rice",
      "50ml rice vinegar",
      "1 tbsp sugar",
      "1 tsp salt",
      "6 nori sheets",
      "1 cucumber, julienned",
      "1 avocado, sliced",
      "200g fresh salmon or tuna, sliced",
      "Soy sauce for serving",
      "Wasabi and pickled ginger for serving",
    ],
    instructions: [
      "Rinse rice until water runs clear, then cook according to package instructions.",
      "Mix rice vinegar, sugar, and salt, then fold into hot cooked rice.",
      "Let rice cool to room temperature.",
      "Place a nori sheet on a bamboo mat, shiny side down.",
      "Spread rice evenly over nori, leaving a 1cm border at the top.",
      "Arrange fillings in a line across the center of the rice.",
      "Roll up tightly using the bamboo mat, wetting the border to seal.",
      "Slice each roll into 6-8 pieces and serve with soy sauce, wasabi, and pickled ginger.",
    ],
    images: ["/placeholder.svg?height=400&width=600&text=Sushi+Rolls"],
    created_at: new Date().toISOString(),
  },
]

// Data fetching functions with improved error handling
export async function getRecipes(): Promise<Recipe[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error fetching recipes:", error)
      return sampleRecipes
    }

    return (data?.length ? data : sampleRecipes) as Recipe[]
  } catch (error) {
    console.error("Error in getRecipes:", error)
    // Always return sample recipes on error
    return sampleRecipes
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("recipes").select("*").eq("slug", slug).single()

    if (error) {
      console.error(`Error fetching recipe with slug ${slug}:`, error)
      // Find in sample recipes as fallback
      const sampleRecipe = sampleRecipes.find((r) => r.slug === slug)
      if (sampleRecipe) return sampleRecipe
      return sampleRecipes[0]
    }

    return data as Recipe
  } catch (error) {
    console.error(`Error in getRecipeBySlug:`, error)
    return sampleRecipes.find((r) => r.slug === slug) || sampleRecipes[0]
  }
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
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

    return (data?.length ? data : sampleRecipes.filter((r) => r.category === category)) as Recipe[]
  } catch (error) {
    console.error(`Error in getRecipesByCategory:`, error)
    return sampleRecipes.filter((r) => r.category === category)
  }
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
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

export interface CategoryGroup {
  name: string
  description: string
  subcategories?: string[]
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: "Family & Found Recipes",
    description: "Classic dishes from family, friends, and sources like Instagram or the internet.",
  },
  {
    name: "Quick & Easy Food",
    description: "Comfort foods that are simple and fast to prepare.",
  },
  {
    name: "Holiday & Celebration Dishes",
    description: "Recipes traditionally made for holidays and special occasions.",
  },
  {
    name: "Soups & Stews",
    description: "Hearty bowls, broths, and stews (e.g., goulash, lentils, kaposzta, chicken soup).",
  },
  {
    name: "Meat Dishes",
    description: "Including beef, pork, lamb, liver, and Hungarian specialties like pörkölt.",
  },
  {
    name: "Chicken Dishes",
    description: "Fried, baked, curry, wok, and stuffed chicken variations.",
  },
  {
    name: "Fish & Seafood",
    description: "Salmon, cod, red mullet, shrimp dumplings, and more.",
  },
  {
    name: "Vegetarian & Vegan",
    description: "Salads, quinoa bowls, broccoli gratin, lentils, pasta, and tofu.",
  },
  {
    name: "Pasta & Noodle Dishes",
    description: "Carbonara, penne alla norma, spaghettis, stir-fried noodles.",
  },
  {
    name: "Grill Dishes & Summer Plates",
    description: "Marinades, grilled pork, BBQ-ready recipes.",
  },
  {
    name: "Side Dishes & Sauces",
    description: "Potatoes, rice, spätzli, paprika sauces, goat cheese, green bean stew.",
  },
  {
    name: "Desserts & Cakes",
    description: "Kladdkaka, semlor, tiramisu, pavlova, plum cake, fig candy.",
  },
  {
    name: "Sandwiches & Brunch Items",
    description: "Warm open sandwiches, toast with roe, lemon tuna toast.",
  },
  {
    name: "Breakfasts & Porridges",
    description: "Mannagrynsgröt, risgrynsgröt, eggs, and soft brunch sweets.",
  },
  {
    name: "Asian & Fusion",
    description: "Sushi, tempura, pad see ew, curry dishes.",
  },
  {
    name: "Liquid Creations & Beverages",
    description: "From morning elixirs to evening spirits - hot, cold, shaken, or stirred.",
  },
  {
    name: "Other",
    description: "Unique culinary creations that defy categorization - the rebels of your recipe collection.",
  },
]

// Flatten categories for dropdowns and selects
export const ALL_CATEGORIES: string[] = CATEGORY_GROUPS.flatMap((group) => {
  // Include the main category
  const categories = [group.name]

  // Add subcategories if they exist
  if (group.subcategories) {
    categories.push(...group.subcategories)
  }

  return categories
})

// Get a category group by name
export function getCategoryGroup(name: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find(
    (group) => group.name === name || (group.subcategories && group.subcategories.includes(name)),
  )
}

// Get parent category name for a subcategory
export function getParentCategory(subcategory: string): string | undefined {
  const group = CATEGORY_GROUPS.find((group) => group.subcategories && group.subcategories.includes(subcategory))
  return group?.name
}

// Check if a category is a subcategory
export function isSubcategory(category: string): boolean {
  return CATEGORY_GROUPS.some((group) => group.subcategories && group.subcategories.includes(category))
}

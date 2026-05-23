import fs from "fs"
import path from "path"
import matter from "gray-matter"

const postsDirectory = path.join(process.cwd(), "content/recipes")

export function categoryToSlug(name: string): string {
  return name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-")
}

function parseInstructionsFromContent(content: string): string[] {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean)
  const steps: string[] = []
  let current = ""
  for (const line of lines) {
    if (line.startsWith("## ")) continue
    const match = line.match(/^(\d+)\.\s*(.*)/)
    if (match) {
      if (current) steps.push(current.trim())
      current = match[2]
    } else if (current) {
      current += " " + line
    }
  }
  if (current) steps.push(current.trim())
  return steps.filter((s) => s.length > 2)
}

export type Recipe = {
  slug: string
  title: string
  date: string
  category: string
  image?: string
  ingredients: string[]
  instructions: string[]
  prepTime?: string
  cookTime?: string
  servings?: number
  featured?: boolean
  content: string
  /** Authentic short handwritten tip in the margin (Caveat font). */
  kitchenNote?: string
  /** Cuisine-appropriate enjoyment phrase shown at the bottom of the recipe. */
  signoff?: string
  /** 1–3 paragraph narrative about origin / tradition / context. */
  story?: string
  /** Easy / Medium / Showpiece — appears in the meta row. */
  difficulty?: string
  /** Short handwritten line under the recipe card title (e.g. "— Sunday morning, always"). */
  byline?: string
}

const DEFAULT_BYLINES: Record<string, string> = {
  "Family Recipes": "the dishes we grew up on",
  "Found Recipes": "picked up along the way",
  "Quick & Easy": "for busy weeknights",
  "Christmas & Easter": "for the holiday table",
}

export function defaultBylineFor(category: string): string {
  return DEFAULT_BYLINES[category] ?? "from the family book"
}

export function getAllPostSlugs() {
  try {
    const fileNames = fs.readdirSync(postsDirectory)
    return fileNames.map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.mdx$/, ""),
        },
      }
    })
  } catch (error) {
    console.error("Error reading post directory:", error)
    return []
  }
}

export function getPostBySlug(slug: string): Recipe | null {
  // Special case for "new" slug
  if (slug === "new") {
    return null
  }

  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)

    let instructions: string[] = Array.isArray(data.instructions) ? data.instructions : []
    if (instructions.length === 0) {
      instructions = parseInstructionsFromContent(content)
    }

    return {
      slug,
      title: data.title || "Untitled Recipe",
      date: data.date || new Date().toISOString(),
      category: data.category || "Uncategorized",
      image: data.image || undefined,
      ingredients: Array.isArray(data.ingredients)
        ? data.ingredients.map((i: unknown) => String(i ?? "").trim()).filter(Boolean)
        : [],
      instructions,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      featured: data.featured || false,
      kitchenNote: typeof data.kitchenNote === "string" ? data.kitchenNote : undefined,
      signoff: typeof data.signoff === "string" ? data.signoff : undefined,
      story: typeof data.story === "string" ? data.story : undefined,
      difficulty: typeof data.difficulty === "string" ? data.difficulty : undefined,
      byline: typeof data.byline === "string" ? data.byline : undefined,
      content,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export function getAllPosts(): Recipe[] {
  try {
    const slugs = getAllPostSlugs()
    const posts = slugs
      .map(({ params: { slug } }) => getPostBySlug(slug))
      .filter((post): post is Recipe => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return posts
  } catch (error) {
    console.error("Error getting all posts:", error)
    return []
  }
}

export function getLatestPosts(count = 12): Recipe[] {
  try {
    const allPosts = getAllPosts()
    return allPosts.slice(0, count)
  } catch (error) {
    console.error("Error getting latest posts:", error)
    return []
  }
}

export function getFeaturedPosts(count = 3): Recipe[] {
  try {
    const allPosts = getAllPosts()
    // First try to get posts marked as featured
    const featuredPosts = allPosts.filter((post) => post.featured)

    // If we have enough featured posts, return them
    if (featuredPosts.length >= count) {
      return featuredPosts.slice(0, count)
    }

    // Otherwise, supplement with latest posts
    return [...featuredPosts, ...allPosts.filter((post) => !post.featured)].slice(0, count)
  } catch (error) {
    console.error("Error getting featured posts:", error)
    return []
  }
}

export function getPostsByCategory(category: string): Recipe[] {
  try {
    const allPosts = getAllPosts()
    return allPosts.filter((post) => post.category.toLowerCase() === category.toLowerCase())
  } catch (error) {
    console.error(`Error getting posts by category ${category}:`, error)
    return []
  }
}

export function getAllCategories(): string[] {
  try {
    const posts = getAllPosts()
    const categories = new Set(posts.map((post) => post.category))
    return Array.from(categories)
  } catch (error) {
    console.error("Error getting all categories:", error)
    return []
  }
}

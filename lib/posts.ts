import fs from "fs"
import path from "path"
import matter from "gray-matter"

const postsDirectory = path.join(process.cwd(), "content/recipes")

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

    return {
      slug,
      title: data.title || "Untitled Recipe",
      date: data.date || new Date().toISOString(),
      category: data.category || "Uncategorized",
      image: data.image || undefined,
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      featured: data.featured || false,
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

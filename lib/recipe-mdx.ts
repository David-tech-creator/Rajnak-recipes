/**
 * Helpers for serializing recipe data to MDX with YAML frontmatter,
 * and slugifying titles.
 */

export type RecipeDraft = {
  slug: string
  title: string
  category: string
  image?: string
  prepTime?: string
  cookTime?: string
  servings?: number
  difficulty?: string
  ingredients: string[]
  instructions: string[]
  kitchenNote?: string
  signoff?: string
  story?: string
  featured?: boolean
  date?: string
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function yamlString(value: string): string {
  // Always single-quote and escape any single quote inside by doubling.
  return `'${value.replace(/'/g, "''")}'`
}

function yamlList(items: string[], indent = "  "): string {
  if (items.length === 0) return "[]"
  return items.map((i) => `${indent}- ${yamlString(i)}`).join("\n")
}

function yamlBlock(value: string, indent = "  "): string {
  const trimmed = value.replace(/\r\n/g, "\n").trim()
  return `|\n${trimmed
    .split("\n")
    .map((line) => `${indent}${line}`)
    .join("\n")}`
}

export function serializeRecipe(draft: RecipeDraft): string {
  const lines: string[] = ["---"]
  lines.push(`title: ${yamlString(draft.title)}`)
  lines.push(`date: '${draft.date ?? new Date().toISOString().slice(0, 10)}'`)
  lines.push(`category: ${yamlString(draft.category)}`)
  lines.push(`image: ${yamlString(draft.image ?? `/images/recipes/${draft.slug}.jpg`)}`)
  if (draft.prepTime) lines.push(`prepTime: ${yamlString(draft.prepTime)}`)
  if (draft.cookTime) lines.push(`cookTime: ${yamlString(draft.cookTime)}`)
  if (draft.servings) lines.push(`servings: ${draft.servings}`)
  if (draft.difficulty) lines.push(`difficulty: ${draft.difficulty}`)
  if (draft.kitchenNote) lines.push(`kitchenNote: ${yamlString(draft.kitchenNote)}`)
  if (draft.signoff) lines.push(`signoff: ${yamlString(draft.signoff)}`)
  lines.push(`featured: ${draft.featured ? "true" : "false"}`)
  lines.push(`ingredients:`)
  lines.push(yamlList(draft.ingredients))
  lines.push(`instructions:`)
  lines.push(yamlList(draft.instructions))
  if (draft.story) {
    lines.push(`story: ${yamlBlock(draft.story)}`)
  }
  lines.push("---")
  lines.push("")
  return lines.join("\n")
}

export function validateDraft(d: Partial<RecipeDraft>): string | null {
  if (!d.title || d.title.trim().length < 2) return "Title is required."
  if (!d.category) return "Category is required."
  if (!d.ingredients || d.ingredients.filter((i) => i.trim()).length === 0)
    return "At least one ingredient is required."
  if (!d.instructions || d.instructions.filter((i) => i.trim()).length === 0)
    return "At least one instruction step is required."
  return null
}

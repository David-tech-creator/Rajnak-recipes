import { redirect } from "next/navigation"

export default function NewRecipePage() {
  // Redirect to the create-new page to avoid conflicts with the [slug] route
  redirect("/recipes/create-new")
}

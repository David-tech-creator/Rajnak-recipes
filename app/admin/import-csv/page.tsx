import { CSVRecipeImporter } from "@/components/csv-recipe-importer"

export const metadata = {
  title: "Import CSV Recipes",
  description: "Import recipes from a CSV file",
}

export default function ImportCSVPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Import Recipes from CSV</h1>
      <CSVRecipeImporter />
    </div>
  )
}

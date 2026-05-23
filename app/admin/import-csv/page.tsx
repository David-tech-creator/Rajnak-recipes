import { CSVRecipeImporter } from "@/components/csv-recipe-importer"
import { SprigDivider } from "@/components/sprig-divider"

export const metadata = {
  title: "Import CSV Recipes",
  description: "Import recipes from a CSV file",
}

export default function ImportCSVPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Import from <em className="italic" style={{ color: "var(--lingon-deep)" }}>CSV</em>
        </h1>
        <p className="lede">Bring a spreadsheet of recipes into the cookbook.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <CSVRecipeImporter />
    </div>
  )
}

import { ImportStatus } from "@/components/import-status"
import { InitStorage } from "@/components/init-storage"
import { JsonRecipeImporter } from "@/components/json-recipe-importer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

export default function ImportPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl text-center mb-12">Recipe Administration</h1>

      <div className="grid gap-8 max-w-3xl mx-auto">
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">1. Initialize Storage</h2>
          <p className="mb-4 text-gray-600">
            Before uploading images, you need to initialize the storage bucket. This only needs to be done once.
          </p>
          <InitStorage />
        </div>

        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">2. Import Recipes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">From CSV</h3>
              <p className="mb-4 text-gray-600">Import recipes from the CSV file into your database.</p>
              <ImportStatus />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">From JSON</h3>
              <p className="mb-4 text-gray-600">Import recipes from a JSON file into your database.</p>
              <JsonRecipeImporter />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">3. Manage Recipe Images</h2>
          <p className="mb-4 text-gray-600">Upload and manage images for each recipe.</p>
          <div className="text-center">
            <Button asChild>
              <Link href="/admin/recipes">
                <ImageIcon className="mr-2 h-4 w-4" />
                Manage Recipe Images
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

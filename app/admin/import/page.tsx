import { ImportStatus } from "@/components/import-status"
import { InitStorage } from "@/components/init-storage"
import { JsonRecipeImporter } from "@/components/json-recipe-importer"
import Link from "next/link"
import { SprigDivider } from "@/components/sprig-divider"

export default function ImportPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Recipe <em className="italic" style={{ color: "var(--lingon-deep)" }}>administration</em>
        </h1>
        <p className="lede">Bring new dishes into the book — set up storage, import the archive, then attach photographs.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="grid gap-10 max-w-3xl mx-auto">
        <section className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10">
          <div className="eyebrow eyebrow--lingon mb-3">Step one</div>
          <h2 className="editorial-h3 font-normal mb-3">Initialize storage</h2>
          <p className="font-serif italic text-ink-soft mb-6">
            Before uploading photographs, the storage bucket needs to be created. This is a one-time setup.
          </p>
          <InitStorage />
        </section>

        <section className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10">
          <div className="eyebrow eyebrow--lingon mb-3">Step two</div>
          <h2 className="editorial-h3 font-normal mb-6">Import recipes</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-3">From CSV</div>
              <p className="font-serif italic text-ink-soft mb-5">
                Pull recipes from the provided CSV into the database.
              </p>
              <ImportStatus />
            </div>
            <div>
              <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-3">From JSON</div>
              <p className="font-serif italic text-ink-soft mb-5">
                Or import recipes from a JSON file instead.
              </p>
              <JsonRecipeImporter />
            </div>
          </div>
        </section>

        <section className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10">
          <div className="eyebrow eyebrow--lingon mb-3">Step three</div>
          <h2 className="editorial-h3 font-normal mb-3">Manage recipe images</h2>
          <p className="font-serif italic text-ink-soft mb-6">
            Pair each recipe with the photographs that belong to it.
          </p>
          <div className="text-center">
            <Link href="/admin/recipes" className="btn">
              Open the image manager
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

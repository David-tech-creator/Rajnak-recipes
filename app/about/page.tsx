import Image from "next/image"
import { PhotoGallery } from "@/components/family-gallery/photo-gallery"
import { SprigDivider } from "@/components/sprig-divider"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Our Story</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          A family <em className="italic" style={{ color: "var(--lingon-deep)" }}>cookbook</em>, gathered over generations.
        </h1>
        <p className="lede">
          Hungarian and Swedish recipes, written down on the backs of envelopes and in the
          margins of older cookbooks, now collected into one place.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="relative aspect-[16/9] mb-12 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] overflow-hidden">
          <Image
            src="/images/nordic-dining.png"
            alt="A long, warmly lit family dining table"
            fill
            className="object-cover"
            style={{ filter: "saturate(0.92)" }}
            sizes="(max-width: 1024px) 100vw, 768px"
            priority
          />
        </div>

        <article className="recipe-prose text-[19px]">
          <p className="lede text-center mb-10">
            What began as scraps of paper passed between kitchens has become this book — a working
            archive of the dishes that have fed our family across countries and decades.
          </p>

          <h2>The Hungarian side</h2>
          <p>
            Pörkölt slow-simmered with paprika, töltött káposzta on cold afternoons, körözött spread on
            black bread, langos torn warm at the table, rakott krumpli baked layer by layer, gulasch
            soup that improves overnight. These are the recipes that came with us — written in spiral
            notebooks, sometimes only as ingredient lists with the method left to memory.
          </p>

          <h2>The Swedish side</h2>
          <p>
            Kanelbullar on Sunday mornings, semlor in February, gravadlax at Christmas, ärtsoppa on
            Thursdays the way the soldiers ate it, glögg with almonds and raisins, fattiga riddare in
            the cast-iron pan. The Swedish kitchen takes its time, and it rewards the trouble.
          </p>

          <h2>Everything else we&apos;ve picked up</h2>
          <p>
            A risotto from Sicily. Ramen learned over a long Tokyo lunch. Tacos done the way the
            family next door taught us. A Tarte Tropézienne brought back from a holiday on the
            Côte d&apos;Azur. These are the &ldquo;found&rdquo; recipes — dishes we ate somewhere and decided we
            wanted at home too. They sit alongside the family ones, and at this point they are
            family too.
          </p>
        </article>

        <SprigDivider variant="leaf" className="!my-12 max-w-sm mx-auto" />

        <blockquote className="pullquote my-12">
          Hemlagad mat med kärlek &mdash; homemade food, with love.
          <cite>&mdash; The line at the top of the book</cite>
        </blockquote>

        <article className="recipe-prose text-[19px]">
          <h2>About this collection</h2>
          <p>
            Every recipe here has been cooked at our table — usually many times. The photos are the
            actual finished dishes, not stock photography. Where a recipe came from someone outside
            the family we&apos;ve noted it; where it&apos;s been edited from the original we&apos;ve made the change
            and moved on. A cookbook is meant to be marked up.
          </p>
          <p>
            If you&apos;re reading this and you&apos;re not in the family, welcome anyway. Cook from it.
          </p>
          <p>From our kitchen to yours &mdash; smaklig måltid, jó étvágyat.</p>
        </article>

        <p className="hand text-[28px] text-right mt-10">&mdash; The Rajnak family</p>

        <SprigDivider variant="arc" className="!mt-16 !mb-4 max-w-sm mx-auto" />
      </div>

      <div className="max-w-5xl mx-auto mt-20 pt-16 border-t border-rule-soft">
        <PhotoGallery />
      </div>
    </div>
  )
}

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
          A collection of the dishes we keep coming back to — gathered into one place.
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
            This is a working archive of the dishes that have fed us, our family and our friends — across
            countries and over many years.
          </p>

          <h2>Family recipes</h2>
          <p>
            The dishes we grew up on — Hungarian, Swedish, and Swiss in roughly equal measure. Pörkölt
            and gulasch and töltött káposzta. Kanelbullar, semlor, ärtsoppa, fattiga riddare.
            Rösti and Spätzli. The kind of cooking that takes its time and rewards the trouble.
          </p>

          <h2>Found recipes</h2>
          <p>
            Dishes we ate somewhere — a holiday, a restaurant, a friend&apos;s table — and decided we wanted
            at home too. Risotto from Italy, ramen from Japan, tacos from Mexico, a tarte from the
            Côte d&apos;Azur. They sit alongside the family ones, and at this point they are family too.
          </p>

          <h2>Quick &amp; easy</h2>
          <p>
            Tuesday-night supper. Bowls and toasts and one-pan dinners. The recipes we reach for when
            there&apos;s no time but we still want to eat well.
          </p>
        </article>

        <SprigDivider variant="leaf" className="!my-12 max-w-sm mx-auto" />

        <blockquote className="pullquote my-12">
          Hemlagad mat med kärlek &mdash; homemade food, with love.
        </blockquote>

        <article className="recipe-prose text-[19px]">
          <h2>About this collection</h2>
          <p>
            Every recipe here has been cooked — usually many times. The photos are the actual finished
            dishes, not stock photography. A cookbook is meant to be cooked from and marked up.
          </p>
          <p>
            If you&apos;re reading this and you&apos;re not in the family, welcome anyway. Cook from it.
          </p>
          <p>From our kitchen to yours.</p>
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

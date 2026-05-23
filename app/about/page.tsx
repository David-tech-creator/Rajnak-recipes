import Image from "next/image"
import { PhotoGallery } from "@/components/family-gallery/photo-gallery"
import { SprigDivider } from "@/components/sprig-divider"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">No. IV · Our Story</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          An heirloom <em className="italic" style={{ color: "var(--lingon-deep)" }}>kitchen</em>, four generations deep.
        </h1>
        <p className="lede">
          Recipes carried from northern Sweden to the wider world, then back to the family table.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="relative aspect-[16/9] mb-12 bg-cream border border-rule-soft shadow-[var(--paper-shadow)] overflow-hidden">
          <Image
            src="/images/nordic-dining.png"
            alt="A warm dining room with a woman setting the table"
            fill
            className="object-cover"
            style={{ filter: "saturate(0.92)" }}
            sizes="(max-width: 1024px) 100vw, 768px"
            priority
          />
        </div>

        <article className="recipe-prose text-[19px]">
          <h2>Our Family Story</h2>

          <p>
            Welcome to Our Family Recipe Collection, a diverse treasury of beloved recipes from around the world that
            spans four generations of our family. What began as handwritten notes in the margins of cookbooks and on the
            backs of envelopes has evolved into this digital collection of our culinary heritage, featuring dishes from
            across the globe that have become part of our family&apos;s story.
          </p>

          <p>
            The story begins in the early 1920s with our great-grandmother, who emigrated from northern Sweden to start
            a new life. Bringing little more than her family recipes and a cast-iron skillet passed down from her own
            mother, she kept her connection to home alive through the foods she prepared. Her cinnamon buns became
            legendary in her new community, and her Swedish meatballs were the centerpiece of every holiday gathering.
          </p>

          <h2>From Generation to Generation</h2>

          <p>
            As the family grew, so did our recipe collection. Our daughter married into another family, bringing new
            flavors and techniques to our table. She was known for her innovative approach to traditional dishes, often
            incorporating ingredients and methods from her travels and friendships with people from different cultures.
            Her cured salmon with mustard sauce became a Christmas Eve tradition, while her experiments with curries,
            stir-fries, and Mediterranean dishes expanded our culinary horizons.
          </p>

          <p>
            By the 1970s, our daughter had taken up the family&apos;s culinary torch. A passionate home cook with an
            adventurous palate, she significantly expanded our repertoire during her extensive travels across Europe,
            Asia, Africa, and the Americas. She was the first to document our family recipes systematically, creating a
            handbound cookbook as a wedding gift for each of her children. Her marginalia&mdash;&ldquo;add more
            dill,&rdquo; &ldquo;substitute coconut milk for a Thai twist,&rdquo; &ldquo;Papa&apos;s favorite&rdquo;&mdash;
            provide glimpses into our family history that are as precious as the recipes themselves.
          </p>
        </article>

        <SprigDivider variant="leaf" className="!my-12 max-w-sm mx-auto" />

        <blockquote className="pullquote my-12">
          Food is our common ground, a universal experience. The dinner table is where we forge our strongest bonds and
          create our most enduring memories.
          <cite>&mdash; Someone in our Family</cite>
        </blockquote>

        <article className="recipe-prose text-[19px]">
          <h2>The Modern Collection</h2>

          <p>
            Today, the fourth generation of our family continues to honor our culinary heritage while bringing our own
            contemporary touches to family classics from around the world. What you&apos;ll find in Our Family Recipe
            Collection is a living document&mdash;recipes that evolve as we do, reflecting changing tastes, global
            influences, and lifestyles while preserving the essence of what makes them special.
          </p>

          <p>
            Some recipes remain virtually unchanged from the originals, while others have been adapted for modern
            ingredients and cooking methods or infused with international flavors. All of them carry stories: the
            pickled gherkins that accompanied summer crayfish parties by the lake; the cardamom-scented wheat bread that
            filled the house with its aroma on Sunday mornings; the Thai curry that reminds us of travels in Southeast
            Asia; the homemade pasta that commemorates summers in Italy; and the spicy Mexican enchiladas that became a
            Friday night tradition.
          </p>

          <h2>Our Table Is Your Table</h2>

          <p>
            In Swedish homes, there&apos;s a concept called &ldquo;lagom&rdquo;&mdash;not too much, not too little, just
            right. We believe the best meals embody this principle: thoughtfully prepared, lovingly served, and meant to
            be shared. Every recipe in this collection has been tested and refined at countless family gatherings, from
            everyday dinners to milestone celebrations.
          </p>

          <p>
            By sharing these recipes, we invite you into our family tradition. We hope they bring as much joy to your
            table as they have to ours over the generations. Perhaps you&apos;ll add your own notes in the margins,
            adapt them to your family&apos;s tastes, and create new memories around the dishes that have sustained our
            family for over a century.
          </p>

          <p>From our kitchen to yours&mdash;v&auml;lkommen och smaklig m&aring;ltid! (Welcome and enjoy your meal!)</p>
        </article>

        <p className="hand text-[28px] text-right mt-10">&mdash; Our Family</p>

        <SprigDivider variant="arc" className="!mt-16 !mb-4 max-w-sm mx-auto" />
      </div>

      {/* Family Photo Gallery Section */}
      <div className="max-w-5xl mx-auto mt-20 pt-16 border-t border-rule-soft">
        <PhotoGallery />
      </div>
    </div>
  )
}

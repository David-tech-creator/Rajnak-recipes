import Image from "next/image"
import { PhotoGallery } from "@/components/family-gallery/photo-gallery"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">About Us</h1>

        <div className="relative aspect-[16/9] mb-8">
          <Image
            src="/images/nordic-dining.png"
            alt="A warm dining room with a woman setting the table"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 1024px) 100vw, 768px"
            priority
          />
        </div>

        <div className="prose max-w-none">
          <h2>Our Family Story</h2>

          <p>
            Welcome to Our Family Recipe Collection, a diverse treasury of beloved recipes from around the world that
            spans four generations of our family. What began as handwritten notes in the margins of cookbooks and on the
            backs of envelopes has evolved into this digital collection of our culinary heritage, featuring dishes from
            across the globe that have become part of our family's story.
          </p>

          <p>
            The story begins in the early 1920s with our great-grandmother, who emigrated from northern Sweden to start
            a new life. Bringing little more than her family recipes and a cast-iron skillet passed down from her own
            mother, she kept her connection to home alive through the foods she prepared. Her cinnamon buns became
            legendary in her new community, and her Swedish meatballs were the centerpiece of every holiday gathering.
          </p>

          <div className="grid grid-cols-2 gap-6 my-8">
            <div className="relative aspect-square">
              <Image
                src="/placeholder.svg?height=400&width=400&text=Vintage+Recipe+Cards"
                alt="Vintage handwritten recipe cards"
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src="/placeholder.svg?height=400&width=400&text=Family+Cookbook"
                alt="Old family cookbook with handwritten notes"
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>

          <h2>From Generation to Generation</h2>

          <p>
            As the family grew, so did our recipe collection. Our daughter married into another family, bringing new
            flavors and techniques to our table. She was known for her innovative approach to traditional dishes, often
            incorporating ingredients and methods from her travels and friendships with people from different cultures.
            Her cured salmon with mustard sauce became a Christmas Eve tradition, while her experiments with curries,
            stir-fries, and Mediterranean dishes expanded our culinary horizons.
          </p>

          <p>
            By the 1970s, our daughter had taken up the family's culinary torch. A passionate home cook with an
            adventurous palate, she significantly expanded our repertoire during her extensive travels across Europe,
            Asia, Africa, and the Americas. She was the first to document our family recipes systematically, creating a
            handbound cookbook as a wedding gift for each of her children. Her marginalia—"add more dill," "substitute
            coconut milk for a Thai twist," "Papa's favorite"—provide glimpses into our family history that are as
            precious as the recipes themselves.
          </p>

          <blockquote className="italic border-l-4 pl-4 my-8">
            "Food is our common ground, a universal experience. The dinner table is where we forge our strongest bonds
            and create our most enduring memories." — Someone in our Family
          </blockquote>

          <h2>The Modern Collection</h2>

          <p>
            Today, the fourth generation of our family continues to honor our culinary heritage while bringing our own
            contemporary touches to family classics from around the world. What you'll find in Our Family Recipe
            Collection is a living document—recipes that evolve as we do, reflecting changing tastes, global influences,
            and lifestyles while preserving the essence of what makes them special.
          </p>

          <p>
            Some recipes remain virtually unchanged from the originals, while others have been adapted for modern
            ingredients and cooking methods or infused with international flavors. All of them carry stories: the
            pickled gherkins that accompanied summer crayfish parties by the lake; the cardamom-scented wheat bread that
            filled the house with its aroma on Sunday mornings; the Thai curry that reminds us of travels in Southeast
            Asia; the homemade pasta that commemorates summers in Italy; and the spicy Mexican enchiladas that became a
            Friday night tradition.
          </p>

          <div className="relative aspect-[16/9] my-8">
            <Image
              src="/placeholder.svg?height=600&width=1200&text=Modern+Family+Cooking+Together"
              alt="Modern family members cooking together"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 1024px) 100vw, 768px"
            />
          </div>

          <h2>Our Table Is Your Table</h2>

          <p>
            In Swedish homes, there's a concept called "lagom"—not too much, not too little, just right. We believe the
            best meals embody this principle: thoughtfully prepared, lovingly served, and meant to be shared. Every
            recipe in this collection has been tested and refined at countless family gatherings, from everyday dinners
            to milestone celebrations.
          </p>

          <p>
            By sharing these recipes, we invite you into our family tradition. We hope they bring as much joy to your
            table as they have to ours over the generations. Perhaps you'll add your own notes in the margins, adapt
            them to your family's tastes, and create new memories around the dishes that have sustained our family for
            over a century.
          </p>

          <p>From our kitchen to yours—välkommen och smaklig måltid! (Welcome and enjoy your meal!)</p>

          <div className="text-right italic mt-8">— Our Family</div>
        </div>
      </div>

      {/* Family Photo Gallery Section */}
      <div className="max-w-5xl mx-auto mt-16 pt-16 border-t">
        <PhotoGallery />
      </div>
    </div>
  )
}

import Link from "next/link"
import Image from "next/image"

const heading = "font-serif-sc uppercase tracking-[0.22em] text-[12px] text-lingon mb-4"
const link =
  "font-serif italic text-ink-soft hover:text-lingon-deep transition-colors text-[17px] leading-[1.5]"

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule-soft">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <div className="text-center md:text-left">
            <div className={heading}>The Rajnak Family</div>
            <p className="text-ink-soft text-[16px] leading-[1.5] italic">
              Recipe collection · somewhere between Hungary and Sweden.
            </p>
          </div>

          <div className="text-center">
            <div className={heading}>Explore</div>
            <ul className="space-y-2">
              <li>
                <Link href="/recipes" className={link}>
                  All Recipes
                </Link>
              </li>
              <li>
                <Link href="/categories" className={link}>
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className={link}>
                  Search
                </Link>
              </li>
              <li>
                <Link href="/about" className={link}>
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <div className={heading}>Closing Note</div>
            <p className="font-hand text-[26px] text-lingon-deep leading-tight">
              From our kitchen to yours
              <br />
              — smaklig måltid.
            </p>
          </div>
        </div>

        <div className="mt-14 pt-10 border-t border-rule-soft flex flex-col items-center">
          <Image
            src="/images/rajnak-family-logo-new.png"
            alt="The Rajnak family recipe collection"
            width={88}
            height={88}
            className="opacity-90"
          />
          <p className="mt-6 font-serif-sc uppercase tracking-[0.28em] text-[10px] text-ink-muted">
            © {new Date().getFullYear()} · The Rajnak Family Recipe Collection
          </p>
        </div>
      </div>
    </footer>
  )
}

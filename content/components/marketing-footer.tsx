import Link from "next/link";
import { ArrowRight, Utensils } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="cp-footer">
      <div className="cp-footer-main">
        <div className="cp-footer-brand">
          <Link className="cp-brand" href="/" aria-label="ContentPilot home">
            <span className="cp-brand-mark"><Utensils size={19} aria-hidden="true" /></span>
            <span>contentpilot</span>
          </Link>
        </div>

        <nav aria-label="Explore ContentPilot">
          <strong>Explore</strong>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#live-strategy">Example strategy</Link>
          <Link href="/#who-its-for">Who it’s for</Link>
          <Link href="/#pricing">Plans</Link>
          <Link href="/#faq">FAQs</Link>
        </nav>

        <div className="cp-footer-audience">
          <strong>Made for</strong>
          <span>Independent restaurants</span>
          <span>Cafés and bakeries</span>
          <span>Food trucks and delivery kitchens</span>
          <span>Bars and neighborhood food brands</span>
        </div>

        <div className="cp-footer-cta">
          <strong>Start with your restaurant</strong>
          <Link className="cp-text-link" href="/signup">Create an account <ArrowRight size={15} aria-hidden="true" /></Link>
          <Link className="cp-text-link" href="/#pricing">Compare plans <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="cp-footer-bottom">
        <span>© {new Date().getFullYear()} ContentPilot</span>
      </div>
    </footer>
  );
}

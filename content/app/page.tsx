"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown, ArrowRight, Check, ChefHat, ClipboardList,
  FileImage, Flame, Instagram, Lightbulb, Menu, Play, Sparkles,
  Target, Utensils, X,
} from "lucide-react";
import { BENCHMARK_RESTAURANT, BENCHMARK_WEEKLY_PLAN } from "@/lib/constants";

const faqs = [
  ["Who is ContentPilot for?", "Independent restaurants, cafés, bakeries, food trucks, bars, and delivery kitchens that want a clearer plan for their social content."],
  ["Is there a free version?", "Yes. The Free plan is $0 per month. It includes one restaurant workspace, up to 30 assets, basic content analysis and gap insights, and one seven-day plan each week."],
  ["How does ContentPilot work?", "Add your restaurant context, upload photos and videos you already have, and choose a weekly business goal. ContentPilot analyzes the library, identifies gaps, and builds a seven-day plan with Instagram and TikTok recommendations."],
  ["Do I need to create new content first?", "No. Start with the photos and videos already on your phone. If the plan identifies a gap, it can suggest what your team could capture next."],
  ["Does ContentPilot publish automatically?", "No. ContentPilot helps you decide what to post and prepare the plan. You stay in control of publishing to Instagram and TikTok."],
  ["Can I use my existing restaurant photos and videos?", "Yes. The content library accepts restaurant photos and videos, including everyday dish, prep, team, and dining room footage."],
  ["Can it identify missing content?", "Yes. Gap analysis compares the content you have with the goal you chose and highlights underrepresented content pillars."],
  ["Do I need marketing experience?", "No. The plan explains the purpose behind each recommendation in straightforward language."],
  ["Can I edit or regenerate a strategy?", "Yes. You can edit plan details, regenerate a day, replace its asset, and copy or export the plan using the available app tools."],
  ["Which restaurants can use it?", "The product is designed for restaurants and food businesses such as cafés, bakeries, fast-casual spots, bars, and delivery kitchens."],
  ["How is it different from a scheduler?", "A scheduler helps publish content you have chosen. ContentPilot helps decide what to post, why it fits the week's goal, which existing asset to use, and what is missing."],
];

const plans = [
  { name: "Free", price: "$0", note: "For getting started", features: ["1 restaurant workspace", "Up to 30 content assets", "Basic AI content analysis", "Basic content gap insights", "1 weekly seven-day strategy", "Instagram and TikTok recommendations"] },
  { name: "Grow", price: "$5", note: "For a more consistent rhythm", popular: true, features: ["Everything in Free", "Up to 150 content assets", "Full content gap analysis", "Unlimited weekly strategy generation", "Regenerate individual days", "Edit and replace plan recommendations", "Copy and export run-sheets"] },
  { name: "Pro", price: "$10", note: "For a larger content library", features: ["Everything in Grow", "Unlimited content asset storage"] },
];

export default function HomePage() {
  const [selectedDay, setSelectedDay] = React.useState(BENCHMARK_WEEKLY_PLAN[0]?.dayOfWeek || "Monday");
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [demoView, setDemoView] = React.useState<"plan" | "gaps">("plan");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const activePlan = BENCHMARK_WEEKLY_PLAN.find((day) => day.dayOfWeek === selectedDay) || BENCHMARK_WEEKLY_PLAN[0];

  return (
    <div className="cp-site">
      <header className="cp-nav">
        <Link className="cp-brand" href="/" aria-label="ContentPilot home"><span className="cp-brand-mark"><Utensils size={19} /></span><span>contentpilot</span></Link>
        <button className="cp-menu-toggle" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X /> : <Menu />}</button>
        <nav className={`cp-nav-links ${mobileOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
          <Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
          <Link className="cp-button cp-button-small" href="/signup" onClick={() => setMobileOpen(false)}>Start free <ArrowRight size={16} /></Link>
        </nav>
      </header>

      <main>
        <section className="cp-hero">
          <div className="cp-hero-copy">
            <div className="cp-eyebrow"><span className="cp-eyebrow-dot" /> Your restaurant’s content, with a plan</div>
            <h1>Make a better week out of the content <em>you already have.</em></h1>
            <p className="cp-lede">ContentPilot helps restaurants understand their photos and videos, spot content gaps, and plan purposeful Instagram and TikTok posts around a business goal.</p>
            <div className="cp-hero-actions"><Link className="cp-button" href="/signup">Start free <ArrowRight size={17} /></Link><a className="cp-text-link" href="#how-it-works">See how it works <ArrowDown size={15} /></a></div>
            <div className="cp-hero-note"><Check size={15} /> Start with what’s already in your camera roll</div>
          </div>
          <div className="cp-preview-wrap" aria-label="Example weekly restaurant strategy preview">
            <div className="cp-preview-top"><span><span className="cp-live-dot" /> EXAMPLE STRATEGY</span><span>OVIE’S KITCHEN · AKURE</span></div>
            <div className="cp-preview">
              <div className="cp-preview-heading"><div><span className="cp-kicker">THIS WEEK’S FOCUS</span><h2>Bring lunch orders in</h2></div><span className="cp-goal-icon"><Target size={19} /></span></div>
              <div className="cp-demo-tabs" role="group" aria-label="Strategy preview">
                <button aria-pressed={demoView === "plan"} onClick={() => setDemoView("plan")}>The weekly plan</button>
                <button aria-pressed={demoView === "gaps"} onClick={() => setDemoView("gaps")}>Content gaps</button>
              </div>
              {demoView === "plan" ? <>
                <div className="cp-day-strip" aria-label="Choose a sample day">
                  {BENCHMARK_WEEKLY_PLAN.map((day) => <button key={day.id} className={selectedDay === day.dayOfWeek ? "selected" : ""} onClick={() => setSelectedDay(day.dayOfWeek)} aria-pressed={selectedDay === day.dayOfWeek}><span>{day.dayOfWeek.slice(0, 1)}</span></button>)}
                </div>
                {activePlan && <div className="cp-plan-card">
                  <div className="cp-plan-meta"><span>{activePlan.dayOfWeek} · {activePlan.contentPillar.replace(/_/g, " ")}</span><span>{activePlan.recommendedTime}</span></div>
                  <div className="cp-plan-asset"><span className="cp-asset-icon"><FileImage size={18} /></span><span><strong>{activePlan.asset?.fileName || "Kitchen footage"}</strong><small>Existing restaurant content</small></span><span className="cp-used-pill">USE THIS</span></div>
                  <p className="cp-plan-angle">{activePlan.contentAngle}</p>
                  <div className="cp-plan-why"><Lightbulb size={16} /><span><strong>Why it fits</strong>{activePlan.strategicRationale}</span></div>
                  <div className="cp-platform-row"><span><Instagram size={15} /> Instagram</span><span><Play size={14} /> TikTok</span></div>
                </div>}
              </> : <div className="cp-gap-preview"><div className="cp-gap-line"><span className="cp-gap-icon"><Flame size={17} /></span><span><strong>More customer moments</strong><small>Build trust with first-time diners</small></span><span className="cp-gap-tag">UNDERUSED</span></div><p>Your plan can make use of the clips you have and suggest a simple shot to fill this gap.</p><div className="cp-gap-meter"><span style={{ width: "27%" }} /></div><small>Example library balance · 27% of target</small></div>}
              <div className="cp-preview-foot"><Sparkles size={14} /> Example data, separate from your restaurant workspace</div>
            </div>
            <div className="cp-preview-caption"><ChefHat size={16} /> A strategy built for a real restaurant week</div>
          </div>
        </section>

        <section className="cp-problem cp-section" aria-labelledby="problem-heading">
          <div className="cp-section-intro"><span className="cp-kicker">THE EVERYDAY CHALLENGE</span><h2 id="problem-heading">You have the footage.<br /><em>The next post is the hard part.</em></h2><p>Running a restaurant leaves little time to turn a camera roll into a clear marketing plan.</p></div>
          <div className="cp-problem-list"><article><span>01</span><div><h3>A full camera roll, an empty idea list</h3><p>You’ve captured dishes, prep and the dining room. Choosing what to post next still takes time.</p></div></article><article><span>02</span><div><h3>Good posts without a business reason</h3><p>When every post promotes a dish, it’s easy to miss trust, community and awareness.</p></div></article><article><span>03</span><div><h3>The same angle, week after week</h3><p>Without a view of the whole library, content can start to feel repetitive.</p></div></article></div>
        </section>

        <section className="cp-how cp-section" id="how-it-works">
          <div className="cp-section-intro cp-centered"><span className="cp-kicker">A SIMPLE WEEKLY WORKFLOW</span><h2>From camera roll to <em>clear next steps.</em></h2><p>Start with the restaurant and content you already have. ContentPilot connects them to a goal for the week.</p></div>
          <div className="cp-steps">
            <article><span className="cp-step-icon"><Utensils /></span><small>01 · CONTEXT</small><h3>Tell us about your restaurant</h3><p>Share your location, restaurant type, audience and the action you want diners to take.</p></article>
            <article><span className="cp-step-icon"><FileImage /></span><small>02 · CONTENT</small><h3>Add photos and videos</h3><p>Bring in the dishes, kitchen moments and dining room clips already on your phone.</p></article>
            <article><span className="cp-step-icon"><Target /></span><small>03 · GOAL</small><h3>Choose a weekly goal</h3><p>Focus the plan on an outcome like weekday lunch orders or a menu special.</p></article>
            <article><span className="cp-step-icon"><ClipboardList /></span><small>04 · STRATEGY</small><h3>Get your seven-day plan</h3><p>Review content gaps, asset recommendations and distinct Instagram and TikTok directions.</p></article>
          </div>
          <div className="cp-how-foot"><span>Restaurant context</span><i /> <span>Existing content</span><i /> <span>Weekly goal</span><i /> <strong>Useful next steps</strong></div>
        </section>

        <section className="cp-live-run cp-section" id="live-strategy">
          <div className="cp-live-heading">
            <div><span className="cp-kicker">PUBLIC PRODUCT DEMONSTRATION · EXAMPLE DATA</span><h2>Live Strategy Run</h2><p>Ovie’s Kitchen · Akure <span> / </span> Goal: increase weekday lunch orders</p></div>
            <Link className="cp-button cp-button-small" href="/signup">Plan for your restaurant <ArrowRight size={15} /></Link>
          </div>
          <div className="cp-demo-tabs" role="tablist" aria-label="Live strategy example">
            <button id="cp-live-plan-tab" role="tab" aria-controls="cp-live-plan-panel" aria-selected={demoView === "plan"} onClick={() => setDemoView("plan")}>Seven-day plan</button>
            <button id="cp-live-gaps-tab" role="tab" aria-controls="cp-live-gaps-panel" aria-selected={demoView === "gaps"} onClick={() => setDemoView("gaps")}>Content gap audit</button>
          </div>
          {demoView === "plan" ? <div id="cp-live-plan-panel" role="tabpanel" aria-labelledby="cp-live-plan-tab" className="cp-live-plan">
            <nav className="cp-live-days" aria-label="Choose a day in the example strategy">{BENCHMARK_WEEKLY_PLAN.map((day) => <button key={day.id} aria-label={`Show ${day.dayOfWeek} plan`} aria-pressed={selectedDay === day.dayOfWeek} onClick={() => setSelectedDay(day.dayOfWeek)}><span>{day.dayOfWeek.slice(0, 3)}</span><small>{day.contentPillar.replace(/_/g, " ")}</small></button>)}</nav>
            {activePlan && <article className="cp-live-detail">
              <div className="cp-live-context"><div className="cp-plan-meta"><span>{activePlan.dayOfWeek} · {activePlan.contentPillar.replace(/_/g, " ")}</span><span>{activePlan.recommendedTime}</span></div><h3>{activePlan.contentAngle}</h3><div className="cp-live-asset"><FileImage size={18} /><span><strong>{activePlan.asset?.fileName || "Content to capture"}</strong><small>{activePlan.asset?.aiDescription || "Suggested new restaurant footage"}</small></span><span className="cp-used-pill">{activePlan.asset ? "IN LIBRARY" : "TO CREATE"}</span></div><div className="cp-plan-why"><Lightbulb size={16} /><span><strong>Why this fits the goal</strong>{activePlan.strategicRationale}</span></div><div className="cp-live-facts"><span>OBJECTIVE <strong>{activePlan.objective}</strong></span><span>RECOMMENDED TIME <strong>{activePlan.recommendedTime}</strong></span></div></div>
              <div className="cp-live-platforms"><article><div className="cp-live-platform-title"><Instagram size={16} /> Instagram <span>FEED / REELS</span></div><small>OPENING HOOK</small><strong>{activePlan.instagramHook}</strong><small>CAPTION</small><p>{activePlan.instagramCaption}</p><small>CALL TO ACTION</small><p>{activePlan.instagramCta}</p></article><article><div className="cp-live-platform-title"><Play size={15} /> TikTok <span>SHORT VIDEO</span></div><small>ON-SCREEN HOOK</small><strong>{activePlan.tiktokHook}</strong><small>CAPTION</small><p>{activePlan.tiktokCaption}</p><small>CALL TO ACTION</small><p>{activePlan.tiktokCta}</p></article></div>
            </article>}
          </div> : <div id="cp-live-gaps-panel" role="tabpanel" aria-labelledby="cp-live-gaps-tab" className="cp-live-gap-panel"><div className="cp-gap-intro"><span className="cp-gap-icon"><Flame size={19} /></span><div><span className="cp-kicker">EXAMPLE LIBRARY CHECK</span><h3>Build more customer proof into the week.</h3><p>For this sample lunch goal, customer moments are underrepresented. Food close-ups can show what’s on the menu; reactions can help a new diner feel confident about trying it.</p></div></div><div className="cp-gap-stat"><span>14%</span><strong>Customer proof</strong><small>1 of 7 sample assets</small><div className="cp-gap-meter"><span style={{ width: "14%" }} /></div></div><div className="cp-gap-next"><Target size={17} /><span><strong>A useful next step</strong>Capture a short first-bite reaction or a lunch order being handed over. No studio shoot needed.</span></div></div>}
          <div className="cp-preview-foot"><Sparkles size={14} /> Example data is public and separate from every restaurant workspace</div>
        </section>

        <section className="cp-benefits cp-section">
          <div className="cp-section-intro"><span className="cp-kicker">MORE INTENT, LESS GUESSWORK</span><h2>Put your existing content <em>to better use.</em></h2></div>
          <div className="cp-benefit-grid"><article><span>01</span><h3>Know what to post</h3><p>Move from a busy camera roll to a clear plan for the week.</p></article><article><span>02</span><h3>Know why it fits</h3><p>See how each recommendation supports the goal you chose.</p></article><article><span>03</span><h3>Know what’s missing</h3><p>Spot content gaps before they become another week of repetition.</p></article><article><span>04</span><h3>Use each platform well</h3><p>Shape the idea for Instagram and TikTok instead of pasting the same copy everywhere.</p></article></div>
        </section>

        <section className="cp-pricing cp-section" id="pricing">
          <div className="cp-section-intro cp-centered"><span className="cp-kicker">SIMPLE, TRANSPARENT PRICING</span><h2>A small plan for your <em>next good week.</em></h2><p>Start free, then choose the capacity that fits your restaurant.</p></div>
          <div className="cp-price-grid">{plans.map((plan) => <article className={`cp-price-card ${plan.popular ? "is-popular" : ""}`} key={plan.name}>{plan.popular && <span className="cp-popular">MOST POPULAR</span>}<div className="cp-price-head"><div><h3>{plan.name}</h3><p>{plan.note}</p></div><strong>{plan.price}<small>/ month</small></strong></div><Link className={plan.popular ? "cp-button" : "cp-button cp-button-outline"} href="/signup">{plan.name === "Free" ? "Start free" : plan.name === "Grow" ? "Start growing" : "Go Pro"}<ArrowRight size={16} /></Link><ul>{plan.features.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></article>)}</div>
          <p className="cp-pricing-note">Plans are shown for product comparison. Billing and payment processing are not available yet; all plan buttons create a free account.</p>
        </section>

        <section className="cp-faq cp-section" id="faq">
          <div className="cp-faq-intro"><span className="cp-kicker">GOOD TO KNOW</span><h2>Questions from the <em>pass.</em></h2><p>Clear answers about what ContentPilot does and how your team stays in control.</p></div>
          <div className="cp-faq-list">{faqs.map(([question, answer], index) => <article key={question} className={openFaq === index ? "is-open" : ""}><h3><button aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<span>{openFaq === index ? "−" : "+"}</span></button></h3><div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={openFaq !== index}><p>{answer}</p></div></article>)}</div>
        </section>

        <section className="cp-final-cta"><div><span className="cp-kicker">YOUR NEXT WEEK STARTS HERE</span><h2>Make the most of what’s already in your kitchen.</h2><p>Choose a goal, bring your existing photos and videos, and get a plan your team can put to work.</p><div className="cp-hero-actions"><Link className="cp-button cp-button-light" href="/signup">Start free <ArrowRight size={17} /></Link><a className="cp-text-link cp-link-light" href="#how-it-works">See how it works <ArrowDown size={15} /></a></div></div><span className="cp-final-mark"><ChefHat size={52} strokeWidth={1.25} /></span></section>
      </main>

      <footer className="cp-footer"><div className="cp-footer-main"><div className="cp-footer-brand"><Link className="cp-brand" href="/"><span className="cp-brand-mark"><Utensils size={19} /></span><span>contentpilot</span></Link><p>An AI content strategist for restaurants. Know what to post, why it fits and which content you can use.</p></div><div><strong>Explore</strong><a href="#how-it-works">How it works</a><a href="#live-strategy">Example strategy</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div><div><strong>Your workspace</strong><Link href="/app">Home</Link><Link href="/app/content">Content library</Link><Link href="/app/strategy">Strategy</Link><Link href="/app/restaurant">Restaurant profile</Link></div><div className="cp-footer-cta"><strong>Ready to plan?</strong><p>Start with your restaurant and the content you already have.</p><Link className="cp-text-link" href="/signup">Create a free account <ArrowRight size={15} /></Link></div></div><div className="cp-footer-bottom"><span>© {new Date().getFullYear()} ContentPilot</span><span>Made for the people behind the pass.</span></div></footer>
    </div>
  );
}

"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Check, Zap } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TIERS = [
  {
    name: "Personal",
    tier: "ENTRY",
    price: 0,
    features: ["5 Render Credits", "1080p Export", "Personal Use"],
    button: "Select Tier",
    popular: false,
  },
  {
    name: "Professional",
    tier: "RECOMMENDED",
    price: 29,
    features: ["200 Render Credits", "4K Ultra HD Output", "Commercial License", "Priority Queue"],
    button: "Begin Pro",
    popular: true,
  },
  {
    name: "Studio",
    tier: "ENTERPRISE",
    price: 99,
    features: ["Unlimited Credits", "Custom Training", "Multi-Seat Access"],
    button: "Contact Sales",
    popular: false,
  },
];

// Animated counter component — uses DOM ref to avoid setState per frame
const AnimatedPrice = ({ value, inView }: { value: number; inView: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration: 2,
      delay: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = `$${Math.round(obj.val)}`;
      },
    });
    return () => { tween.kill(); };
  }, [inView, value]);

  return <span ref={ref}>${value}</span>;
};

export const Pricing = () => {
  const pricingRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Pricing");
  const [inView, setInView] = useState(false);

  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) return;
    const card = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const rect = card.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotateY: x * 25,
        rotateX: -y * 25,
        scale: 1.05,
        y: -10,
        duration: 0.3,
        ease: "power3.out",
        transformPerspective: 800,
        boxShadow: `0 ${20 + Math.abs(y) * 30}px ${40 + Math.abs(y) * 40}px rgba(234,179,8,${0.1 + Math.abs(x) * 0.15})`,
      });

      const glow = card.querySelector(".pricing-neon-glow") as HTMLElement;
      if (glow) {
        gsap.to(glow, {
          left: clientX - rect.left,
          top: clientY - rect.top,
          opacity: 1,
          scale: 1.5,
          duration: 0.2,
          ease: "power2.out",
        });
      }

      const inner = card.querySelector(".pricing-card-inner") as HTMLElement;
      if (inner) {
        gsap.to(inner, {
          x: x * 10,
          y: y * 10,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      y: 0,
      boxShadow: "0 0 0 rgba(234,179,8,0)",
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });

    const glow = e.currentTarget.querySelector(".pricing-neon-glow") as HTMLElement;
    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: "power2.in",
      });
    }

    const inner = e.currentTarget.querySelector(".pricing-card-inner") as HTMLElement;
    if (inner) {
      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, []);

  // Magnetic button effect
  const handleBtnEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      y: -2,
      duration: 0.3,
      ease: "power3.out",
    });
  }, []);

  const handleBtnLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
  }, []);

  useGSAP(() => {
    // Heading with split animation
    const headingTl = gsap.timeline({
      scrollTrigger: {
        trigger: pricingRef.current,
        start: "top 85%",
        onEnter: () => setInView(true),
      },
    });

    headingTl
      .fromTo(".pricing-heading-title", {
        y: 60,
        opacity: 0,
        rotateX: -15,
        transformPerspective: 800,
      }, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        ease: "power4.out",
      })
      .fromTo(".pricing-heading-desc", {
        y: 20,
        opacity: 0,
        filter: "blur(8px)",
      }, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6");

    // Cards entrance with dramatic stagger
    gsap.fromTo(".pricing-card", {
      y: 100,
      opacity: 0,
      rotateX: 15,
      rotateY: -5,
      transformPerspective: 1000,
    }, {
      scrollTrigger: { trigger: pricingRef.current, start: "top 80%" },
      y: 0,
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      stagger: {
        each: 0.2,
        from: "center",
      },
      duration: 1.6,
      ease: "power4.out",
    });

    // Features slide in with stagger per card
    pricingRef.current?.querySelectorAll(".pricing-card").forEach((card) => {
      const features = card.querySelectorAll(".pricing-feature");
      gsap.fromTo(features, {
        x: -30,
        opacity: 0,
      }, {
        scrollTrigger: { trigger: card, start: "top 70%" },
        x: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.6,
        delay: 0.8,
        ease: "power3.out",
      });

      // Check icon pop
      const checks = card.querySelectorAll(".pricing-check");
      gsap.fromTo(checks, {
        scale: 0,
        rotation: -180,
        opacity: 0,
      }, {
        scrollTrigger: { trigger: card, start: "top 70%" },
        scale: 1,
        rotation: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.6,
        delay: 0.8,
        ease: "back.out(2)",
      });
    });

    // Button entrance
    gsap.fromTo(".pricing-btn", {
      y: 20,
      opacity: 0,
    }, {
      scrollTrigger: { trigger: pricingRef.current, start: "top 60%" },
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out",
    });

    // Popular card glow pulse
    gsap.to(".pricing-popular-glow", {
      opacity: 0.6,
      scale: 1.1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Popular badge shimmer
    gsap.to(".popular-badge-shine", {
      x: "200%",
      duration: 3,
      repeat: -1,
      ease: "none",
    });
  }, { scope: pricingRef });

  return (
    <section ref={pricingRef} id="pricing" aria-labelledby="pricing-heading" className="py-20 md:py-28 lg:py-36 bg-[#050505] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#eab308]/[0.02] blur-[200px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="container px-4 sm:px-6 mx-auto text-center relative z-10">
        <div className="pricing-heading mb-12 md:mb-20">
          <h2 id="pricing-heading" className="pricing-heading-title text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] mb-4 md:mb-5" style={{ perspective: "800px" }}>
            <span className="text-white">Subscription </span>
            <span className="font-display italic text-[#eab308]">Tiers</span>
          </h2>
          <p className="pricing-heading-desc text-slate-500 max-w-xl mx-auto text-xs sm:text-sm font-medium leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto items-stretch">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              aria-label={`${tier.name} plan - $${tier.price} per month`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "pricing-card relative flex flex-col rounded-2xl border transition-all duration-500 overflow-hidden",
                "group",
                tier.popular
                  ? "bg-gradient-to-b from-[#eab308]/[0.06] via-neutral-900/90 to-neutral-900/80 border-[#eab308]/40 shadow-[0_0_60px_rgba(234,179,8,0.08)] z-10 p-6 sm:p-8 md:p-9 md:scale-105"
                  : "bg-neutral-950/80 border-white/[0.04] p-6 sm:p-8 hover:border-white/[0.08]"
              )}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Popular top accent line */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#eab308] to-transparent" />
              )}

              {/* Popular ambient glow */}
              {tier.popular && (
                <div className="pricing-popular-glow absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#eab308]/[0.05] blur-[100px] pointer-events-none" aria-hidden="true" />
              )}

              {/* Most Popular badge */}
              {tier.popular && (
                <span className="absolute top-4 right-4 px-3 py-1 text-[9px] font-black tracking-[0.25em] uppercase bg-[#eab308]/10 text-[#eab308] rounded-full border border-[#eab308]/20 overflow-hidden">
                  <span className="popular-badge-shine absolute inset-0 bg-gradient-to-r from-transparent via-[#eab308]/20 to-transparent -translate-x-full pointer-events-none" />
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </span>
                </span>
              )}

              {/* Neon glow following cursor */}
              <div className="pricing-neon-glow absolute w-[350px] h-[350px] bg-[#eab308]/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />

              <div className="pricing-card-inner relative z-10 text-left">
                {/* Tier label */}
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.3em]",
                  tier.popular ? "text-[#eab308]" : "text-slate-500"
                )}>
                  {tier.tier}
                </span>

                <h3 className="text-white text-xl font-bold mt-2">{tier.name}</h3>

                <div className="flex items-baseline mt-3 sm:mt-4 mb-6 sm:mb-8">
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
                    <AnimatedPrice value={tier.price} inView={inView} />
                  </span>
                  <span className="text-slate-600 ml-2 font-bold text-xs tracking-widest">
                    / {t("month")}
                  </span>
                </div>

                {/* Gradient separator */}
                <div className={cn(
                  "h-px mb-6 sm:mb-8",
                  tier.popular
                    ? "bg-gradient-to-r from-transparent via-[#eab308]/30 to-transparent"
                    : "bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                )} />

                <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <div
                      key={feature}
                      className="pricing-feature flex items-center space-x-3 text-sm font-medium text-slate-400"
                    >
                      <Check className={cn(
                        "pricing-check w-4 h-4 shrink-0",
                        tier.popular ? "text-[#eab308]" : "text-[#eab308]/60"
                      )} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onMouseEnter={handleBtnEnter}
                  onMouseLeave={handleBtnLeave}
                  className={cn(
                    "pricing-btn w-full py-4 rounded-xl text-[12px] transition-all duration-300 cursor-pointer",
                    tier.popular
                      ? "btn-gold shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                      : "btn-ghost"
                  )}
                >
                  <span className="relative z-10">{tier.button}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

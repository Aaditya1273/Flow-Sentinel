"use client";

import { useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Lock,
  Globe,
  Cpu,
  Sparkles,
  Trophy,
  Rocket,
  Play,
  Activity
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Dynamic import for Three.js component
const ParticleField = dynamic(() => import("@/components/immersive/particle-field"), { ssr: false });

import AnimatedText, {
  AnimatedWords,
  AnimatedCounter,
  FadeInSection,
} from "@/components/immersive/animated-text";
import {
  GlowingCard,
  FloatingCard,
  VaultPreviewCard,
  StatsCard
} from "@/components/immersive/cards";
import {
  MagneticButton,
  StaggerContainer,
  CustomCursor,
  ScaleOnScroll
} from "@/components/immersive/smooth-scroll";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const stats = [
    { value: 12.5, suffix: "M", label: "Total Value Locked", prefix: "$" },
    { value: 14.2, suffix: "%", label: "Average Yield (APY)", prefix: "" },
    { value: 0.00, suffix: "%", label: "MEV Exploit Rate", decimals: 2 },
    { value: 100, suffix: "ms", label: "Autonomous Response" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Silent Automation",
      description: "Powered by Flow's native Scheduler (Forte). No off-chain bots, no centralized dependencies.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Biological Security",
      description: "Institutional-grade passkey protection. Pause or resume strategies instantly using FaceID or biometrics.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Yield Optimization",
      description: "AI-driven algorithms continuously rebalance your assets across the most efficient Flow DeFi protocols.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Lock,
      title: "MEV Immunity",
      description: "Proprietary timing jitter and on-chain VRF randomness ensure your transactions are invisible to front-runners.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Non-Custodial",
      description: "Your keys, your vaults. Assets remain in your control with full transparency on-chain.",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Activity,
      title: "Real-Time Tracking",
      description: "Monitor every execution and yield harvest with industrial-grade analytics and visual history.",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-background">
      <CustomCursor />
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-20"
      >
        {/* 3D Particle Background */}
        <Suspense fallback={
          <div className="absolute inset-0 bg-background" />
        }>
          <ParticleField className="absolute inset-0 z-0 opacity-60" intensity="high" />
        </Suspense>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-orb-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 blur-[150px] rounded-full pointer-events-none animate-orb-float" style={{ animationDelay: '-5s' }} />

        <motion.div
          className="container mx-auto px-6 relative z-10"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-white font-black italic tracking-tighter uppercase">Forte Powered Automation</span>
                </span>
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-[10px]">
                  <Shield className="w-2.5 h-2.5 text-secondary" />
                  <span className="text-secondary font-black italic tracking-tighter uppercase">MEV Resistant</span>
                </span>
              </motion.div>

              <div>
                <AnimatedWords
                  className="font-display text-5xl md:text-7xl font-black leading-none tracking-tighter"
                >
                  AUTONOMOUS WEALTH ON FLOW
                </AnimatedWords>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg md:text-xl text-muted-foreground font-medium italic leading-relaxed max-w-xl"
              >
                Institutional-grade yield optimization with
                <span className="text-foreground"> biological security </span>
                and complete MEV immunity.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <MagneticButton>
                  <Link href="/dashboard" className="relative group block">
                    <span className="absolute inset-0 rounded-2xl bg-primary blur-xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
                    <span className="relative btn-primary text-base md:text-lg px-8 py-4 flex items-center gap-3 rounded-2xl bg-primary text-black hover:shadow-[0_0_60px_rgba(0,245,212,0.4)] transition-all duration-300">
                      <Rocket className="w-5 h-5" />
                      <span className="font-black uppercase tracking-tighter italic">Enter Command Center</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </Link>
                </MagneticButton>

                <MagneticButton>
                  <button className="btn-secondary text-sm md:text-base px-8 py-4 flex items-center gap-3 hover:bg-white/5 transition-all rounded-2xl">
                    <Play className="w-4 h-4 fill-white" />
                    <span className="font-black uppercase tracking-tighter italic">Watch Demo</span>
                  </button>
                </MagneticButton>
              </motion.div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-[500px] flex items-center justify-center">
              <FloatingCard delay={0}>
                <VaultPreviewCard
                  vaultId="SENTINEL-X1"
                  strategy="LIQUID STAKING"
                  amount={142500}
                  riskScore="Low Risk"
                  apy="12.5%"
                  className="w-80"
                />
              </FloatingCard>

              <motion.div
                className="absolute -right-8 top-20 glass rounded-2xl p-4 border border-white/10"
                animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-black italic tracking-tighter text-primary">+12.5%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">REAL-TIME YIELD</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -left-12 bottom-32 glass rounded-2xl p-4 border border-white/10"
                animate={{ y: [0, 15, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg font-black italic tracking-tighter text-white">PROTECTED</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">MEV SHIELD ACTIVE</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <ScaleOnScroll>
            <div className="glass rounded-[3rem] p-12 border border-white/10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {stats.map((stat, i) => (
                  <FadeInSection key={i} delay={i * 0.1} direction="up">
                    <div className="text-center group">
                      <p
                        className="text-5xl md:text-7xl font-black italic tracking-tighter mb-2 transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: 'linear-gradient(to bottom, #fff 50%, #94a3b8)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        <AnimatedCounter
                          to={stat.value}
                          suffix={stat.suffix}
                          prefix={stat.prefix || ""}
                          decimals={stat.decimals || 1}
                        />
                      </p>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </ScaleOnScroll>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeInSection>
              <span className="badge-premium mb-4 inline-block font-black italic uppercase tracking-widest">Core Architecture</span>
            </FadeInSection>
            <AnimatedWords className="text-5xl md:text-7xl font-black italic tracking-tighter text-white leading-none mb-6">
              BUILT FOR THE FUTURE OF ONCHAIN WEALTH
            </AnimatedWords>
            <FadeInSection delay={0.2}>
              <p className="text-xl text-muted-foreground font-medium italic">
                We've combined Flow's native infrastructure with advanced automation to create a wealth manager that never sleeps.
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} data-stagger-item>
                <GlowingCard className="h-full rounded-[2rem]">
                  <div className="glass p-10 h-full flex flex-col group hover:border-primary/40 transition-all duration-500 rounded-[inherit]">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                      <feature.icon className="w-8 h-8 text-black" />
                    </div>

                    <h3 className="text-2xl font-black italic tracking-tighter text-white mb-4 uppercase">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground font-medium italic leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </GlowingCard>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <ScaleOnScroll>
            <div className="relative rounded-[4rem] overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent" />
              <div className="absolute inset-0 bg-background/90" />
              <div className="absolute inset-0 bg-grid opacity-30" />

              <div className="relative z-10 py-24 px-12 text-center">
                <FadeInSection>
                  <Sparkles className="w-16 h-16 text-primary mx-auto mb-10 animate-pulse" />
                </FadeInSection>

                <AnimatedWords className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none mb-8 max-w-4xl mx-auto uppercase">
                  READY TO DELEGATE YOUR DEFI?
                </AnimatedWords>

                <FadeInSection delay={0.3}>
                  <p className="text-2xl text-muted-foreground italic font-medium max-w-2xl mx-auto mb-12">
                    Join the waitlist or start creating your first mission-critical vault on Flow.
                  </p>
                </FadeInSection>

                <FadeInSection delay={0.5}>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <MagneticButton>
                      <Link href="/dashboard" className="relative group block">
                        <span className="absolute inset-0 rounded-3xl bg-primary blur-2xl opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center gap-4 px-16 py-8 text-2xl font-black italic tracking-tighter rounded-3xl bg-primary text-black transition-all duration-300">
                          INITIALIZE VAULT
                          <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                        </span>
                      </Link>
                    </MagneticButton>
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground mt-12">
                    NON-CUSTODIAL • PASSKEY SECURED • MEV RESISTANT
                  </p>
                </FadeInSection>
              </div>
            </div>
          </ScaleOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
}
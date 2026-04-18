"use client";

import { useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  Activity,
  Rocket
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BeamsBackground } from "@/components/ui/beams-background";
import { MagneticButton } from "@/components/immersive/smooth-scroll";
import { Check } from "lucide-react";

export default function Home() {


  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 40]);

  const stats = [
    { value: 12.5, suffix: "M", label: "Protocol Equity (TVL)", prefix: "$" },
    { value: 14.2, suffix: "%", label: "Sentinel Optimization (APY)", prefix: "" },
    { value: 0.001, suffix: "%", label: "Exploit Probability", decimals: 3 },
    { value: 85, suffix: "ms", label: "Execution Latency" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Native Scheduling",
      description: "Direct utilization of Flow's Forte protocol for trustless, on-chain execution without external bot dependencies.",
    },
    {
      icon: Shield,
      title: "Biological Guard",
      description: "Institutional-grade biometric passkey encryption for mission-critical vault management and strategy approval.",
    },
    {
      icon: Activity,
      title: "Sentinel Telemetry",
      description: "Real-time, industrial-grade monitoring of global vault performance and automated risk mitigation events.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-primary/30 selection:text-white">
      <Navbar />

      {/* ===== SENTINEL COMMAND HUB (HERO TRANSFORMATION) ===== */}
      <BeamsBackground intensity="medium" className="relative min-h-screen flex flex-col items-center justify-center">
        {/* Structural Hexagonal Grid Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-hex-grid" />
        
        <motion.div
          className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          {/* Authority Headline */}
          <div className="max-w-5xl mb-12">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter uppercase text-white">
              AUTONOMOUS <br />
              <span className="text-primary">DEFI WEALTH</span>
            </h1>
          </div>

          {/* Trust Subtext */}
          <div className="max-w-xl mb-16">
            <p className="font-sans text-xl md:text-2xl text-white/40 font-medium leading-relaxed uppercase tracking-tight">
              Institutional-grade asset management powered by 
              <span className="text-white"> Biological Security </span> 
              and 
              <span className="text-white"> Strategic Autonomy.</span>
            </p>
          </div>

          {/* Core Action */}
          <div className="flex flex-col items-center gap-8">
            <Link href="/dashboard" className="group relative">
              <div className="absolute -inset-4 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <button className="relative flex items-center gap-6 px-12 py-6 rounded-2xl bg-primary text-black font-display font-black text-2xl uppercase tracking-tighter hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                INITIALIZE COMMAND CENTER
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </Link>

            <div className="flex items-center gap-12 pt-8">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-black text-white/30 uppercase tracking-[0.2em] mb-2">Total Managed Capacity</span>
                <span className="text-xl font-mono font-black text-white">$12.5M+</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-black text-white/30 uppercase tracking-[0.2em] mb-2">Network Security Score</span>
                <span className="text-xl font-mono font-black text-primary">A++</span>
              </div>
            </div>
          </div>
        </motion.div>
      </BeamsBackground>



      {/* ===== INSTITUTIONAL DATA (STATS) ===== */}
      <section className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white/30">
                  {stat.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-mono font-black text-white tracking-tighter">
                    {stat.prefix}{stat.value}{stat.suffix}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MISSION PROTOCOLS (FEATURES) ===== */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-end mb-24">
            <div className="lg:col-span-8">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-primary mb-6 block">Capabilities</span>
              <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none">
                ENGINEERED FOR <br />
                <span className="opacity-40">PROTOCOL DOMINANCE</span>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-1 grid-flow-row border border-white/5 bg-white/5 rounded-3xl overflow-hidden">
            {features.map((feature, i) => (
              <div key={i} className="group relative bg-[#050505] p-12 flex flex-col justify-between aspect-square transition-all duration-300 hover:bg-white/[0.03]">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-12 border border-white/10 group-hover:border-primary/50 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 font-medium leading-relaxed group-hover:text-white/60 transition-colors">
                    {feature.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-8 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Protocol Active</span>
                  <div className="w-4 h-px bg-primary/30" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== SECURITY PROTOCOL MATRIX (NEW SECTION 1) ===== */}
      <section className="py-40 relative border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-primary mb-6 block">Security Layer</span>
              <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter leading-[0.9] mb-12">
                HARDWARE-LEVEL <br />
                <span className="opacity-40">TRUST ARCHITECTURE</span>
              </h2>
              
              <div className="space-y-12">
                {[
                  {
                    title: "Biological Handshake",
                    desc: "Leveraging Flow's native secp256r1 curve support for direct hardware-to-chain passkey authentication. No seed phrases, zero-latency biometric signing."
                  },
                  {
                    title: "Automated Circuit Breaker",
                    desc: "Real-time volatility monitoring. If abnormal slippage or protocol instability is detected, the 'Guard' triggers an instant, trustless strategy pause."
                  },
                  {
                    title: "Multi-Sig Guardian Layer",
                    desc: "Large capital movements require a secondary cryptographic consensus from the Sentinel network, preventing single-point-of-failure exploits."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="text-primary font-mono text-xs font-black pt-1">0{i + 1}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-display font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-white/40 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-auto h-full min-h-[500px] rounded-3xl border border-white/5 bg-[#050505] overflow-hidden group">
              {/* Visual Architectural Diagram Mockup */}
              <div className="absolute inset-0 bg-hex-grid opacity-[0.05]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-72 h-72 border border-primary/20 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 border border-primary/10 rounded-full animate-ping [animation-duration:4s]" />
                  <div className="w-48 h-48 border border-primary/40 rounded-full flex items-center justify-center bg-primary/5">
                    <Shield className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-12 left-12 right-12 p-8 glass-dark border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-black text-white/30 uppercase tracking-widest">Sentinel Protection Status</span>
                  <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest">Active</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[94%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===== STRATEGY ENGINE TIER (NEW SECTION 2) ===== */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mb-24">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-primary mb-6 block">Infrastructure Layer</span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter leading-[0.9]">
              AUTONOMOUS <br />
              <span className="opacity-40">REBALANCING LOGIC</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1">
            {[
              {
                title: "Yield Harvesting",
                desc: "Automated claiming and compounding of rewards across Flow's premier liquidity pools, ensuring zero yield leakage."
              },
              {
                title: "Liquidity Routing",
                desc: "Dynamic shifting of assets to protocols with the highest risk-adjusted returns, optimized for the Flow network topology."
              },
              {
                title: "Jitter Control",
                desc: "Proprietary timing algorithms that execute trades with sub-second precision to minimize slippage and MEV exposure."
              }
            ].map((strategy, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-12 hover:bg-white/[0.04] transition-all duration-300">
                <div className="text-primary font-mono text-[10px] font-black uppercase tracking-widest mb-12">Logic Module 0x0{i + 1}</div>
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-4">{strategy.title}</h3>
                <p className="text-white/40 font-medium leading-relaxed">{strategy.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXECUTION TELEMETRY (NEW SECTION 3) ===== */}
      <section className="py-40 relative bg-white/[0.01] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-24">
            <div className="lg:col-span-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-primary mb-6 block">Live Telemetry</span>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none mb-8">
                MISSION <br />
                <span className="opacity-40">PROTOCOL LOG</span>
              </h2>
              <p className="text-white/40 font-medium leading-relaxed uppercase tracking-tight">
                Real-time monitoring of global sentinel nodes and automated rebalancing events across the Flow network.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-[#050505] rounded-2xl border border-white/10 p-8 font-mono text-[11px] leading-relaxed overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                <div className="space-y-2">
                  {[
                    { node: "SENTINEL-X1", event: "STRATEGY_INITIATED", status: "SUCCESS", time: "14:22:01" },
                    { node: "SENTINEL-X1", event: "LIQUIDITY_REBALANCED", status: "SUCCESS", time: "14:22:15" },
                    { node: "SENTINEL-G4", event: "YIELD_HARVEST_COMPLETE", status: "SUCCESS", time: "14:23:45" },
                    { node: "SENTINEL-X1", event: "MEV_SHIELD_TRIGGERED", status: "PENDING", time: "14:25:10" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-6 py-1 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <span className="text-white/20">[{log.time}]</span>
                      <span className="text-primary font-bold">{log.node}</span>
                      <span className="text-white/60">{log.event}</span>
                      <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-black ${log.status === "SUCCESS" ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"}`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                  <div className="pt-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-white/20">AWAITING SYSTEM_INTERRUPT...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMAND HUB (WORLD-CLASS CTA) ===== */}
      <section className="py-60 relative border-t border-white/5 bg-white/[0.01] overflow-hidden">
        {/* Dynamic Spotlight Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none liquid-glow" />
        
        <div className="container mx-auto px-10 text-center relative z-10">
          <div className="max-w-8xl mx-auto">
            <h2 className="text-7xl md:text-9xl font-display font-black text-white uppercase tracking-tighter leading-none mb-16 relative inline-block">
              DELEGATE <br />
              <span className="text-primary opacity-90 relative">
                PROTOCOL CONTROL
                <span className="absolute inset-0 animate-text-sweep opacity-50" />
              </span>
            </h2>
            
            <p className="text-xl md:text-3xl text-white/30 font-display font-black leading-relaxed uppercase tracking-tighter mb-20 max-w-3xl mx-auto">
              Ready to initialize your first mission-critical vault on Flow? <br />
              <span className="text-white">Join the institutional automated layer.</span>
            </p>

            <div className="flex flex-col items-center gap-12">
              <MagneticButton strength={0.4} className="relative group">
                {/* Magnetic Light Pull */}
                <div className="absolute -inset-8 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                
                <Link href="/dashboard" className="relative block">
                  <button className="relative flex items-center gap-8 px-20 py-10 rounded-3xl bg-primary text-black font-display font-black text-3xl uppercase tracking-tighter hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 shadow-[0_0_50px_rgba(0,245,212,0.3)] group-hover:shadow-[0_0_80px_rgba(0,245,212,0.5)]">
                    INITIALIZE PROTOCOL
                    <ArrowRight className="w-10 h-10 group-hover:translate-x-4 transition-transform duration-500" />
                  </button>
                </Link>
              </MagneticButton>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-white/5 w-full max-w-4xl">
                {[
                  { label: "Ownership", trait: "Non-Custodial", icon: Shield },
                  { label: "Encryption", trait: "Passkey Secure", icon: Zap },
                  { label: "Resistance", trait: "MEV Shielded", icon: Activity }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                      <item.icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white/20 block mb-1">{item.label}</span>
                      <span className="text-xs font-mono font-black uppercase tracking-[0.1em] text-white">{item.trait}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />

    </div>
  );
}
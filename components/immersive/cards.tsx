"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Card3DProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
    intensity?: number;
}

export function Card3D({
    children,
    className = "",
    glowColor = "rgba(0, 245, 212, 0.3)",
    intensity = 20
}: Card3DProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className={`relative ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -5 }} // Simple lift effect
            transition={{ duration: 0.2 }}
        >
            <div className="relative w-full h-full">
                {/* Glow Effect */}
                <motion.div
                    className="absolute -inset-[1px] rounded-[inherit] opacity-0 blur-md transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: glowColor,
                        opacity: isHovered ? 0.6 : 0,
                    }}
                />

                {/* Card Content */}
                <div className="relative z-20 h-full pointer-events-auto bg-[var(--flow-bg-secondary)] rounded-[inherit]">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}

// Glowing Border Card
interface GlowingCardProps {
    children: React.ReactNode;
    className?: string;
    gradient?: string;
}

export function GlowingCard({
    children,
    className = "",
    gradient = "linear-gradient(135deg, #00f5d4, #7c3aed, #ec4899)",
}: GlowingCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`relative group ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated Border */}
            <motion.div
                className="absolute -inset-[1px] rounded-[inherit] z-0"
                style={{
                    background: gradient,
                    backgroundSize: "200% 200%",
                }}
                animate={{
                    backgroundPosition: isHovered
                        ? ["0% 50%", "100% 50%", "0% 50%"]
                        : "0% 50%",
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Card Background */}
            <div className="relative z-10 bg-[var(--flow-bg-secondary)] rounded-[inherit] h-full">
                {children}
            </div>
        </div>
    );
}

// Hover Reveal Card
interface HoverRevealCardProps {
    children: React.ReactNode;
    revealContent: React.ReactNode;
    className?: string;
}

export function HoverRevealCard({ children, revealContent, className = "" }: HoverRevealCardProps) {
    return (
        <div className={`relative overflow-hidden group ${className}`}>
            {/* Default Content */}
            <div className="transition-transform duration-500 group-hover:-translate-y-full">
                {children}
            </div>

            {/* Reveal Content */}
            <div className="absolute inset-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
                {revealContent}
            </div>
        </div>
    );
}

// Floating Card with Physics
interface FloatingCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function FloatingCard({ children, className = "", delay = 0 }: FloatingCardProps) {
    return (
        <motion.div
            className={className}
            initial={{ y: 0 }}
            animate={{
                y: [-10, 10, -10],
                rotate: [-1, 1, -1],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
        >
            {children}
        </motion.div>
    );
}

// Morphing Card Background
interface MorphingCardProps {
    children: React.ReactNode;
    className?: string;
}

export function MorphingCard({ children, className = "" }: MorphingCardProps) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Morphing Background Blobs */}
            <motion.div
                className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-[var(--flow-cyan)] opacity-20 blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-[var(--flow-purple)] opacity-20 blur-3xl"
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1.2, 1, 1.2],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

// Vault Preview Card (Adapted from helper-ui)
interface VaultPreviewProps {
    vaultId: string;
    strategy: string;
    amount: number;
    riskScore: string;
    apy: string;
    className?: string;
}

export function VaultPreviewCard({
    vaultId,
    strategy,
    amount,
    riskScore,
    apy,
    className = "",
}: VaultPreviewProps) {
    return (
        <Card3D className={className} glowColor="rgba(0, 245, 212, 0.2)">
            <div className="glass rounded-2xl p-6 border border-white/10 h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--flow-cyan)] to-[var(--flow-purple)] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--flow-text-secondary)]">Sentinel</p>
                            <p className="font-semibold text-white">{vaultId}</p>
                        </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${riskScore.startsWith("Low") || riskScore === "A+"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}>
                        {riskScore}
                    </div>
                </div>

                {/* Amount */}
                <div className="mb-6">
                    <p className="text-xs text-[var(--flow-text-muted)] uppercase tracking-wider mb-1">Managed Assets</p>
                    <p className="text-3xl font-bold text-gradient">{amount.toLocaleString()} FLOW</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-xs text-[var(--flow-text-muted)] uppercase tracking-wider mb-1">Strategy</p>
                        <p className="text-sm font-medium text-white">{strategy}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--flow-text-muted)] uppercase tracking-wider mb-1">Est. APY</p>
                        <p className="text-sm font-bold text-[var(--flow-cyan)]">{apy}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[var(--flow-cyan)] to-[var(--flow-purple)]"
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                </div>
                <p className="text-xs text-[var(--flow-text-muted)] mt-2">Active Sentinel Nodes: 85%</p>
            </div>
        </Card3D>
    );
}

// Stats Card
interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; positive: boolean };
    className?: string;
}

export function StatsCard({ label, value, icon, trend, className = "" }: StatsCardProps) {
    return (
        <motion.div
            className={`glass rounded-2xl p-6 border border-white/10 ${className}`}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--flow-cyan)]/20 to-[var(--flow-purple)]/20 flex items-center justify-center text-[var(--flow-cyan)]">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? "text-green-400" : "text-red-400"
                        }`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={trend.positive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                            />
                        </svg>
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            <p className="text-sm text-[var(--flow-text-muted)] mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </motion.div>
    );
}

"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
    children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis for smooth scrolling
        lenisRef.current = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        // Connect Lenis to GSAP ScrollTrigger
        lenisRef.current.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenisRef.current?.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenisRef.current?.destroy();
            gsap.ticker.remove((time) => {
                lenisRef.current?.raf(time * 1000);
            });
        };
    }, []);

    return <>{children}</>;
}

// Custom Cursor Component
export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorDotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return;

        const cursor = cursorRef.current;
        const cursorDot = cursorDotRef.current;
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animate = () => {
            // Smooth following with lerp
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;

            cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
            cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

            requestAnimationFrame(animate);
        };

        const handleMouseEnter = () => {
            cursor.style.opacity = "1";
            cursorDot.style.opacity = "1";
        };

        const handleMouseLeave = () => {
            cursor.style.opacity = "0";
            cursorDot.style.opacity = "0";
        };

        const handleLinkHover = () => {
            cursor.classList.add("cursor-hover");
        };

        const handleLinkLeave = () => {
            cursor.classList.remove("cursor-hover");
        };

        // Add event listeners
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseenter", handleMouseEnter);
        document.addEventListener("mouseleave", handleMouseLeave);

        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll("a, button, [role='button']");
        interactiveElements.forEach((el) => {
            el.addEventListener("mouseenter", handleLinkHover);
            el.addEventListener("mouseleave", handleLinkLeave);
        });

        animate();

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.removeEventListener("mouseleave", handleMouseLeave);
            interactiveElements.forEach((el) => {
                el.removeEventListener("mouseenter", handleLinkHover);
                el.removeEventListener("mouseleave", handleLinkLeave);
            });
        };
    }, []);

    return (
        <>
            <style jsx global>{`
                @media (pointer: fine) {
                    * {
                        cursor: none !important;
                    }
                }
                
                .custom-cursor {
                    width: 40px;
                    height: 40px;
                    border: 1px solid rgba(0, 245, 212, 0.5);
                    border-radius: 50%;
                    position: fixed;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    z-index: 9999;
                    transition: width 0.3s, height 0.3s, border-color 0.3s, background-color 0.3s;
                    mix-blend-mode: difference;
                }
                
                .custom-cursor.cursor-hover {
                    width: 60px;
                    height: 60px;
                    border-color: #00f5d4;
                    background-color: rgba(0, 245, 212, 0.1);
                }
                
                .cursor-dot {
                    width: 8px;
                    height: 8px;
                    background: #00f5d4;
                    border-radius: 50%;
                    position: fixed;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    z-index: 10000;
                }
                
                @media (pointer: coarse) {
                    .custom-cursor,
                    .cursor-dot {
                        display: none !important;
                    }
                }
            `}</style>
            <div ref={cursorRef} className="custom-cursor opacity-0" />
            <div ref={cursorDotRef} className="cursor-dot opacity-0" />
        </>
    );
}

// Magnetic Button Component
interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export function MagneticButton({ children, className = "", strength = 0.3 }: MagneticButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!buttonRef.current) return;

        const button = buttonRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * strength,
                y: y * strength,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
            });
        };

        button.addEventListener("mousemove", handleMouseMove);
        button.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength]);

    return (
        <div ref={buttonRef} className={`inline-block ${className}`}>
            {children}
        </div>
    );
}

// Reveal on Scroll Component
interface RevealOnScrollProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

export function RevealOnScroll({
    children,
    className = "",
    delay = 0,
    duration = 1,
}: RevealOnScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                container.querySelector(".reveal-content"),
                {
                    yPercent: 100,
                },
                {
                    yPercent: 0,
                    duration,
                    ease: "power4.out",
                    delay,
                    scrollTrigger: {
                        trigger: container,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, container);

        return () => ctx.revert();
    }, [delay, duration]);

    return (
        <div ref={containerRef} className={`overflow-hidden ${className}`}>
            <div className="reveal-content">{children}</div>
        </div>
    );
}

// Stagger Container Component
interface StaggerContainerProps {
    children: React.ReactNode;
    className?: string;
    stagger?: number;
    delay?: number;
}

export function StaggerContainer({
    children,
    className = "",
    stagger = 0.1,
    delay = 0,
}: StaggerContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const items = container.querySelectorAll("[data-stagger-item]");

        const ctx = gsap.context(() => {
            gsap.fromTo(
                items,
                {
                    opacity: 0,
                    y: 40,
                },
                {
                    opacity: 1,
                    y: 0,
                    stagger,
                    duration: 0.8,
                    ease: "power3.out",
                    delay,
                    scrollTrigger: {
                        trigger: container,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, container);

        return () => ctx.revert();
    }, [stagger, delay]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}

// Scale on Scroll Component
interface ScaleOnScrollProps {
    children: React.ReactNode;
    className?: string;
    scaleFrom?: number;
    scaleTo?: number;
}

export function ScaleOnScroll({
    children,
    className = "",
    scaleFrom = 0.8,
    scaleTo = 1,
}: ScaleOnScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                container,
                {
                    scale: scaleFrom,
                    opacity: 0,
                },
                {
                    scale: scaleTo,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: container,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, container);

        return () => ctx.revert();
    }, [scaleFrom, scaleTo]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}

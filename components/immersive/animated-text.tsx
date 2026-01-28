"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface AnimatedTextProps {
    children: string;
    className?: string;
    delay?: number;
    stagger?: number;
    animation?: "fadeUp" | "reveal" | "split" | "typewriter";
    once?: boolean;
    threshold?: number;
}

export default function AnimatedText({
    children,
    className = "",
    delay = 0,
    stagger = 0.03,
    animation = "fadeUp",
    once = true,
    threshold = 0.5,
}: AnimatedTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!containerRef.current || !textRef.current) return;

        const container = containerRef.current;
        const text = textRef.current;
        let ctx: gsap.Context;

        if (animation === "split" || animation === "typewriter") {
            // Split text into characters
            const chars = children.split("");
            text.innerHTML = chars
                .map((char) =>
                    char === " "
                        ? '<span class="inline-block">&nbsp;</span>'
                        : `<span class="inline-block opacity-0">${char}</span>`
                )
                .join("");

            const charElements = text.querySelectorAll("span");

            ctx = gsap.context(() => {
                gsap.fromTo(
                    charElements,
                    {
                        opacity: 0,
                        y: animation === "typewriter" ? 0 : 50,
                        rotateX: animation === "typewriter" ? 0 : -90,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        stagger: animation === "typewriter" ? 0.02 : stagger,
                        duration: animation === "typewriter" ? 0.1 : 0.6,
                        ease: "power3.out",
                        delay,
                        scrollTrigger: {
                            trigger: container,
                            start: `top ${threshold * 100}%`,
                            toggleActions: once ? "play none none none" : "play reverse play reverse",
                        },
                    }
                );
            }, container);
        } else if (animation === "reveal") {
            // Mask reveal animation
            ctx = gsap.context(() => {
                gsap.fromTo(
                    text,
                    {
                        clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
                    },
                    {
                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                        duration: 1.2,
                        ease: "power4.inOut",
                        delay,
                        scrollTrigger: {
                            trigger: container,
                            start: `top ${threshold * 100}%`,
                            toggleActions: once ? "play none none none" : "play reverse play reverse",
                        },
                    }
                );
            }, container);
        } else {
            // Default fadeUp
            ctx = gsap.context(() => {
                gsap.fromTo(
                    text,
                    {
                        opacity: 0,
                        y: 60,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        delay,
                        scrollTrigger: {
                            trigger: container,
                            start: `top ${threshold * 100}%`,
                            toggleActions: once ? "play none none none" : "play reverse play reverse",
                        },
                    }
                );
            }, container);
        }

        return () => ctx.revert();
    }, [children, animation, delay, stagger, once, threshold]);

    return (
        <div ref={containerRef} className={`overflow-hidden ${className}`}>
            <span ref={textRef} className="inline-block" style={{ perspective: 1000 }}>
                {children}
            </span>
        </div>
    );
}

// Split Words Component
interface AnimatedWordsProps {
    children: string;
    className?: string;
    delay?: number;
    stagger?: number;
}

export function AnimatedWords({
    children,
    className = "",
    delay = 0,
    stagger = 0.08,
}: AnimatedWordsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const words = container.querySelectorAll(".word");

        const ctx = gsap.context(() => {
            gsap.fromTo(
                words,
                {
                    opacity: 0,
                    y: 100,
                    rotateX: -80,
                },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    stagger,
                    duration: 0.8,
                    ease: "power3.out",
                    delay,
                    scrollTrigger: {
                        trigger: container,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, container);

        return () => ctx.revert();
    }, [children, delay, stagger]);

    const words = children.split(" ");

    return (
        <div ref={containerRef} className={`overflow-hidden ${className}`} style={{ perspective: 1000 }}>
            {words.map((word, i) => (
                <span key={i} className="word inline-block mr-[0.25em]" style={{ transformStyle: "preserve-3d" }}>
                    {word}
                </span>
            ))}
        </div>
    );
}

// Animated Counter Component
interface AnimatedCounterProps {
    from?: number;
    to: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
    decimals?: number;
}

export function AnimatedCounter({
    from = 0,
    to,
    duration = 2,
    suffix = "",
    prefix = "",
    className = "",
    decimals = 0,
}: AnimatedCounterProps) {
    const counterRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!counterRef.current) return;

        const element = counterRef.current;
        const obj = { value: from };

        const ctx = gsap.context(() => {
            gsap.to(obj, {
                value: to,
                duration,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                onUpdate: () => {
                    element.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
                },
            });
        }, element);

        return () => ctx.revert();
    }, [from, to, duration, suffix, prefix, decimals]);

    return (
        <span ref={counterRef} className={className}>
            {prefix}{from.toFixed(decimals)}{suffix}
        </span>
    );
}

// Animated Line Component (for decorative purposes)
interface AnimatedLineProps {
    className?: string;
    direction?: "horizontal" | "vertical";
    delay?: number;
}

export function AnimatedLine({
    className = "",
    direction = "horizontal",
    delay = 0,
}: AnimatedLineProps) {
    const lineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!lineRef.current) return;

        const line = lineRef.current;
        const isHorizontal = direction === "horizontal";

        const ctx = gsap.context(() => {
            gsap.fromTo(
                line,
                {
                    scaleX: isHorizontal ? 0 : 1,
                    scaleY: isHorizontal ? 1 : 0,
                },
                {
                    scaleX: 1,
                    scaleY: 1,
                    duration: 1.2,
                    ease: "power3.inOut",
                    delay,
                    scrollTrigger: {
                        trigger: line,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, line);

        return () => ctx.revert();
    }, [direction, delay]);

    return (
        <div
            ref={lineRef}
            className={`${direction === "horizontal" ? "h-px w-full" : "w-px h-full"} origin-left bg-gradient-to-r from-[var(--flow-cyan)] to-[var(--flow-purple)] ${className}`}
        />
    );
}

// Parallax Container
interface ParallaxProps {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}

export function Parallax({ children, speed = 0.5, className = "" }: ParallaxProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        const ctx = gsap.context(() => {
            gsap.to(element, {
                yPercent: speed * -100,
                ease: "none",
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }, element);

        return () => ctx.revert();
    }, [speed]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
}

// Fade In Section
interface FadeInSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeInSection({
    children,
    className = "",
    delay = 0,
    direction = "up",
}: FadeInSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const section = sectionRef.current;

        const getInitialPosition = () => {
            switch (direction) {
                case "up": return { y: 60, x: 0 };
                case "down": return { y: -60, x: 0 };
                case "left": return { y: 0, x: 60 };
                case "right": return { y: 0, x: -60 };
                default: return { y: 0, x: 0 };
            }
        };

        const { x, y } = getInitialPosition();

        const ctx = gsap.context(() => {
            gsap.fromTo(
                section,
                {
                    opacity: 0,
                    x,
                    y,
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    delay,
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, section);

        return () => ctx.revert();
    }, [delay, direction]);

    return (
        <div ref={sectionRef} className={className}>
            {children}
        </div>
    );
}

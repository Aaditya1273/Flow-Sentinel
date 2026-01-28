"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Generate random points in a sphere
function generateSpherePoints(count: number, radius: number) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.cbrt(Math.random());

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
}

function ParticleSystem({ count = 3000, color = "#00f5d4" }: { count?: number; color?: string }) {
    const ref = useRef<THREE.Points>(null!);
    const { mouse, viewport } = useThree();

    // Generate particle positions
    const positions = useMemo(() => generateSpherePoints(count, 5), [count]);

    // Store initial positions for wave effect
    const initialPositions = useMemo(() => new Float32Array(positions), [positions]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        if (ref.current) {
            // Slow rotation
            ref.current.rotation.x = time * 0.05;
            ref.current.rotation.y = time * 0.08;

            // Mouse interaction
            const mouseX = (mouse.x * viewport.width) / 2;
            const mouseY = (mouse.y * viewport.height) / 2;

            ref.current.rotation.x += mouseY * 0.001;
            ref.current.rotation.y += mouseX * 0.001;

            // Wave effect on particles
            const positionArray = ref.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const x = initialPositions[i3];
                const y = initialPositions[i3 + 1];
                const z = initialPositions[i3 + 2];

                const wave = Math.sin(time * 0.5 + x * 0.5 + y * 0.5) * 0.1;

                positionArray[i3 + 2] = z + wave;
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color={color}
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function SecondaryParticles({ count = 1500, color = "#7c3aed" }: { count?: number; color?: string }) {
    const ref = useRef<THREE.Points>(null!);

    const positions = useMemo(() => generateSpherePoints(count, 7), [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (ref.current) {
            ref.current.rotation.x = -time * 0.03;
            ref.current.rotation.y = time * 0.05;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color={color}
                size={0.015}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.6}
            />
        </Points>
    );
}

// Connection lines between nearby particles
function ConnectionLines({ count = 100 }: { count?: number }) {
    const ref = useRef<THREE.LineSegments>(null!);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 6);

        for (let i = 0; i < count; i++) {
            const i6 = i * 6;
            const radius = 4;

            // Start point
            positions[i6] = (Math.random() - 0.5) * radius * 2;
            positions[i6 + 1] = (Math.random() - 0.5) * radius * 2;
            positions[i6 + 2] = (Math.random() - 0.5) * radius * 2;

            // End point (nearby)
            positions[i6 + 3] = positions[i6] + (Math.random() - 0.5) * 0.5;
            positions[i6 + 4] = positions[i6 + 1] + (Math.random() - 0.5) * 0.5;
            positions[i6 + 5] = positions[i6 + 2] + (Math.random() - 0.5) * 0.5;
        }

        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (ref.current) {
            ref.current.rotation.x = time * 0.02;
            ref.current.rotation.y = time * 0.03;
        }
    });

    return (
        <lineSegments ref={ref} geometry={geometry}>
            <lineBasicMaterial color="#00f5d4" transparent opacity={0.15} />
        </lineSegments>
    );
}

function FloatingOrb({ position, color, size = 0.5 }: { position: [number, number, number]; color: string; size?: number }) {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (ref.current) {
            ref.current.position.y = position[1] + Math.sin(time * 0.5) * 0.5;
            ref.current.position.x = position[0] + Math.cos(time * 0.3) * 0.3;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
            />
        </mesh>
    );
}

interface ParticleFieldProps {
    className?: string;
    intensity?: "low" | "medium" | "high";
}

export default function ParticleField({ className = "", intensity = "medium" }: ParticleFieldProps) {
    const particleCount = intensity === "low" ? 1000 : intensity === "high" ? 5000 : 3000;

    return (
        <div className={`canvas-container ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
            >
                {/* Ambient light for subtle illumination */}
                <ambientLight intensity={0.5} />

                {/* Main particle system */}
                <ParticleSystem count={particleCount} color="#00f5d4" />

                {/* Secondary particle layer */}
                <SecondaryParticles count={Math.floor(particleCount / 2)} color="#7c3aed" />

                {/* Connection lines */}
                <ConnectionLines count={50} />

                {/* Floating orbs */}
                <FloatingOrb position={[-3, 2, -2]} color="#00f5d4" size={0.4} />
                <FloatingOrb position={[3, -1, -3]} color="#7c3aed" size={0.3} />
                <FloatingOrb position={[0, 3, -4]} color="#ec4899" size={0.25} />
            </Canvas>
        </div>
    );
}

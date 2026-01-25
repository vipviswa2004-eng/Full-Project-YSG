
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const GalaxyCursor: React.FC = () => {
    // Mouse position state
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // --- SNAPPY RESPONSIVE PHYSICS ---
    const springConfig = { damping: 25, stiffness: 700 }; // Fast, snappy movement
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    // Trail particles - now with Velocity
    const [trail, setTrail] = useState<{ x: number; y: number; id: number; type: string; size: number; vx: number; vy: number }[]>([]);
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // EMOJI PARTICLES THEME (Sparkle Only)
    const PARTICLES = ['✨'];

    useEffect(() => {
        // Detect touch device
        const checkTouch = () => {
            setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };
        checkTouch();

        let lastX = 0;
        let lastY = 0;

        const moveCursor = (clientX: number, clientY: number) => {
            cursorX.set(clientX);
            cursorY.set(clientY);

            // Calculate velocity
            const dx = clientX - lastX;
            const dy = clientY - lastY;
            lastX = clientX;
            lastY = clientY;

            // MODERATED SPARKLES (Max 1-2 per move)
            if (Math.random() > 0.6) { // Reduced frequency for a cleaner look
                const count = Math.random() > 0.8 ? 2 : 1; // Max 1 or 2 sparkles
                const newParticles = Array.from({ length: count }).map(() => ({
                    x: clientX,
                    y: clientY,
                    id: Date.now() + Math.random(),
                    type: PARTICLES[0],
                    size: Math.random() * 1.2 + 0.8, // Slightly smaller
                    vx: (dx * 0.05) + (Math.random() * 4 - 2),
                    vy: (dy * 0.05) + (Math.random() * 4 - 2)
                }));

                setTrail((prev) => [...prev.slice(-20), ...newParticles]);
            }

            // Move Ripple
            if (Math.abs(dx) + Math.abs(dy) > 150) {
                addRipple(clientX, clientY);
            }
        };

        const handleMouseMove = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            moveCursor(touch.clientX, touch.clientY);
        };

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            moveCursor(touch.clientX, touch.clientY);
            addRipple(touch.clientX, touch.clientY);
        };

        const addRipple = (x: number, y: number) => {
            setRipples(prev => [...prev.slice(-5), { x, y, id: Date.now() + Math.random() }]);
        };

        const handleClick = (e: MouseEvent) => {
            addRipple(e.clientX, e.clientY);
            const burst = Array.from({ length: 12 }).map(() => ({
                x: e.clientX,
                y: e.clientY,
                id: Date.now() + Math.random(),
                type: '✨',
                size: 2.5,
                vx: Math.random() * 30 - 15,
                vy: Math.random() * 30 - 15
            }));
            setTrail(prev => [...prev, ...burst]);
        };


        if (!isTouchDevice) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mousedown', handleClick);
        } else {
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchstart', handleTouchStart);
        }

        const interval = setInterval(() => {
            setTrail((prev) => prev.filter((dot) => Date.now() - dot.id < 800)); // Fast fade out
            setRipples((prev) => prev.filter((r) => Date.now() - r.id < 600)); // Fast ripples
        }, 50);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleClick);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchStart);
            clearInterval(interval);
        };
    }, [cursorX, cursorY, isTouchDevice]);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
            {/* 1. THE GLOW */}
            {!isTouchDevice && (
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full opacity-[0.15] z-0 blur-[100px]"
                    style={{
                        translateX: cursorXSpring,
                        translateY: cursorYSpring,
                        x: "-50%",
                        y: "-50%",
                        background: 'radial-gradient(circle, rgba(236,72,153,0.8) 0%, rgba(139,92,246,0.3) 50%, transparent 70%)'
                    }}
                />
            )}

            {/* 2. MAIN CURSOR */}
            {!isTouchDevice && (
                <>
                    <motion.div
                        className="absolute w-10 h-10 bg-white rounded-full shadow-[0_0_40px_rgba(236,72,153,1)] z-50 mix-blend-screen border-2 border-white"
                        style={{
                            translateX: cursorXSpring,
                            translateY: cursorYSpring,
                            x: "-50%",
                            y: "-50%"
                        }}
                    />

                    {/* Fast Orbiting Ring */}
                    <motion.div
                        className="absolute w-24 h-24 border-[2px] border-white/40 rounded-full z-40"
                        style={{
                            translateX: cursorX,
                            translateY: cursorY,
                            x: "-50%",
                            y: "-50%"
                        }}
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                        }}
                    />
                </>
            )}

            {/* 3. SNAPPY TRAIL */}
            {trail.map((dot) => (
                <motion.div
                    key={dot.id}
                    initial={{ opacity: 1, scale: 0, x: dot.x, y: dot.y, rotate: 0 }}
                    animate={{
                        opacity: [1, 1, 0],
                        scale: [0, dot.size, 0],
                        y: dot.y + (dot.vy * 10) + 80,
                        x: dot.x + (dot.vx * 10),
                        rotate: 180
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute text-4xl pointer-events-none select-none drop-shadow-md"
                    style={{ left: 0, top: 0 }}
                >
                    {dot.type}
                </motion.div>
            ))}

            {/* 4. FAST RIPPLES */}
            {ripples.map((ripple) => (
                <motion.div
                    key={ripple.id}
                    initial={{ opacity: 0.5, scale: 0, x: ripple.x, y: ripple.y }}
                    animate={{ opacity: 0, scale: 4 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    className="absolute w-20 h-20 border-[2px] border-white/20 rounded-full z-10"
                    style={{ left: -40, top: -40 }}
                />
            ))}
        </div>
    );
};

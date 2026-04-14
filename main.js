// Global easing definition for Igloo style
const IGLOO_EASE = "CustomEase.create('igloo', '0.22, 1, 0.36, 1')"; // Though CustomEase is a plugin, we can use built in power3.out or similar, OR just pass the cubic-bezier string if CSS, but for GSAP:
// GSAP native custom bezier workaround via CSS/JS or approximation.
// Actually, GSAP handles CustomEase via plugin. Since we don't have Club GreenSock CustomEase here, 
// we'll approximate (0.22, 1, 0.36, 1) using "expo.out" which is very close to that elegant feel, 
// or define a custom bezier if we had the plugin. We will use "power3.out" or "expo.out" which is the standard premium ease.
const EASE = "power3.out";
const DURATION = 0.9;

document.addEventListener("DOMContentLoaded", () => {

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    initLoader();
    initCursor();
    initScrollReveals();
    initInnovationParticles();
    initParallax();

});

function initLoader() {
    const tl = gsap.timeline();

    // Fade logo in
    tl.to(".loader-logo", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: EASE
    })

        // Simulate loading bar progress
        .to(".loader-progress", {
            width: "100%",
            duration: 1.2,
            ease: "power2.inOut"
        })

        // Fade out loader
        .to("#loader", {
            opacity: 0,
            duration: 0.6,
            ease: EASE,
            onComplete: () => {
                document.getElementById("loader").style.display = "none";
                playHeroAnimation();
            }
        });
}

function playHeroAnimation() {
    const tl = gsap.timeline({
        defaults: { ease: EASE, duration: DURATION }
    });

    // Heading
    if (document.querySelector(".hero-heading")) {
        tl.fromTo(".hero-heading",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1 }
        );
    }

    // Subheading
    if (document.querySelector(".hero-subheading")) {
        tl.fromTo(".hero-subheading",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1 },
            "-=0.7"
        );
    }

    // CTA
    if (document.querySelector(".hero-cta")) {
        tl.fromTo(".hero-cta",
            { y: 20, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1 },
            "-=0.7"
        );
    }
}

function initScrollReveals() {
    /* 
      Every section should:
      • Start at opacity 0
      • translateY(60px)
      • Reveal when 20% enters viewport
      • Smooth fade + rise
      • No bounce
    */

    const revealElements = gsap.utils.toArray('.reveal-item');

    revealElements.forEach((el) => {
        gsap.fromTo(el,
            {
                y: 60,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: EASE,
                scrollTrigger: {
                    trigger: el,
                    start: "top 80%", // Reveal when top of element hits 80% viewport height (i.e. 20% enters viewport)
                    toggleActions: "play none none none" // Play once
                }
            }
        );
    });

    // Special staggering for team section
    const teamSection = document.querySelector('.team-section');
    if (teamSection) {
        // Clear individual triggers for team cards, we'll do a batch one
        ScrollTrigger.matchMedia({
            "all": function () {
                // Only animate if team cards exist
                const teamCards = gsap.utils.toArray('.team-card');
                if (teamCards.length > 0) {
                    gsap.fromTo('.team-card',
                        { y: 30, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: EASE,
                            stagger: 0.1,
                            scrollTrigger: {
                                trigger: teamSection,
                                start: "top 75%",
                            }
                        }
                    );
                }
            }
        });
    }
}

function initCursor() {
    const canvas = document.getElementById('cursor-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    let particles = [];
    const maxParticles = 800;

    const mouse = { x: 0, y: 0, active: false };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;

        // Create star on move
        if (particles.length < maxParticles) {
            createParticle();
        }
    });

    function createParticle() {
        particles.push({
            x: mouse.x + (Math.random() - 0.5) * 10,
            y: mouse.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.8, // Gentle upward drift for longer life
            size: Math.random() * 3 + 1,
            life: 1,
            decay: 1 / (60 * 5), // Remian for 5 seconds
            rotation: Math.random() * Math.PI * 2,
            rotationVel: (Math.random() - 0.5) * 0.3,
            spikes: Math.random() > 0.5 ? 4 : 5,
            color: Math.random() > 0.7 ? '#3b82f6' : '#ffffff'
        });
    }

    function drawStar(ctx, x, y, spikes, inner, outer, rotation, color, opacity) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.moveTo(0, 0 - outer);
        for (let i = 0; i < spikes; i++) {
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, 0 - inner);
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, 0 - outer);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.rotation += p.rotationVel;
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            const size = p.size * p.life;
            drawStar(ctx, p.x, p.y, p.spikes, size * 0.35, size, p.rotation, p.color, p.life);
        }
        if (mouse.active) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

function initParallax() {
    // Parallax Effect (Subtle)
    // Hero background moves slower than content
    gsap.to(".mesh-bg", {
        y: "20%",
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
}
function initInnovationParticles() {
    const cards = document.querySelectorAll('.innovation-card');

    cards.forEach(card => {
        const canvas = card.querySelector('.innovation-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = 0;
        let mouseY = 0;
        let isHovering = false;

        function resize() {
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isHovering = true;
            
            // Create a burst of particles on move
            for(let i = 0; i < 2; i++) {
                createParticle(mouseX, mouseY);
            }
        });

        card.addEventListener('mouseleave', () => {
            isHovering = false;
        });

        function createParticle(x, y) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 2 + 1,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                color: Math.random() > 0.5 ? '#3b82f6' : '#ffffff'
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }
        animate();
    });
}

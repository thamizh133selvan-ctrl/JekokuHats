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
    // initCursor();
    initScrollReveals();
    initInnovationParticles();
    initParallax();
    initOrbsAnimation();
    initOrbsParallax();

});

function initLoader() {
    const tl = gsap.timeline();

    // 1. Reset progress text and elements
    gsap.set(".loader-text", { opacity: 0, y: 15 });
    gsap.set(".loader-counter", { opacity: 0 });

    // 2. Animate counter text and fade elements in
    tl.to([".loader-text", ".loader-counter"], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: EASE
    })
    
    // 3. Count up 00 to 100
    .to({ val: 0 }, {
        val: 100,
        duration: 1.4,
        ease: "power1.inOut",
        onUpdate: function() {
            const counter = document.querySelector(".loader-counter");
            if (counter) {
                const formatted = Math.floor(this.targets()[0].val).toString().padStart(2, '0');
                counter.innerText = formatted + "%";
            }
        }
    })

    // 4. Stagger letters or fade text slightly up, scale down loader content
    .to(".loader-content", {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
    })

    // 5. Fade out and slide up loader background
    .to("#loader", {
        yPercent: -100,
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
            const loaderEl = document.getElementById("loader");
            if (loaderEl) {
                loaderEl.style.display = "none";
            }
            playHeroAnimation();
        }
    }, "-=0.2");
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
    });

    function animate() {
        ctx.clearRect(0, 0, w, h);

        if (mouse.active) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.shadowBlur = 14;
            ctx.shadowColor = 'rgba(164, 41, 77, 0.35)';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(animate);
    }
    animate();
}

function initParallax() {
    // Parallax Effect (Subtle)
    // Hero background moves slower than content
    gsap.to(".orbs-bg", {
        y: "15%",
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
}

function initOrbsAnimation() {
    const orbs = gsap.utils.toArray('.orb');
    orbs.forEach((orb, i) => {
        gsap.to(orb, {
            x: "random(-50, 50)",
            y: "random(-50, 50)",
            rotation: "random(-90, 90)",
            duration: "random(12, 22)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.4
        });
    });
}

function initOrbsParallax() {
    const orbs = gsap.utils.toArray('.orb');
    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        
        orbs.forEach(orb => {
            const depth = parseFloat(orb.getAttribute('data-depth')) || 0.2;
            const moveX = mouseX * depth * 80;
            const moveY = mouseY * depth * 80;
            
            gsap.to(orb, {
                xPercent: moveX,
                yPercent: moveY,
                duration: 1.2,
                ease: "power1.out",
                overwrite: "auto"
            });
        });
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

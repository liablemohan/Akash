gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loader   = document.getElementById("loader");
const ascii    = loader.querySelector(".ascii");
const video    = document.getElementById("heroVideo");
const heroStage  = document.getElementById("heroStage");
const heroCopy   = document.querySelector(".hero-copy");
const scrollCue  = document.querySelector(".scroll-cue");
const caOffset   = document.querySelector("#chromaticAberration feOffset:nth-of-type(1)");
const caOffsetB  = document.querySelectorAll("#chromaticAberration feOffset")[1];
const grainNoise = document.querySelector("#grainFilter feTurbulence");

/* ---------------------------------- */
/* Film grain flicker (~12fps)         */
/* ---------------------------------- */
if (!prefersReducedMotion) {
  setInterval(() => {
    grainNoise.setAttribute("seed", Math.floor(Math.random() * 100));
  }, 80);
}

/* ---------------------------------- */
/* Preloader -> intro reveal           */
/* ---------------------------------- */
function playIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to(ascii, { opacity: 0, duration: 0.25 })
    .to(loader, {
      opacity: 0,
      duration: 0.75,
      ease: "power2.inOut",
      onComplete: () => loader.remove(),
    })
    .to(".eyebrow", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
    .to(".title .line", {
      opacity: 1,
      y: "0%",
      duration: 0.9,
      stagger: 0.12,
    }, "-=0.3")
    .to(".subtitle", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(scrollCue, { opacity: 1, duration: 0.6 }, "-=0.4");
}

const minWait    = new Promise((resolve) => setTimeout(resolve, 900));
const videoReady = new Promise((resolve) => {
  if (video.readyState >= 3) resolve();
  else video.addEventListener("canplaythrough", resolve, { once: true });
});

Promise.race([
  Promise.all([minWait, videoReady]),
  new Promise((resolve) => setTimeout(resolve, 4000)), // hard fallback
]).then(playIntro);

/* ---------------------------------- */
/* Scroll-driven motion                */
/* ---------------------------------- */
if (!prefersReducedMotion) {
  gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
    },
  })
    .to(video, { scale: 1.22, ease: "none" }, 0)
    .to(".vignette", { opacity: 1.6, ease: "none" }, 0)
    .to(".hero-copy", { y: -80, opacity: 0, ease: "none" }, 0)
    .to(scrollCue, { opacity: 0, ease: "none" }, 0)
    .to({ dx: 0.8 }, {
      dx: 4,
      ease: "none",
      onUpdate: function () {
        const v = this.targets()[0].dx;
        caOffset.setAttribute("dx", -v);
        caOffsetB.setAttribute("dx", v);
      },
    }, 0);
}

/* ---------------------------------- */
/* Mouse parallax tilt                 */
/* ---------------------------------- */
if (!prefersReducedMotion && !window.matchMedia("(hover: none)").matches) {
  const rotateX = gsap.quickTo(heroStage, "rotationX", { duration: 0.8, ease: "power3.out" });
  const rotateY = gsap.quickTo(heroStage, "rotationY", { duration: 0.8, ease: "power3.out" });
  const moveX   = gsap.quickTo(heroCopy,  "x",         { duration: 1,   ease: "power3.out" });
  const moveY   = gsap.quickTo(heroCopy,  "y",         { duration: 1,   ease: "power3.out" });

  document.getElementById("hero").addEventListener("mousemove", (e) => {
    const { innerWidth, innerHeight } = window;
    const nx = (e.clientX / innerWidth  - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;

    rotateX(ny * -3);
    rotateY(nx *  4);
    moveX(nx * -14);
    moveY(ny * -10);
  });
}

/* ------------------------------------------------------------------ */
/* Hero → 3D Scene Transition                                          */
/*                                                                     */
/* Shared function called by: video 'ended' event OR skip button.     */
/* Guards prevent double-firing with a simple boolean flag.            */
/* ------------------------------------------------------------------ */
let _transitionFired = false;

function triggerTransition() {
  if (_transitionFired) return;
  _transitionFired = true;

  const heroEl  = document.getElementById("hero");
  const sceneEl = document.getElementById("scene-section");
  const skipBtn = document.getElementById("skip-to-3d");

  // Hide skip button immediately
  if (skipBtn) skipBtn.classList.remove("visible");

  // Fade hero out
  gsap.to(heroEl, {
    opacity: 0,
    duration: 1.0,
    ease: "power2.inOut",
    onComplete() {
      heroEl.style.visibility   = "hidden";
      heroEl.style.pointerEvents = "none";

      // Make scene interactive (pointer-events enabled via class)
      sceneEl.classList.add("active");

      // Fade scene section in
      gsap.to(sceneEl, {
        opacity: 1,
        duration: 1.0,
        ease: "power2.inOut",
        onComplete() {
          // Signal Three.js scene to begin its entrance sequence
          window.dispatchEvent(new CustomEvent("hero:complete"));

          // Loop the hero video silently in the background
          video.loop = true;
          video.play().catch(() => {});
        },
      });
    },
  });
}

// Fire on natural video end
video.addEventListener("ended", triggerTransition, { once: true });

// Skip button: show after 5s, fires triggerTransition on click
const skipBtn = document.getElementById("skip-to-3d");
if (skipBtn) {
  setTimeout(() => {
    if (!_transitionFired) skipBtn.classList.add("visible");
  }, 5000);
  skipBtn.addEventListener("click", () => {
    video.removeEventListener("ended", triggerTransition);
    triggerTransition();
  });
}

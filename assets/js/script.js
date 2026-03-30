
/* ----------------------------------------------------------
   1. CONFIGURAÇÃO GLOBAL
   ---------------------------------------------------------- */

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

// Respeita preferência do sistema por menos movimento
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ----------------------------------------------------------
   2. HEADER — sombra ao rolar
   ---------------------------------------------------------- */

const headerEl = document.querySelector("header");

window.addEventListener("scroll", () => {
  headerEl.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });


/* ----------------------------------------------------------
   3. HERO — animação de entrada (carrega com a página)
   ---------------------------------------------------------- */

if (!reducedMotion) {
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out", clearProps: "all" } });

  heroTl
    .from(".hero-text h1",                    { opacity: 0, y: 56,   duration: 1   })
    .from(".hero-buttons",                    { opacity: 0, y: 28,   duration: 0.7, ease: "power2.out" }, "-=0.55")
    .from(".bg-shape",                        { opacity: 0, scale: 0.78, duration: 1.2, ease: "power2.out" }, 0)
    .from('.hero-image img[alt="Dentista"]',  { opacity: 0, scale: 0.9,  duration: 1,   ease: "power2.out" }, 0.15);
}


/* ----------------------------------------------------------
   4. BORBOLETAS — flutuação contínua com GSAP
      Cada borboleta recebe delay e duração únicos para
      criar movimento orgânico e não sincronizado.
   ---------------------------------------------------------- */

document.querySelectorAll(".butterfly").forEach((b, i) => {
  const delay    = i * 0.4;
  const duration = 2.5 + (i % 3) * 0.6;

  // Sobe e desce
  gsap.to(b, {
    y: -18,
    duration,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay,
  });

  // Rotação suave (alternada por índice par/ímpar)
  gsap.to(b, {
    rotation: i % 2 === 0 ? 12 : -12,
    duration: duration * 0.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay,
  });

  // Oscilação lateral
  gsap.to(b, {
    x: i % 2 === 0 ? 8 : -8,
    duration: duration * 1.3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: delay * 0.5,
  });
});


/* ----------------------------------------------------------
   5. TIMELINE CURVA — linha SVG animada via scroll
      A função é chamada novamente ao expandir os cards
      extras, pois o container muda de altura.
   ---------------------------------------------------------- */

const path = document.querySelector(".timeline-svg-path");
let timelineST = null;

function initTimeline() {
  if (!path) return;

  const length = path.getTotalLength();

  // Destrói instância anterior antes de recriar
  if (timelineST) {
    timelineST.kill();
    gsap.killTweensOf(path);
  }

  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".before-after-list",
      start: "top 75%",
      end: "bottom 25%",
      scrub: 2,
      onRefresh: (self) => { timelineST = self; },
    },
  });

  ScrollTrigger.refresh();
}

initTimeline();


/* ----------------------------------------------------------
   6. BEFORE & AFTER — troca entre imagens Antes/Depois
   ---------------------------------------------------------- */

document.querySelectorAll(".before-after-card").forEach((card) => {
  const btnNext = card.querySelector(".ba-btn-next");
  const btnPrev = card.querySelector(".ba-btn-prev");

  btnNext.addEventListener("click", () => card.classList.add("show-after"));
  btnPrev.addEventListener("click", () => card.classList.remove("show-after"));
});


/* ----------------------------------------------------------
   7. BOTÃO "VEJA MAIS" — expande/colapsa cards extras
      Reinicia a timeline após a transição CSS terminar (0.9s)
      para recalcular as proporções com a altura nova.
   ---------------------------------------------------------- */

const baExtra  = document.querySelector(".ba-extra");
const baVerMais = document.querySelector(".ba-ver-mais");

if (baVerMais && baExtra) {
  baVerMais.addEventListener("click", () => {
    const isOpen = baExtra.classList.toggle("open");

    baVerMais.classList.toggle("open", isOpen);
    baVerMais.innerHTML = isOpen
      ? 'Ver menos <i class="fas fa-chevron-down"></i>'
      : 'Veja mais <i class="fas fa-chevron-down"></i>';

    // Aguarda a transição CSS (0.9s) antes de reiniciar a timeline
    setTimeout(() => initTimeline(), 950);
  });
}


/* ----------------------------------------------------------
   8. SIDEBAR — menu mobile
   ---------------------------------------------------------- */

const hamburger   = document.querySelector(".hamburger");
const sidebar     = document.querySelector(".sidebar");
const overlay     = document.querySelector(".sidebar-overlay");
const sidebarClose = document.querySelector(".sidebar-close");

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
  hamburger.setAttribute("aria-expanded", true);
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "";
  hamburger.setAttribute("aria-expanded", false);
}

hamburger.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

// Fecha ao clicar em qualquer link da sidebar
document.querySelectorAll(".sidebar-links a").forEach((link) => {
  link.addEventListener("click", closeSidebar);
});


/* ----------------------------------------------------------
   9. FAQ — accordion (sempre ativo, independente de motion)
      Só um item pode estar aberto por vez.
   ---------------------------------------------------------- */

document.querySelectorAll(".faq-item").forEach((item) => {
  const btn = item.querySelector(".faq-question");

  btn.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    // Fecha todos os itens
    document.querySelectorAll(".faq-item").forEach((el) => {
      el.classList.remove("open");
      el.querySelector(".faq-question").setAttribute("aria-expanded", false);
    });

    // Abre o clicado (apenas se estava fechado)
    if (!isOpen) {
      item.classList.add("open");
      btn.setAttribute("aria-expanded", true);
    }
  });
});


/* ----------------------------------------------------------
   10. ANIMAÇÕES DE SCROLL — só executa se o usuário não
       preferir menos movimento (acessibilidade)
   ---------------------------------------------------------- */

if (!reducedMotion) {

  /* · · · Títulos de seção · · · */
  [".content h2", ".content p", ".servicos-titulo", ".feedbacks-header", ".faq-header"]
    .forEach(sel => {
      gsap.utils.toArray(sel).forEach(el => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.75,
          ease: "power2.out",
          clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    });

  /* · · · Cards Before/After — slide pelo lado correto · · · */
  gsap.utils.toArray(".ba-row").forEach(row => {
    gsap.from(row, {
      opacity: 0,
      x: row.classList.contains("ba-row-left") ? -60 : 60,
      duration: 0.75,
      ease: "power2.out",
      clearProps: "all",
      scrollTrigger: { trigger: row, start: "top 88%", once: true },
    });
  });

  /* · · · Cards de serviços — escalonado por grid · · · */
  document.querySelectorAll(".servicos-grid").forEach(grid => {
    gsap.from(grid.querySelectorAll(".servico-card"), {
      opacity: 0,
      y: 48,
      scale: 0.95,
      duration: 0.7,
      stagger: 0.18,
      ease: "power2.out",
      clearProps: "all",
      scrollTrigger: { trigger: grid, start: "top 82%", once: true },
    });
  });

  /* · · · Feedbacks — entrada escalonada · · · */
  gsap.set(".fb-card", { opacity: 0, y: 30 });
  ScrollTrigger.create({
    trigger: ".feedbacks-grid",
    start: "top 80%",
    onEnter: () => {
      gsap.to(".fb-card", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
  });

  /* · · · Me conheça — foto da esquerda, texto da direita · · · */
  gsap.set(".sobre-visual", { opacity: 0, x: -50 });
  gsap.set(".sobre-content", { opacity: 0, x:  50 });
  gsap.set(".sobre-num",     { opacity: 0, y:  20 });

  ScrollTrigger.create({
    trigger: ".sobre",
    start: "top 75%",
    onEnter: () => {
      gsap.to(".sobre-visual",  { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" });
      gsap.to(".sobre-content", { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.15 });
      gsap.to(".sobre-num",     { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", delay: 0.45 });
    },
  });

  /* · · · Contador animado nos números do "Me conheça" · · · */
  document.querySelectorAll(".sobre-num strong").forEach(el => {
    const raw       = el.textContent.trim();
    const hasPlus   = raw.startsWith("+");
    const isPercent = raw.endsWith("%");
    const target    = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    const proxy     = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(proxy, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate() {
            const v = Math.round(proxy.val);
            el.textContent = (hasPlus ? "+" : "") + v + (isPercent ? "%" : "");
          },
        });
      },
    });
  });

  /* · · · FAQ — entrada escalonada · · · */
  gsap.set(".faq-item", { opacity: 0, y: 24 });
  ScrollTrigger.create({
    trigger: ".faq-list",
    start: "top 80%",
    onEnter: () => {
      gsap.to(".faq-item", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
  });

  /* · · · Footer — colunas em cascata · · · */
  gsap.from(".footer-brand, .footer-col", {
    opacity: 0,
    y: 32,
    duration: 0.65,
    stagger: 0.13,
    ease: "power2.out",
    clearProps: "all",
    scrollTrigger: { trigger: ".footer-top", start: "top 88%", once: true },
  });

}

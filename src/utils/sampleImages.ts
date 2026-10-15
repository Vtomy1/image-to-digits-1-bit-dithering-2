import { SampleImage } from '../types';

// Helper to convert inline SVG string to clean Data URL
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'cyber-skull',
    name: 'Cyberpunk Skull',
    description: 'High-contrast mechanical skull with circuit traces',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#080812"/>
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#080812" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="30%" stop-color="#cbd5e1"/>
            <stop offset="70%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#glow)"/>
        <!-- Cranium -->
        <path d="M 120 180 C 120 90, 280 90, 280 180 C 280 220, 260 250, 250 280 L 150 280 C 140 250, 120 220, 120 180 Z" fill="url(#metal)" stroke="#94a3b8" stroke-width="3"/>
        <!-- Cheekbones -->
        <path d="M 120 200 L 90 220 L 130 260 L 155 240 Z" fill="#64748b"/>
        <path d="M 280 200 L 310 220 L 270 260 L 245 240 Z" fill="#94a3b8"/>
        <!-- Eye Sockets -->
        <ellipse cx="160" cy="180" rx="26" ry="32" fill="#030712"/>
        <ellipse cx="240" cy="180" rx="26" ry="32" fill="#030712"/>
        <circle cx="160" cy="180" r="10" fill="#38bdf8"/>
        <circle cx="240" cy="180" r="10" fill="#38bdf8"/>
        <!-- Nasal Cavity -->
        <polygon points="200,215 190,245 210,245" fill="#030712"/>
        <!-- Jaw & Teeth -->
        <path d="M 155 285 L 245 285 L 235 340 L 165 340 Z" fill="#94a3b8"/>
        <!-- Teeth grid -->
        <rect x="168" y="290" width="12" height="20" fill="#f8fafc" stroke="#334155"/>
        <rect x="184" y="290" width="12" height="20" fill="#f8fafc" stroke="#334155"/>
        <rect x="204" y="290" width="12" height="20" fill="#f8fafc" stroke="#334155"/>
        <rect x="220" y="290" width="12" height="20" fill="#f8fafc" stroke="#334155"/>
        <rect x="172" y="315" width="12" height="18" fill="#e2e8f0" stroke="#334155"/>
        <rect x="188" y="315" width="12" height="18" fill="#e2e8f0" stroke="#334155"/>
        <rect x="204" y="315" width="12" height="18" fill="#e2e8f0" stroke="#334155"/>
        <!-- Circuit details -->
        <path d="M 70 80 H 130 V 120" stroke="#38bdf8" stroke-width="3" fill="none"/>
        <circle cx="70" cy="80" r="5" fill="#38bdf8"/>
        <path d="M 330 80 H 270 V 120" stroke="#38bdf8" stroke-width="3" fill="none"/>
        <circle cx="330" cy="80" r="5" fill="#38bdf8"/>
        <path d="M 200 40 V 100" stroke="#a855f7" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
      </svg>
    `),
  },
  {
    id: 'classical-bust',
    name: 'Classical Bust',
    description: 'Chiaroscuro marble statue with dramatic dramatic shading',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#000000"/>
        <defs>
          <linearGradient id="marbleLight" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="45%" stop-color="#e2e8f0"/>
            <stop offset="70%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
        </defs>
        <!-- Head outline -->
        <path d="M 180 80 C 130 90, 120 180, 140 230 C 150 255, 170 290, 200 300 C 230 290, 250 260, 260 220 C 275 160, 250 75, 180 80 Z" fill="url(#marbleLight)"/>
        <!-- Hair curls -->
        <circle cx="150" cy="90" r="28" fill="#cbd5e1"/>
        <circle cx="185" cy="75" r="30" fill="#f8fafc"/>
        <circle cx="225" cy="85" r="26" fill="#94a3b8"/>
        <circle cx="130" cy="125" r="24" fill="#94a3b8"/>
        <circle cx="250" cy="120" r="24" fill="#64748b"/>
        <!-- Nose shadow and bridge -->
        <polygon points="195,150 208,210 190,212" fill="#f8fafc"/>
        <polygon points="208,150 215,210 208,210" fill="#1e293b"/>
        <!-- Eyes -->
        <ellipse cx="170" cy="165" rx="14" ry="8" fill="#64748b"/>
        <ellipse cx="230" cy="165" rx="14" ry="8" fill="#334155"/>
        <!-- Lips -->
        <path d="M 185 245 Q 200 240 215 245 Q 200 255 185 245 Z" fill="#64748b"/>
        <path d="M 188 250 Q 200 265 212 250 Z" fill="#1e293b"/>
        <!-- Neck and draped toga -->
        <path d="M 175 300 L 150 380 L 270 380 L 225 300 Z" fill="#475569"/>
        <path d="M 140 330 Q 200 390 280 340 L 310 390 L 100 390 Z" fill="#94a3b8"/>
      </svg>
    `),
  },
  {
    id: 'astronaut',
    name: 'Cosmonaut Visor',
    description: 'Astronaut helmet reflecting stars and earth horizon',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#050814"/>
        <defs>
          <radialGradient id="visorReflect" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="25%" stop-color="#38bdf8"/>
            <stop offset="60%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
        </defs>
        <!-- Stars -->
        <circle cx="50" cy="60" r="2" fill="#fff"/>
        <circle cx="340" cy="90" r="1.5" fill="#fff"/>
        <circle cx="80" cy="300" r="2" fill="#fff"/>
        <circle cx="320" cy="280" r="1.5" fill="#fff"/>
        <circle cx="280" cy="40" r="3" fill="#fff"/>
        <!-- Outer helmet -->
        <ellipse cx="200" cy="190" rx="140" ry="145" fill="#f1f5f9" stroke="#94a3b8" stroke-width="4"/>
        <!-- Helmet collar & neck ring -->
        <path d="M 110 300 L 90 390 L 310 390 L 290 300 Z" fill="#cbd5e1" stroke="#475569" stroke-width="4"/>
        <!-- Gold / Horizon Visor -->
        <ellipse cx="200" cy="180" rx="100" ry="85" fill="url(#visorReflect)" stroke="#0f172a" stroke-width="6"/>
        <!-- Visor Glint / Reflection -->
        <ellipse cx="160" cy="140" rx="35" ry="15" fill="#ffffff" opacity="0.6" transform="rotate(-15 160 140)"/>
        <!-- Earth curve in visor reflection -->
        <path d="M 120 200 Q 200 170 280 200 Q 200 240 120 200 Z" fill="#38bdf8" opacity="0.4"/>
      </svg>
    `),
  },
  {
    id: 'mount-fuji',
    name: 'Mount Fuji',
    description: 'Minimalist landscape with sun, snowcapped volcano & clouds',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#0f172a"/>
        <!-- Big Crimson Sun -->
        <circle cx="200" cy="160" r="95" fill="#ef4444"/>
        <!-- Mount Fuji Base -->
        <polygon points="20,380 200,150 380,380" fill="#1e293b"/>
        <!-- Mount Fuji Snow Cap -->
        <polygon points="175,185 200,150 225,185 215,200 200,190 185,205" fill="#ffffff"/>
        <!-- Stylized Wave / Cloud base -->
        <path d="M 0 330 Q 100 300 200 340 T 400 330 L 400 400 L 0 400 Z" fill="#0f172a" opacity="0.8"/>
        <path d="M 0 360 Q 100 340 200 370 T 400 360 L 400 400 L 0 400 Z" fill="#020617"/>
      </svg>
    `),
  },
  {
    id: 'torus-3d',
    name: '3D Optical Sphere',
    description: 'Wireframe optical illusion sphere with mathematical gradients',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#05050a"/>
        <defs>
          <radialGradient id="sphereGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#38bdf8"/>
            <stop offset="70%" stop-color="#1d4ed8"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="140" fill="url(#sphereGrad)"/>
        <!-- Latitude / Longitude lines -->
        <ellipse cx="200" cy="200" rx="140" ry="40" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
        <ellipse cx="200" cy="160" rx="125" ry="32" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
        <ellipse cx="200" cy="240" rx="125" ry="32" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
        <ellipse cx="200" cy="200" rx="45" ry="140" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
        <ellipse cx="200" cy="200" rx="95" ry="140" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
        <!-- Center core dot -->
        <circle cx="160" cy="150" r="15" fill="#ffffff" opacity="0.8"/>
      </svg>
    `),
  },
  {
    id: 'retro-invader',
    name: '8-Bit Arcade Mascot',
    description: 'Crisp pixel-art space invader with CRT grid background',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#0a0a0f"/>
        <!-- CRT grid subtle dots -->
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b"/>
        </pattern>
        <rect width="400" height="400" fill="url(#grid)"/>
        <!-- 11x8 Space Invader centered scaled x20 -->
        <g fill="#22c55e" transform="translate(90, 120)">
          <!-- Row 0 -->
          <rect x="40" y="0" width="20" height="20"/>
          <rect x="160" y="0" width="20" height="20"/>
          <!-- Row 1 -->
          <rect x="60" y="20" width="20" height="20"/>
          <rect x="140" y="20" width="20" height="20"/>
          <!-- Row 2 -->
          <rect x="40" y="40" width="140" height="20"/>
          <!-- Row 3 -->
          <rect x="20" y="60" width="40" height="20"/>
          <rect x="80" y="60" width="60" height="20"/>
          <rect x="160" y="60" width="40" height="20"/>
          <!-- Row 4 -->
          <rect x="0" y="80" width="220" height="20"/>
          <!-- Row 5 -->
          <rect x="0" y="100" width="20" height="20"/>
          <rect x="40" y="100" width="140" height="20"/>
          <rect x="200" y="100" width="20" height="20"/>
          <!-- Row 6 -->
          <rect x="0" y="120" width="20" height="20"/>
          <rect x="40" y="120" width="20" height="20"/>
          <rect x="160" y="120" width="20" height="20"/>
          <rect x="200" y="120" width="20" height="20"/>
          <!-- Row 7 -->
          <rect x="60" y="140" width="40" height="20"/>
          <rect x="120" y="140" width="40" height="20"/>
        </g>
      </svg>
    `),
  },
];

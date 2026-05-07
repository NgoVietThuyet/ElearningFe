# EduSmart Design System

> Hệ thống thiết kế chính thức của nền tảng học sinh học trực tuyến EduSmart.
> Phong cách: **Trẻ trung · Năng động · Hiện đại · Tinh tế**

---

## 1. Typography

### Font Family
**Plus Jakarta Sans** — font chính toàn bộ app.
- Import qua Google Fonts trong `index.html`
- Fallback: `ui-sans-serif, system-ui, sans-serif`
- `-webkit-font-smoothing: antialiased` được bật

### Font Weights & Usage
| Weight | Dùng cho |
|--------|----------|
| 400 (Regular) | Body text, placeholder, descriptions |
| 500 (Medium) | Labels, meta info |
| 600 (SemiBold) | Sub-headings, nav links |
| 700 (Bold) | Headings, card titles |
| 800 (ExtraBold) | Section headings |
| 900 (Black) | Hero headings, brand name |

### Letter Spacing
- Hero / H1: `tracking-tight` (`letter-spacing: -0.02em`)
- H2: `tracking-tight` (`letter-spacing: -0.01em`)
- Badge labels: `tracking-widest`

---

## 2. Color Palette

### Primary — Orange Brand
| Token | Hex | Dùng cho |
|-------|-----|----------|
| `orange-400` | `#fb923c` | Gradient light end, hover states |
| `orange-500` | `#f97316` | Primary brand color |
| `orange-600` | `#ea580c` | CTAs, active states, links |

### Accent Gradients
| Name | Value | Dùng cho |
|------|-------|----------|
| Brand gradient | `from-orange-400 to-orange-600` | Buttons, logo, icons |
| Warm gradient | `from-orange-500 to-amber-400` | Hero bg, progress bars |
| Vivid gradient | `from-orange-500 via-orange-600 to-amber-500` | CTA sections, hero |

### Secondary Accents
| Color | Hex | Context |
|-------|-----|---------|
| Amber `#fbbf24` | `amber-400` | Gradient tail, warm accents |
| Violet `#7c3aed` | `violet-600` | Ecosystem section, variety |
| Green `#16a34a` | `green-600` | "Free" badges, success states |
| Blue `#2563eb` | `blue-600` | Student count icons |
| Pink / Rose | `#ec4899` | Background blob decorations |

### Neutrals
| Token | Use |
|-------|-----|
| `gray-900` (#111827) | Primary text |
| `gray-700` (#374151) | Secondary text |
| `gray-500` (#6b7280) | Muted text |
| `gray-400` (#9ca3af) | Placeholder, hints |
| `gray-100` (#f3f4f6) | Card borders, dividers |
| `gray-50` (#f9fafb) | Subtle backgrounds |
| `white` | Card backgrounds |

---

## 3. Spacing & Layout

### Border Radius
| Class | Value | Use |
|-------|-------|-----|
| `rounded-xl` | 12px | Small elements (badges, inputs) |
| `rounded-2xl` | 16px | Buttons, nav pills, small cards |
| `rounded-3xl` | 24px | Cards, modals, carousels |
| `rounded-full` | 9999px | Avatars, stat pills, blob decor |

### Container
- Max width: `max-w-7xl` (80rem)
- Horizontal padding: `px-4 sm:px-6 lg:px-8`
- Section vertical padding: `py-20` for public pages

---

## 4. Shadows & Elevation

### Card Default
```
shadow-sm + border border-gray-100
```

### Card Hover
```
shadow-[0_24px_60px_rgba(249,115,22,0.15)]
```

### Button (Primary)
```
box-shadow: 0 4px 20px rgba(249,115,22,0.4)
```

### Logo / Icon
```
shadow-[0_4px_14px_rgba(249,115,22,0.4)]
```

### Sidebar Active
```
box-shadow: 0 8px 28px rgba(249,115,22,0.38), 0 2px 8px rgba(249,115,22,0.2)
```

---

## 5. Effects & Animations

### Glassmorphism
```css
.glass {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.35);
}
```
Dùng cho: login/signup card, header khi scroll, dropdowns.

### Card Lift (Hover)
```css
transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
transform: translateY(-6px) scale(1.01);
```
Dùng cho: tất cả card có thể click.

### Floating Animation
```css
animation: float 6s ease-in-out infinite;
/* translateY 0 → -14px → -7px → 0 */
```
Dùng cho: emoji decorations trong hero sections.

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #f97316, #fb923c, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
Dùng cho: brand name "EduSmart", section title accents.

### Pulse Glow
```css
animation: pulse-glow 2.5s ease-in-out infinite;
/* Expanding orange ring effect */
```
Dùng cho: logo icon trong auth pages.

### Animate Gradient (Background)
```css
animation: gradient-shift 4s ease infinite;
background-size: 200% 200%;
```
Dùng cho: CTA section background.

---

## 6. Component Patterns

### Primary Button (`.btn-gradient`)
```css
background: linear-gradient(135deg, #f97316, #ea580c);
box-shadow: 0 4px 20px rgba(249,115,22,0.4);
border-radius: 0.75rem; /* rounded-xl */
padding: 0.875rem 1.5rem;
font-weight: 900;
color: white;
```
Hover: lifts 1px, shadow increases.

### Secondary Button
```
border-2 border-orange-200 text-orange-600 rounded-2xl
hover:bg-orange-50 hover:border-orange-300
```

### Input Fields
```
bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white
font-medium text-gray-900 placeholder:text-gray-400
```

### Badge / Pill
```
px-3 py-1 bg-orange-100 text-orange-700 rounded-full
text-xs font-black uppercase tracking-wider border border-orange-200
```

### Sidebar Active Nav Item (`.sidebar-active`)
```css
background: linear-gradient(135deg, #f97316, #fb923c);
box-shadow: 0 8px 28px rgba(249,115,22,0.38);
```

### Progress Bar Fill (`.progress-fill`)
```css
background: linear-gradient(90deg, #f97316, #fbbf24);
```

---

## 7. Course Card Header Gradients

Cards cycle through 6 gradient backgrounds based on index:
| Index | Gradient |
|-------|----------|
| 0 | `from-orange-50 to-amber-50` |
| 1 | `from-green-50 to-emerald-50` |
| 2 | `from-blue-50 to-cyan-50` |
| 3 | `from-violet-50 to-purple-50` |
| 4 | `from-rose-50 to-pink-50` |
| 5 | `from-yellow-50 to-amber-50` |

---

## 8. Background Patterns

### Mesh Background (`.mesh-bg`)
Used on public pages (Courses, Login, Signup):
```css
background-color: #fff8f3;
background-image: multiple radial-gradients;
/* Creates soft, warm color mesh */
```

### Hero Blob Decorations
Absolutely positioned, pointer-events-none:
- Large blurs (80-120px) with orange/amber/pink gradients
- `opacity-40` to `opacity-60`
- `animate-float-slow` (9s infinite)

### Footer Dark Background
```
bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950
```
With orange/amber glow blurs at `opacity-20`.

---

## 9. Header Behavior

- **Default**: `bg-white/95 backdrop-blur-sm border-b border-gray-100`
- **On scroll**: `bg-white/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.07)] border-orange-100/60`
- Transition: `transition-all duration-300`
- Logo scales on hover with shadow intensity increase
- Nav links use pill hover (`rounded-xl bg-orange-50`)
- Active link: `bg-orange-50 text-orange-600`

---

## 10. Files & Where Things Live

| File | Purpose |
|------|---------|
| `src/styles/fonts.css` | Google Fonts import (Plus Jakarta Sans) |
| `src/styles/theme.css` | CSS variables, @theme inline, base typography |
| `src/styles/globals.css` | Animations, utilities, glass effects, gradients |
| `src/styles/index.css` | Master import |
| `src/app/components/Layout.tsx` | Header + footer |
| `src/app/components/HorizontalCarousel.tsx` | Scrollable card row |
| `src/app/components/HomeView.tsx` | Dashboard home view (shared) |
| `src/app/pages/Home.tsx` | Public landing page |
| `src/app/pages/Login.tsx` | Login form |
| `src/app/pages/Signup.tsx` | Signup form |
| `src/app/pages/Courses.tsx` | Course listing |
| `src/app/pages/StudentDashboard.tsx` | Student portal |
| `src/app/pages/AdminDashboard.tsx` | Admin portal |
| `src/app/pages/TeacherDashboard.tsx` | Teacher portal |

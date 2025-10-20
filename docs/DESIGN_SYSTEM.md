# 🎨 Дизайн-система LawerApp Telegram Mini App

## 📋 Обзор дизайн-системы

**LawerApp** использует современную дизайн-систему, основанную на принципах Material Design 3, адаптированную для Telegram Mini App и российского рынка. Система обеспечивает консистентность, доступность и отличный пользовательский опыт.

---

## 🎯 Принципы дизайна

### **1. Design Philosophy**

#### **Основные принципы:**
- **Trust & Reliability** - доверие и надежность в правовых вопросах
- **Clarity & Simplicity** - ясность и простота для сложных правовых концепций
- **Accessibility First** - доступность для всех пользователей
- **Mobile-First** - приоритет мобильных устройств
- **Telegram-Native** - интеграция с экосистемой Telegram

#### **Визуальная иерархия:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Visual Hierarchy                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Primary Actions                          │ │
│  │              • CTA Buttons                             │ │
│  │              • Navigation                              │ │
│  │              • Critical Functions                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Secondary Actions                        │ │
│  │              • Secondary Buttons                       │ │
│  │              • Links                                   │ │
│  │              • Supporting Elements                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Content & Information                    │ │
│  │              • Text Content                            │ │
│  │              • Data Display                            │ │
│  │              • Status Indicators                       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Цветовая палитра

### **1. Primary Colors**

#### **Основные цвета:**
```css
:root {
  /* Primary Colors - Trust & Legal */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9; /* Main Primary */
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;

  /* Secondary Colors - Success & Positive */
  --color-secondary-50: #f0fdf4;
  --color-secondary-100: #dcfce7;
  --color-secondary-200: #bbf7d0;
  --color-secondary-300: #86efac;
  --color-secondary-400: #4ade80;
  --color-secondary-500: #22c55e; /* Main Secondary */
  --color-secondary-600: #16a34a;
  --color-secondary-700: #15803d;
  --color-secondary-800: #166534;
  --color-secondary-900: #14532d;

  /* Accent Colors - Warning & Attention */
  --color-accent-50: #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b; /* Main Accent */
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;
  --color-accent-800: #92400e;
  --color-accent-900: #78350f;
}
```

### **2. Semantic Colors**

#### **Семантические цвета:**
```css
:root {
  /* Success - Positive actions, confirmations */
  --color-success: var(--color-secondary-500);
  --color-success-light: var(--color-secondary-100);
  --color-success-dark: var(--color-secondary-700);

  /* Warning - Caution, attention needed */
  --color-warning: var(--color-accent-500);
  --color-warning-light: var(--color-accent-100);
  --color-warning-dark: var(--color-accent-700);

  /* Error - Errors, destructive actions */
  --color-error: #ef4444;
  --color-error-light: #fecaca;
  --color-error-dark: #dc2626;

  /* Info - Information, neutral actions */
  --color-info: var(--color-primary-500);
  --color-info-light: var(--color-primary-100);
  --color-info-dark: var(--color-primary-700);
}
```

### **3. Neutral Colors**

#### **Нейтральная палитра:**
```css
:root {
  /* Grayscale - Text and backgrounds */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Text Colors */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-500);
  --color-text-disabled: var(--color-gray-400);
  --color-text-inverse: #ffffff;

  /* Background Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);
  --color-bg-elevated: #ffffff;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);
}
```

### **4. Telegram Theme Integration**

#### **Адаптация к темам Telegram:**
```css
/* Light Theme (Default) */
[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-text-primary: #000000;
  --color-text-secondary: #6c757d;
}

/* Dark Theme */
[data-theme="dark"] {
  --color-bg-primary: #17212b;
  --color-bg-secondary: #242f3d;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
}

/* High Contrast Theme */
[data-theme="high-contrast"] {
  --color-bg-primary: #000000;
  --color-bg-secondary: #1a1a1a;
  --color-text-primary: #ffffff;
  --color-text-secondary: #cccccc;
  --color-primary-500: #00ff00;
}
```

---

## 📝 Типографика

### **1. Font System**

#### **Шрифтовая система:**
```css
:root {
  /* Font Families */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-secondary: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;

  /* Font Sizes - Fluid Typography */
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
  --font-size-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem);
  --font-size-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* Letter Spacing */
  --letter-spacing-tighter: -0.05em;
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0em;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}
```

### **2. Typography Scale**

#### **Типографическая шкала:**
```css
/* Headings */
.heading-1 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.heading-2 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.heading-3 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
  letter-spacing: var(--letter-spacing-normal);
  color: var(--color-text-primary);
}

.heading-4 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-normal);
  color: var(--color-text-primary);
}

/* Body Text */
.body-large {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
  letter-spacing: var(--letter-spacing-normal);
  color: var(--color-text-primary);
}

.body-medium {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-normal);
  color: var(--color-text-primary);
}

.body-small {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-normal);
  color: var(--color-text-secondary);
}

/* Caption and Labels */
.caption {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.label {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-normal);
  color: var(--color-text-secondary);
}
```

---

## 📏 Spacing System

### **1. Spacing Scale**

#### **Система отступов:**
```css
:root {
  /* Spacing Scale - 8px base unit */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem;   /* 48px */
  --space-16: 4rem;   /* 64px */
  --space-20: 5rem;   /* 80px */
  --space-24: 6rem;   /* 96px */
  --space-32: 8rem;   /* 128px */

  /* Semantic Spacing */
  --space-xs: var(--space-1);
  --space-sm: var(--space-2);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-12);
  --space-3xl: var(--space-16);
}
```

### **2. Layout Spacing**

#### **Отступы для макета:**
```css
/* Container Spacing */
.container {
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}

/* Section Spacing */
.section {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

.section-sm {
  padding-top: var(--space-12);
  padding-bottom: var(--space-12);
}

.section-lg {
  padding-top: var(--space-20);
  padding-bottom: var(--space-20);
}

/* Component Spacing */
.component {
  margin-bottom: var(--space-6);
}

.component-sm {
  margin-bottom: var(--space-4);
}

.component-lg {
  margin-bottom: var(--space-8);
}
```

---

## 🔲 Border Radius

### **1. Border Radius Scale**

#### **Система скругления углов:**
```css
:root {
  /* Border Radius Scale */
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.25rem;   /* 4px */
  --radius-lg: 0.375rem;  /* 6px */
  --radius-xl: 0.5rem;    /* 8px */
  --radius-2xl: 0.75rem;  /* 12px */
  --radius-3xl: 1rem;     /* 16px */
  --radius-full: 9999px;

  /* Semantic Border Radius */
  --radius-button: var(--radius-lg);
  --radius-card: var(--radius-xl);
  --radius-input: var(--radius-md);
  --radius-modal: var(--radius-2xl);
  --radius-avatar: var(--radius-full);
}
```

---

## 🌊 Shadows & Elevation

### **1. Shadow System**

#### **Система теней:**
```css
:root {
  /* Shadow Scale */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

  /* Semantic Shadows */
  --shadow-button: var(--shadow-sm);
  --shadow-card: var(--shadow-md);
  --shadow-modal: var(--shadow-xl);
  --shadow-dropdown: var(--shadow-lg);
  --shadow-tooltip: var(--shadow-md);
}
```

### **2. Elevation System**

#### **Система высот:**
```css
/* Elevation Levels */
.elevation-0 {
  box-shadow: none;
}

.elevation-1 {
  box-shadow: var(--shadow-sm);
}

.elevation-2 {
  box-shadow: var(--shadow-md);
}

.elevation-3 {
  box-shadow: var(--shadow-lg);
}

.elevation-4 {
  box-shadow: var(--shadow-xl);
}

.elevation-5 {
  box-shadow: var(--shadow-2xl);
}

/* Interactive Elevation */
.interactive {
  transition: box-shadow 0.2s ease-in-out;
}

.interactive:hover {
  box-shadow: var(--shadow-lg);
}

.interactive:active {
  box-shadow: var(--shadow-sm);
}
```

---

## 🎭 Animation & Transitions

### **1. Timing Functions**

#### **Функции времени:**
```css
:root {
  /* Easing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Duration Scale */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

### **2. Animation Patterns**

#### **Паттерны анимации:**
```css
/* Fade Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.fade-in {
  animation: fadeIn var(--duration-200) var(--ease-out);
}

.fade-out {
  animation: fadeOut var(--duration-200) var(--ease-in);
}

/* Slide Animations */
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-up {
  animation: slideInUp var(--duration-300) var(--ease-out);
}

.slide-in-down {
  animation: slideInDown var(--duration-300) var(--ease-out);
}

/* Scale Animations */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-in {
  animation: scaleIn var(--duration-200) var(--ease-out);
}

/* Transition Classes */
.transition-all {
  transition: all var(--duration-200) var(--ease-in-out);
}

.transition-colors {
  transition: color var(--duration-200) var(--ease-in-out),
              background-color var(--duration-200) var(--ease-in-out),
              border-color var(--duration-200) var(--ease-in-out);
}

.transition-transform {
  transition: transform var(--duration-200) var(--ease-in-out);
}

.transition-opacity {
  transition: opacity var(--duration-200) var(--ease-in-out);
}
```

---

## 📱 Responsive Design

### **1. Breakpoint System**

#### **Система брейкпоинтов:**
```css
:root {
  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Container Sizes */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}

/* Media Query Mixins */
@media (min-width: 640px) {
  .sm\:block { display: block; }
  .sm\:hidden { display: none; }
}

@media (min-width: 768px) {
  .md\:block { display: block; }
  .md\:hidden { display: none; }
}

@media (min-width: 1024px) {
  .lg\:block { display: block; }
  .lg\:hidden { display: none; }
}

@media (min-width: 1280px) {
  .xl\:block { display: block; }
  .xl\:hidden { display: none; }
}
```

### **2. Mobile-First Approach**

#### **Мобильный подход:**
```css
/* Base styles for mobile */
.component {
  padding: var(--space-4);
  font-size: var(--font-size-base);
}

/* Tablet styles */
@media (min-width: 768px) {
  .component {
    padding: var(--space-6);
    font-size: var(--font-size-lg);
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-8);
    font-size: var(--font-size-xl);
  }
}
```

---

## ♿ Accessibility

### **1. Accessibility Standards**

#### **WCAG 2.1 AA Compliance:**
```css
/* Focus States */
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --color-primary-500: #0066cc;
    --color-text-primary: #000000;
    --color-bg-primary: #ffffff;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Color Blind Support */
.colorblind-friendly {
  /* Use patterns and shapes in addition to color */
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    currentColor 2px,
    currentColor 4px
  );
}
```

### **2. Screen Reader Support**

#### **Поддержка скрин-ридеров:**
```css
/* Screen Reader Only Text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  border-radius: var(--radius-md);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

---

## 🎨 Component Design Tokens

### **1. Button Tokens**

#### **Токены для кнопок:**
```css
:root {
  /* Button Sizes */
  --button-height-sm: 2rem;    /* 32px */
  --button-height-md: 2.5rem;  /* 40px */
  --button-height-lg: 3rem;    /* 48px */
  --button-height-xl: 3.5rem;  /* 56px */

  /* Button Padding */
  --button-padding-sm: var(--space-2) var(--space-3);
  --button-padding-md: var(--space-3) var(--space-4);
  --button-padding-lg: var(--space-4) var(--space-6);
  --button-padding-xl: var(--space-5) var(--space-8);

  /* Button Border Radius */
  --button-radius: var(--radius-lg);

  /* Button Font Sizes */
  --button-font-size-sm: var(--font-size-sm);
  --button-font-size-md: var(--font-size-base);
  --button-font-size-lg: var(--font-size-lg);
  --button-font-size-xl: var(--font-size-xl);
}
```

### **2. Input Tokens**

#### **Токены для полей ввода:**
```css
:root {
  /* Input Sizes */
  --input-height-sm: 2rem;    /* 32px */
  --input-height-md: 2.5rem;  /* 40px */
  --input-height-lg: 3rem;    /* 48px */

  /* Input Padding */
  --input-padding-sm: var(--space-2) var(--space-3);
  --input-padding-md: var(--space-3) var(--space-4);
  --input-padding-lg: var(--space-4) var(--space-5);

  /* Input Border */
  --input-border-width: 1px;
  --input-border-color: var(--color-gray-300);
  --input-border-radius: var(--radius-md);

  /* Input Focus */
  --input-focus-border-color: var(--color-primary-500);
  --input-focus-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

### **3. Card Tokens**

#### **Токены для карточек:**
```css
:root {
  /* Card Padding */
  --card-padding-sm: var(--space-4);
  --card-padding-md: var(--space-6);
  --card-padding-lg: var(--space-8);

  /* Card Border */
  --card-border-width: 1px;
  --card-border-color: var(--color-gray-200);
  --card-border-radius: var(--radius-xl);

  /* Card Shadow */
  --card-shadow: var(--shadow-md);
  --card-shadow-hover: var(--shadow-lg);
}
```

---

## 🎯 Design System Implementation

### **1. CSS Custom Properties**

#### **Основные CSS переменные:**
```css
/* design-system.css */
:root {
  /* Import all design tokens */
  /* Colors, Typography, Spacing, etc. */
}

/* Theme Variants */
[data-theme="light"] {
  /* Light theme overrides */
}

[data-theme="dark"] {
  /* Dark theme overrides */
}

[data-theme="high-contrast"] {
  /* High contrast theme overrides */
}

/* Component Base Styles */
.btn {
  /* Button base styles using design tokens */
}

.input {
  /* Input base styles using design tokens */
}

.card {
  /* Card base styles using design tokens */
}
```

### **2. Tailwind CSS Integration**

#### **Интеграция с Tailwind:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          // ... other shades
          500: 'var(--color-primary-500)',
          // ... other shades
          900: 'var(--color-primary-900)',
        },
        // ... other color scales
      },
      fontFamily: {
        primary: ['var(--font-family-primary)'],
        secondary: ['var(--font-family-secondary)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        // ... other sizes
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        // ... other spacing values
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        // ... other radius values
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        // ... other shadow values
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### **3. Component Library Integration**

#### **Интеграция с shadcn/ui:**
```typescript
// components/ui/button.tsx
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        destructive: "bg-error text-white hover:bg-error-dark",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
        secondary: "bg-secondary-500 text-white hover:bg-secondary-600",
        ghost: "hover:bg-gray-100",
        link: "text-primary-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8",
        xl: "h-14 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

---

## 📚 Design System Documentation

### **1. Component Documentation**

#### **Документация компонентов:**
```markdown
# Button Component

## Overview
The Button component is a clickable element that triggers an action.

## Variants
- `default`: Primary action button
- `secondary`: Secondary action button
- `outline`: Outlined button
- `ghost`: Ghost button
- `destructive`: Destructive action button
- `link`: Link-style button

## Sizes
- `sm`: Small button (32px height)
- `default`: Default button (40px height)
- `lg`: Large button (48px height)
- `xl`: Extra large button (56px height)

## Usage
```tsx
<Button variant="default" size="lg">
  Click me
</Button>
```

## Accessibility
- Supports keyboard navigation
- Includes focus states
- Screen reader friendly
- WCAG 2.1 AA compliant
```

### **2. Design Guidelines**

#### **Руководящие принципы:**
```markdown
# Design Guidelines

## Color Usage
- Use primary colors for main actions
- Use secondary colors for success states
- Use accent colors for warnings
- Use error colors sparingly

## Typography
- Use heading styles for hierarchy
- Maintain consistent line heights
- Ensure sufficient contrast ratios
- Support multiple languages

## Spacing
- Use the 8px grid system
- Maintain consistent spacing
- Consider mobile constraints
- Use semantic spacing tokens

## Accessibility
- Ensure WCAG 2.1 AA compliance
- Support keyboard navigation
- Provide alternative text
- Test with screen readers
```

---

## 🎯 Заключение

Данная дизайн-система обеспечивает:

### **✅ Современные принципы:**
- **Material Design 3** - современные принципы дизайна
- **Accessibility First** - приоритет доступности
- **Mobile-First** - мобильный подход
- **Telegram Integration** - интеграция с Telegram

### **✅ Консистентность:**
- **Unified Tokens** - единые дизайн-токены
- **Component Library** - библиотека компонентов
- **Responsive Design** - адаптивный дизайн
- **Theme Support** - поддержка тем

### **✅ Готовность к разработке:**
- **CSS Custom Properties** - CSS переменные
- **Tailwind Integration** - интеграция с Tailwind
- **Component Examples** - примеры компонентов
- **Documentation** - подробная документация

**Следующий шаг**: Создание UI компонентов на основе дизайн-системы! 🎨

---

*Дизайн-система подготовлена: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готово к использованию ✅*

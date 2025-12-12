# ChanceDee Design Guidelines
## Color & Typography System

**Version:** 1.0  
**Date:** December 2024  
**Platform:** ChanceDee - Thai Recruitment Platform

---

## 1. Brand Overview

### 1.1 Platform Identity

ChanceDee connects **Growers** (career seekers pursuing growth) with Thai corporations. The platform acts as a **Nurturer** — facilitating career growth through meaningful job matching.

### 1.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Professional** | Clean, trustworthy, corporate-appropriate |
| **Modern** | Contemporary UI patterns, minimal visual noise |
| **Warm** | Approachable through color, not overly cold/sterile |
| **Thai-First** | Optimized for Thai language readability |

### 1.3 Visual Style

- **Illustrations:** Flat, minimal
- **Icons:** Line icons, minimal style
- **Corners:** Rounded (`0.625rem` / 10px)
- **Mode:** Light mode (dark mode reserved for future)

---

## 2. Typography

### 2.1 Font Family

**Kanit** — Used throughout the platform for both Thai and English text.

```css
font-family: 'Kanit', sans-serif;
```

> ⚠️ **Note:** Kanit is designed for headlines. We use lighter weights and increased letter-spacing to improve body text readability.

### 2.2 Type Scale

| Element | Size | Weight | Letter-spacing | Line-height | Tailwind Classes |
|---------|------|--------|----------------|-------------|------------------|
| H1 | 32px (2rem) | 500 | 0.01em | 1.2 | `text-3xl font-semibold tracking-wide leading-tight` |
| H2 | 24px (1.5rem) | 500 | 0.01em | 1.3 | `text-2xl font-semibold tracking-wide leading-snug` |
| H3 | 20px (1.25rem) | 400 | 0.01em | 1.4 | `text-xl font-medium tracking-wide leading-normal` |
| Body | 16px (1rem) | 300 | 0.015em | 1.6 | `text-base font-normal tracking-wider leading-relaxed` |
| Small | 14px (0.875rem) | 300 | 0.015em | 1.5 | `text-sm font-normal tracking-wider` |
| Caption | 12px (0.75rem) | 300 | 0.02em | 1.4 | `text-xs font-normal tracking-widest` |
| Button/Label | 14–16px | 400 | 0.02em | 1 | `font-medium tracking-widest` |

### 2.3 Font Weight Reference

| Weight Name | Value | Usage |
|-------------|-------|-------|
| light | 200 | Decorative, large display text |
| normal | 300 | Body text, paragraphs |
| medium | 400 | UI elements, buttons, labels |
| semibold | 500 | Headings (H1, H2, H3) |
| bold | 600 | Strong emphasis (use sparingly) |

### 2.4 Letter-spacing Values

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-wide` | 0.01em | Headings |
| `tracking-wider` | 0.015em | Body text |
| `tracking-widest` | 0.02em | Captions, buttons, labels |
| `tracking-super` | 0.05em | All-caps labels |

---

## 3. Color Palette

### 3.1 Primary — Orange

The "spice" color. Use sparingly for primary actions and brand moments.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#FDF7EF` | Subtle backgrounds, hover tints |
| `primary-100` | `#FBEDD9` | Light backgrounds, selected states |
| `primary-200` | `#F5D7B3` | Decorative borders |
| `primary-300` | `#EFBC82` | Disabled states |
| `primary-400` | `#E79750` | Secondary emphasis |
| `primary-500` | `#E17A2E` | Alternative primary |
| **`primary-600`** | **`#DB6726`** | **DEFAULT — Primary buttons, CTAs** |
| `primary-700` | `#AF4B1F` | Pressed/active states |
| `primary-800` | `#8C3D20` | Dark accents |
| `primary-900` | `#71331D` | Hover state for primary buttons |
| `primary-950` | `#3D190D` | Darkest, text on light backgrounds |
| `primary-foreground` | `#FDF7EF` | Text on primary backgrounds |

### 3.2 Secondary — Teal

The "base" color. Use generously for UI, navigation, and supporting elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-50` | `#F1FAFA` | Page backgrounds, subtle tints |
| `secondary-100` | `#DAF0F3` | Card backgrounds, alternating rows |
| `secondary-200` | `#BAE2E7` | Borders, dividers |
| `secondary-300` | `#8ACBD6` | Decorative elements |
| `secondary-400` | `#53ACBD` | Icons (secondary) |
| `secondary-500` | `#3790A3` | Text links |
| `secondary-600` | `#30768A` | Link hover, navigation active |
| `secondary-700` | `#2D6071` | Icons (primary), secondary button text |
| `secondary-800` | `#2C515E` | Dark UI elements |
| **`secondary-900`** | **`#284450`** | **DEFAULT — Secondary buttons, sidebar** |
| `secondary-950` | `#162C36` | Darkest, navigation background |
| `secondary-foreground` | `#F1FAFA` | Text on secondary backgrounds |

### 3.3 Semantic Colors

| Purpose | Background | Text/Border | Icon | Tailwind Tokens |
|---------|------------|-------------|------|-----------------|
| **Success** | `#DCFCE7` | `#15803D` | ✓ | `bg-green-100 text-green-700` |
| **Warning** | `#FEF3C7` | `#B45309` | ⚠ | `bg-amber-100 text-amber-700` |
| **Error** | `#FEF2F2` | `#DC2626` | ✕ | `bg-red-50 text-red-600` |
| **Info** | `#EFF6FF` | `#1D4ED8` | ℹ | `bg-blue-50 text-blue-700` |

> ⚠️ **Error Color Note:** We use `red-600` (#DC2626) instead of `red-500` to better distinguish from primary orange.

### 3.4 Neutral Colors

Use Tailwind's default gray scale for text, borders, and backgrounds.

| Usage | Token | Hex |
|-------|-------|-----|
| Primary text | `gray-900` | `#111827` |
| Secondary text | `gray-600` | `#4B5563` |
| Placeholder text | `gray-400` | `#9CA3AF` |
| Borders | `gray-200` | `#E5E7EB` |
| Subtle backgrounds | `gray-50` | `#F9FAFB` |
| Disabled backgrounds | `gray-100` | `#F3F4F6` |

---

## 4. Color Usage Guidelines

### 4.1 The 80/20 Rule

- **80% Teal (Secondary):** Navigation, links, icons, supporting UI
- **20% Orange (Primary):** CTAs, brand moments, key actions

### 4.2 Primary Orange Usage

| ✅ Do Use For | ❌ Don't Use For |
|---------------|------------------|
| Primary CTA buttons | Body text |
| Brand logo/mark | Borders (except brand elements) |
| Hero section accents | Navigation items |
| Progress indicators | Secondary buttons |
| Key action highlights | Links in body text |
| One primary button per section | Multiple orange buttons side-by-side |

### 4.3 Secondary Teal Usage

| Element | Color Token |
|---------|-------------|
| Body text links | `secondary-500` |
| Link hover | `secondary-600` |
| Navigation background | `secondary-950` |
| Navigation active item | `secondary-600` |
| Secondary button (solid) | `secondary-900` |
| Secondary button (outline) | `secondary-500` border, `secondary-700` text |
| Icons | `secondary-700` |
| Card/section backgrounds | `secondary-50` |

---

## 5. Status Badge System

### 5.1 Design Philosophy

Users think in simple terms:
- "I need to wait"
- "This worked out"
- "Something went wrong"
- "This is done/archived"

We map all system statuses to **4 badge variants** to reduce cognitive load.

### 5.2 Badge Variants

| Variant | Background | Text & Border | Tailwind Classes |
|---------|------------|---------------|------------------|
| **waiting** | `#FEF3C7` | `#B45309` | `bg-amber-100 text-amber-700 border-amber-700` |
| **success** | `#DCFCE7` | `#15803D` | `bg-green-100 text-green-700 border-green-700` |
| **problem** | `#FFE4E6` | `#BE123C` | `bg-rose-100 text-rose-700 border-rose-700` |
| **neutral** | `#F3F4F6` | `#4B5563` | `bg-gray-100 text-gray-600 border-gray-600` |

### 5.3 Status Mapping

| System Status | Thai | Variant | Icon |
|---------------|------|---------|------|
| Pending | รอการยืนยัน | `waiting` | — |
| In Review | กำลังพิจารณา | `waiting` | — |
| Confirmed | ยืนยันแล้ว | `success` | ✓ |
| Approved | อนุมัติแล้ว | `success` | ✓ |
| Completed | เสร็จสิ้น | `neutral` | ✓ |
| Cancelled | ยกเลิก | `neutral` | — |
| Declined | ถูกปฏิเสธ | `problem` | ✕ |
| Rejected | ไม่ผ่าน | `problem` | ✕ |
| No-show | ไม่มา | `problem` | ✕ |
| **Needs Action** | ต้องดำเนินการ | `waiting` | 🔔 |

### 5.4 "Needs Action" Special Treatment

For urgent statuses requiring user action (e.g., appointment confirmation):

```css
/* Same as waiting, plus: */
border-width: 2px;
border-style: solid;
/* Always include 🔔 icon before text */
```

Tailwind: `bg-amber-100 text-amber-700 border-2 border-amber-700`

---

## 6. Button System

### 6.1 Button Hierarchy

| Level | Name | Style | Usage | Example (Thai) |
|-------|------|-------|-------|----------------|
| 1 | **Primary** | Orange solid | Main action, one per section | สมัครงาน, บันทึก, ยืนยัน |
| 2 | **Secondary** | Teal solid | Supporting actions | ดูรายละเอียด, ถัดไป |
| 3 | **Outline** | Teal border | Dismissive/back actions | ยกเลิก, ย้อนกลับ |
| 4 | **Ghost** | Text only | Lowest priority | ข้าม, ภายหลัง |
| 5 | **Destructive** | Red solid + icon | Dangerous actions | ลบ, ยกเลิกใบสมัคร |

### 6.2 Button Specifications

| Property | Value |
|----------|-------|
| Border radius | `0.625rem` (10px) |
| Font weight | 400 (medium) |
| Letter-spacing | 0.02em |
| Padding (small) | `px-4 py-2` |
| Padding (default) | `px-6 py-3` |
| Padding (large) | `px-8 py-4` |

### 6.3 Button Styles

**Primary Button**
```
bg-primary text-primary-foreground
hover:bg-primary-900
```

**Secondary Button**
```
bg-secondary-900 text-secondary-foreground
hover:bg-secondary-800
```

**Outline Button**
```
border border-secondary-500 text-secondary-700 bg-transparent
hover:bg-secondary-50
```

**Ghost Button**
```
text-secondary-600 bg-transparent
hover:text-secondary-800 hover:bg-secondary-50
```

**Destructive Button**
```
bg-red-600 text-white
hover:bg-red-700
/* Always pair with icon (trash, warning) */
/* Always requires confirmation dialog */
```

---

## 7. Form Elements

### 7.1 Input Fields

**Default State**
```
border border-gray-300 rounded-lg
bg-white text-gray-900
focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200
```

**Error State**
```
border-2 border-red-500 bg-red-50
text-gray-900
```

### 7.2 Validation Pattern

```
┌─────────────────────────────────────────────────┐
│  Label *                                        │  ← text-sm text-gray-700 font-medium
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ Input value                             │    │  ← Default: border-gray-300
│  └─────────────────────────────────────────┘    │     Error: border-2 border-red-500 bg-red-50
│  ✕ Error message here                           │  ← text-sm text-red-600
│                                                 │     Icon (✕) + message
└─────────────────────────────────────────────────┘
```

### 7.3 Form Labels

| State | Style |
|-------|-------|
| Default | `text-sm text-gray-700 font-medium` |
| Required indicator | `text-red-500` (asterisk) |
| Optional indicator | `text-gray-400 text-xs` "(ไม่บังคับ)" |
| Disabled | `text-gray-400` |

---

## 8. Accessibility

### 8.1 Compliance Target

**WCAG 2.1 AA**

### 8.2 Color Contrast Ratios

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| `primary` on `primary-foreground` | 4.5:1+ | ✓ |
| `secondary-900` on `secondary-foreground` | 4.5:1+ | ✓ |
| `gray-900` on white | 16:1+ | ✓ |
| `gray-600` on white | 5.7:1+ | ✓ |
| Badge text on badge background | 4.5:1+ | ✓ |

### 8.3 Best Practices

- Never use color alone to convey meaning — always pair with icons or text
- Error states use red border + red text + ✕ icon
- Status badges include descriptive text labels
- Interactive elements have visible focus states

---

## 9. Tailwind Configuration Updates

Add these extensions to your `tailwind.config.mts`:

```typescript
// theme.extend
letterSpacing: {
  tight: '-0.01em',
  normal: '0',
  wide: '0.01em',
  wider: '0.015em',
  widest: '0.02em',
  super: '0.05em',
},

fontWeight: {
  light: '200',
  normal: '300',
  medium: '400',
  semibold: '500',
  bold: '600',
},

colors: {
  // Add explicit error color (cooler red)
  error: {
    DEFAULT: '#DC2626',
    light: '#FEF2F2',
    dark: '#991B1B',
  },
},
```

---

## 10. Quick Reference Card

### Colors at a Glance

| Role | Color | Hex |
|------|-------|-----|
| Primary action | Orange | `#DB6726` |
| Primary hover | Dark orange | `#71331D` |
| Secondary action | Teal | `#284450` |
| Links | Teal | `#3790A3` |
| Success | Green | `#15803D` |
| Warning | Amber | `#B45309` |
| Error | Red | `#DC2626` |
| Neutral text | Gray | `#4B5563` |

### Typography at a Glance

| Element | Size | Weight |
|---------|------|--------|
| H1 | 32px | 500 |
| H2 | 24px | 500 |
| H3 | 20px | 400 |
| Body | 16px | 300 |
| Small | 14px | 300 |
| Caption | 12px | 300 |

### Badge Variants at a Glance

| Variant | Use For |
|---------|---------|
| `waiting` | Pending, In Review, Needs Action |
| `success` | Confirmed, Approved |
| `problem` | Declined, Rejected, No-show |
| `neutral` | Completed, Cancelled |

---

*End of ChanceDee Design Guidelines*

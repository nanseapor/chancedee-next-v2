# Indicators

## Overview

Indicator atoms communicate loading states, progress, and feedback visually. They provide essential feedback during asynchronous operations.

**Design Reference:** See `chancedee-design-guidelines.md` for colors.

---

# 1. Spinner

## Description

Animated loading indicator for pending operations.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| size | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | no | `'md'` | Spinner size |
| color | `'primary'` \| `'secondary'` \| `'white'` \| `'gray'` | no | `'secondary'` | Spinner color |
| label | `string` | no | — | Accessible label |

## Sizes

| Size | Dimensions | Border Width | Use Case |
|------|------------|--------------|----------|
| `sm` | `w-4 h-4` | `border-2` | Inline, buttons |
| `md` | `w-6 h-6` | `border-2` | Cards, inputs |
| `lg` | `w-8 h-8` | `border-3` | Sections |
| `xl` | `w-12 h-12` | `border-4` | Full page |

## Colors

| Color | Track | Spinner |
|-------|-------|---------|
| `primary` | `border-primary-200` | `border-t-primary` |
| `secondary` | `border-secondary-200` | `border-t-secondary-600` |
| `white` | `border-white/30` | `border-t-white` |
| `gray` | `border-gray-200` | `border-t-gray-600` |

## Styling

```css
.spinner {
  @apply rounded-full;
  @apply border-solid;
  @apply animate-spin;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Accessibility

| Attribute | Value |
|-----------|-------|
| `role` | `status` |
| `aria-label` | `label` prop or "กำลังโหลด" / "Loading" |

---

# 2. ProgressBar

## Description

Linear progress indicator for determinate progress.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `number` | yes | — | Progress value (0-100) |
| max | `number` | no | `100` | Maximum value |
| showLabel | `boolean` | no | `false` | Show percentage label |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Bar height |
| color | `'primary'` \| `'secondary'` \| `'success'` \| `'warning'` | no | `'secondary'` | Bar color |
| animated | `boolean` | no | `false` | Animate fill |
| indeterminate | `boolean` | no | `false` | Unknown progress |

## Sizes

| Size | Height |
|------|--------|
| `sm` | `h-1` |
| `md` | `h-2` |
| `lg` | `h-3` |

## Colors

| Color | Fill |
|-------|------|
| `primary` | `bg-primary` |
| `secondary` | `bg-secondary-500` |
| `success` | `bg-green-500` |
| `warning` | `bg-amber-500` |

## Visual Structure

```
┌────────────────────────────────────────┐
│████████████████░░░░░░░░░░░░░░░░░░░░░░░░│  65%
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│██████████████████████████████░░░░░░░░░░│  ← With label above
└────────────────────────────────────────┘
          อัปโหลด 75%
          Uploading 75%
```

## Indeterminate Animation

```css
.progress-indeterminate {
  @apply animate-pulse;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color) 50%,
    transparent
  );
  animation: indeterminate 1.5s infinite;
}

@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

## Accessibility

| Attribute | Value |
|-----------|-------|
| `role` | `progressbar` |
| `aria-valuenow` | Current value |
| `aria-valuemin` | `0` |
| `aria-valuemax` | `100` |
| `aria-label` | "ความคืบหน้า" / "Progress" |

---

# 3. ProgressRing

## Description

Circular progress indicator, used for profile completion and stats.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `number` | yes | — | Progress value (0-100) |
| size | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | no | `'md'` | Ring size |
| strokeWidth | `number` | no | `4` | Ring thickness |
| showValue | `boolean` | no | `true` | Show percentage in center |
| color | `string` | no | — | Override color based on value |
| children | `ReactNode` | no | — | Content in center |

## Sizes

| Size | Dimensions |
|------|------------|
| `sm` | `w-12 h-12` |
| `md` | `w-16 h-16` |
| `lg` | `w-24 h-24` |
| `xl` | `w-32 h-32` |

## Color by Value (Default)

| Value Range | Color |
|-------------|-------|
| 0-29% | `text-red-500` |
| 30-69% | `text-amber-500` |
| 70-99% | `text-green-500` |
| 100% | `text-secondary-500` |

## Visual Structure

```
    ┌───────────┐
    │  ╭─────╮  │
    │  │     │  │
    │  │ 65% │  │    ← Value in center
    │  │     │  │
    │  ╰─────╯  │
    └───────────┘
```

## SVG Implementation

```jsx
<svg viewBox="0 0 36 36">
  {/* Background ring */}
  <circle
    cx="18" cy="18" r="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    className="text-gray-200"
  />
  {/* Progress ring */}
  <circle
    cx="18" cy="18" r="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeDasharray={`${value}, 100`}
    strokeLinecap="round"
    className={colorClass}
    transform="rotate(-90 18 18)"
  />
</svg>
```

---

# 4. Skeleton

## Description

Placeholder loading state that mimics content shape.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'text'` \| `'circular'` \| `'rectangular'` | no | `'text'` | Shape variant |
| width | `string \| number` | no | `'100%'` | Width |
| height | `string \| number` | no | — | Height |
| lines | `number` | no | `1` | Number of text lines |
| animated | `boolean` | no | `true` | Pulse animation |

## Variants

### Text
```
████████████████████████████████████░░░░░
████████████████████████░░░░░░░░░░░░░░░░░
██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Circular
```
  ┌───┐
  │   │
  └───┘
```

### Rectangular
```
┌─────────────────────────────┐
│                             │
│                             │
└─────────────────────────────┘
```

## Styling

```css
.skeleton {
  @apply bg-gray-200 rounded;
}

.skeleton-animated {
  @apply animate-pulse;
}

.skeleton-text {
  @apply h-4 rounded;
}

.skeleton-circular {
  @apply rounded-full;
}
```

## Common Patterns

### Card Skeleton
```
┌─────────────────────────────┐
│  ┌────┐  ████████████████   │  ← Avatar + Title
│  │    │  ██████████         │  ← Avatar + Subtitle
│  └────┘                     │
│                             │
│  ████████████████████████   │  ← Body text
│  ██████████████████         │
│  ████████████               │
│                             │
│  ┌──────┐  ┌──────┐         │  ← Action buttons
│  └──────┘  └──────┘         │
└─────────────────────────────┘
```

### Table Row Skeleton
```
│ ████ │ ████████████ │ ██████ │ ████████ │
```

---

# 5. Shimmer

## Description

Animated shine effect overlay for loading states.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| width | `string` | no | `'100%'` | Container width |
| height | `string` | no | `'100%'` | Container height |

## Animation

```css
.shimmer {
  @apply relative overflow-hidden;
  @apply bg-gray-200;
}

.shimmer::after {
  @apply absolute inset-0;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

# 6. Pulse

## Description

Pulsing dot indicator for live/active states.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| size | `'sm'` \| `'md'` | no | `'md'` | Dot size |
| color | `'green'` \| `'red'` \| `'amber'` \| `'blue'` | no | `'green'` | Dot color |

## Sizes

| Size | Dimensions |
|------|------------|
| `sm` | `w-2 h-2` |
| `md` | `w-3 h-3` |

## Styling

```css
.pulse {
  @apply rounded-full;
  @apply animate-pulse;
}

.pulse-green {
  @apply bg-green-500;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}
```

## Common Uses

| Color | Use Case |
|-------|----------|
| `green` | Online status, live updates |
| `red` | Recording, urgent |
| `amber` | Processing, waiting |
| `blue` | New, notification |

---

# 7. StepDot

## Description

Step indicator dots for multi-step processes or carousels.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| total | `number` | yes | — | Total steps |
| current | `number` | yes | — | Current step (0-indexed) |
| size | `'sm'` \| `'md'` | no | `'md'` | Dot size |
| clickable | `boolean` | no | `false` | Allow clicking dots |
| onChange | `(index: number) => void` | conditional | — | Step change handler |

## Visual Structure

```
    ●   ○   ○   ○   ○
    ↑
  current
```

## Sizes

| Size | Dot Size | Gap |
|------|----------|-----|
| `sm` | `w-2 h-2` | `gap-1.5` |
| `md` | `w-2.5 h-2.5` | `gap-2` |

## States

| State | Style |
|-------|-------|
| active | `bg-secondary-500` |
| inactive | `bg-gray-300` |
| hover (clickable) | `bg-gray-400` |

---

# 8. CountdownTimer

## Description

Displays remaining time counting down.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| endTime | `Date` | yes | — | Target end time |
| format | `'hh:mm:ss'` \| `'mm:ss'` \| `'compact'` | no | `'mm:ss'` | Display format |
| onComplete | `() => void` | no | — | Completion callback |
| showLabels | `boolean` | no | `false` | Show unit labels |

## Formats

### `hh:mm:ss`
```
02:45:30
```

### `mm:ss`
```
45:30
```

### `compact`
```
2 ชม. 45 น.    or    45 น. 30 วิ.
2h 45m              45m 30s
```

### With Labels
```
02       45       30
ชั่วโมง    นาที     วินาที
hours   minutes  seconds
```

## Urgency Colors

| Time Remaining | Color |
|----------------|-------|
| > 5 minutes | `text-gray-900` |
| 1-5 minutes | `text-amber-600` |
| < 1 minute | `text-red-600` + pulse |

---

# 9. UploadProgress

## Description

Combined progress indicator for file uploads.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| fileName | `string` | yes | — | File name |
| progress | `number` | yes | — | Upload progress (0-100) |
| status | `'uploading'` \| `'complete'` \| `'error'` | yes | — | Upload status |
| onCancel | `() => void` | no | — | Cancel handler |
| onRetry | `() => void` | no | — | Retry handler |

## Visual Structure

### Uploading
```
┌─────────────────────────────────────────┐
│  📄 document.pdf               [✕]      │
│  ████████████████░░░░░░░░░░░░  65%      │
│  กำลังอัปโหลด...                         │
└─────────────────────────────────────────┘
```

### Complete
```
┌─────────────────────────────────────────┐
│  📄 document.pdf               [✓]      │
│  อัปโหลดเสร็จสิ้น                        │
└─────────────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────────────┐
│  📄 document.pdf               [↻]      │
│  อัปโหลดไม่สำเร็จ                        │
└─────────────────────────────────────────┘
```

---

*End of Indicators Atom Specification*

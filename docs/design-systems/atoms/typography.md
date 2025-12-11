# Typography

## Overview

Typography atoms define text styling for headings, body text, and special text elements. All typography uses the Kanit font family.

**Design Reference:** See `chancedee-design-guidelines.md` for font weights and letter-spacing tokens.

---

# 1. Font Family

## Primary Font

| Property | Value |
|----------|-------|
| Font Family | `Kanit, sans-serif` |
| Fallback | `system-ui, -apple-system, sans-serif` |

## Font Weights

| Weight | Name | Use Case |
|--------|------|----------|
| 200 | ExtraLight | Large decorative text |
| 300 | Light | Subtle body text |
| 400 | Regular | Body text, descriptions |
| 500 | Medium | Emphasis, labels |
| 600 | SemiBold | Headings, buttons |

---

# 2. Heading

## Description

Heading elements for page and section titles.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| level | `1` \| `2` \| `3` \| `4` \| `5` \| `6` | yes | — | Heading level |
| as | `'h1'` \| `'h2'` \| ... \| `'p'` \| `'span'` | no | `h{level}` | HTML element |
| color | `'default'` \| `'muted'` \| `'primary'` \| `'secondary'` | no | `'default'` | Text color |
| align | `'left'` \| `'center'` \| `'right'` | no | `'left'` | Text alignment |

## Heading Styles

| Level | Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|------|--------|-------------|----------------|----------|
| H1 | `text-3xl` (30px) | `font-semibold` | `leading-tight` | `tracking-wide` | Page titles |
| H2 | `text-2xl` (24px) | `font-semibold` | `leading-tight` | `tracking-wide` | Section titles |
| H3 | `text-xl` (20px) | `font-medium` | `leading-snug` | `tracking-normal` | Subsections |
| H4 | `text-lg` (18px) | `font-medium` | `leading-snug` | `tracking-normal` | Card titles |
| H5 | `text-base` (16px) | `font-medium` | `leading-normal` | `tracking-normal` | Small sections |
| H6 | `text-sm` (14px) | `font-medium` | `leading-normal` | `tracking-normal` | Labels |

## Colors

| Color | Tailwind Class |
|-------|----------------|
| `default` | `text-gray-900` |
| `muted` | `text-gray-600` |
| `primary` | `text-primary` |
| `secondary` | `text-secondary-700` |

## Responsive Scaling

| Breakpoint | H1 | H2 | H3 |
|------------|----|----|-----|
| Mobile | `text-2xl` | `text-xl` | `text-lg` |
| Tablet+ | `text-3xl` | `text-2xl` | `text-xl` |

---

# 3. Text (Body)

## Description

Body text for paragraphs and general content.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| size | `'xs'` \| `'sm'` \| `'base'` \| `'lg'` | no | `'base'` | Text size |
| weight | `'light'` \| `'normal'` \| `'medium'` \| `'semibold'` | no | `'normal'` | Font weight |
| color | `'default'` \| `'muted'` \| `'light'` \| `'primary'` \| `'error'` | no | `'default'` | Text color |
| align | `'left'` \| `'center'` \| `'right'` \| `'justify'` | no | `'left'` | Alignment |
| as | `'p'` \| `'span'` \| `'div'` | no | `'p'` | HTML element |

## Sizes

| Size | Tailwind | Pixels | Use Case |
|------|----------|--------|----------|
| `xs` | `text-xs` | 12px | Captions, footnotes |
| `sm` | `text-sm` | 14px | Secondary info, labels |
| `base` | `text-base` | 16px | Body text |
| `lg` | `text-lg` | 18px | Lead paragraphs |

## Colors

| Color | Tailwind Class | Use Case |
|-------|----------------|----------|
| `default` | `text-gray-900` | Primary content |
| `muted` | `text-gray-600` | Secondary content |
| `light` | `text-gray-400` | Tertiary, timestamps |
| `primary` | `text-primary` | Accent text |
| `error` | `text-red-600` | Error messages |

## Line Height

| Size | Line Height |
|------|-------------|
| `xs` | `leading-4` |
| `sm` | `leading-5` |
| `base` | `leading-6` |
| `lg` | `leading-7` |

---

# 4. Link

## Description

Clickable text links for navigation.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| href | `string` | yes | — | Link URL |
| size | `'sm'` \| `'base'` | no | `'base'` | Text size |
| color | `'primary'` \| `'secondary'` \| `'gray'` | no | `'secondary'` | Link color |
| underline | `'always'` \| `'hover'` \| `'none'` | no | `'hover'` | Underline style |
| external | `boolean` | no | `false` | Open in new tab |

## Colors

| Color | Default | Hover |
|-------|---------|-------|
| `primary` | `text-primary` | `text-primary-700` |
| `secondary` | `text-secondary-600` | `text-secondary-700` |
| `gray` | `text-gray-600` | `text-gray-800` |

## Styling

```css
.link {
  @apply transition-colors duration-150;
}

.link-underline-hover {
  @apply no-underline hover:underline;
}

.link-underline-always {
  @apply underline;
}
```

## External Links

When `external: true`:
- Add `target="_blank"` and `rel="noopener noreferrer"`
- Optionally show external link icon ↗

---

# 5. Label

## Description

Form field labels and section labels.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| htmlFor | `string` | no | — | Associated input ID |
| required | `boolean` | no | `false` | Show required indicator |
| optional | `boolean` | no | `false` | Show optional indicator |
| size | `'sm'` \| `'md'` | no | `'md'` | Label size |

## Visual Structure

```
ชื่อ-นามสกุล *        ← Required
Full name

หมายเหตุ (ไม่บังคับ)   ← Optional
Notes (optional)
```

## Styling

```css
.label {
  @apply block text-sm font-medium text-gray-700;
  @apply mb-1.5;
}

.label-required::after {
  content: ' *';
  @apply text-red-500;
}

.label-optional::after {
  content: ' (ไม่บังคับ)';
  @apply text-gray-400 font-normal;
}
```

---

# 6. Caption

## Description

Small text for supplementary information.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| color | `'default'` \| `'muted'` \| `'error'` \| `'success'` | no | `'muted'` | Text color |

## Colors

| Color | Tailwind Class |
|-------|----------------|
| `default` | `text-gray-600` |
| `muted` | `text-gray-400` |
| `error` | `text-red-600` |
| `success` | `text-green-600` |

## Styling

```css
.caption {
  @apply text-xs;
  @apply leading-4;
}
```

## Common Uses

| Use Case | Example |
|----------|---------|
| Input hints | "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" |
| Timestamps | "2 ชั่วโมงที่แล้ว" |
| File info | "PDF • 1.2 MB" |
| Error messages | "กรุณากรอกอีเมลให้ถูกต้อง" |

---

# 7. Quote

## Description

Styled blockquote for testimonials or highlighted text.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| author | `string` | no | — | Quote attribution |
| source | `string` | no | — | Source/title |

## Visual Structure

```
┌─────────────────────────────────────────┐
│  "ChanceDee ช่วยให้ฉันหางานได้ง่ายขึ้น   │
│   และได้งานที่ตรงใจมาก"                  │
│                                         │
│   — สมชาย ใจดี                          │
│     Software Developer                  │
└─────────────────────────────────────────┘
```

## Styling

```css
.quote {
  @apply border-l-4 border-secondary-300;
  @apply pl-4 py-2;
  @apply italic text-gray-700;
}

.quote-author {
  @apply not-italic font-medium text-gray-900;
  @apply mt-2;
}

.quote-source {
  @apply text-sm text-gray-500;
}
```

---

# 8. Code

## Description

Inline and block code formatting.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| inline | `boolean` | no | `true` | Inline or block |
| language | `string` | no | — | Code language (for syntax) |

## Inline Code

```
The `onClick` handler fires when clicked.
```

```css
.code-inline {
  @apply bg-gray-100 text-gray-800;
  @apply px-1.5 py-0.5 rounded;
  @apply font-mono text-sm;
}
```

## Code Block

```
┌─────────────────────────────────────────┐
│ const greeting = "Hello, World!";       │
│ console.log(greeting);                  │
└─────────────────────────────────────────┘
```

```css
.code-block {
  @apply bg-gray-900 text-gray-100;
  @apply p-4 rounded-lg;
  @apply font-mono text-sm;
  @apply overflow-x-auto;
}
```

---

# 9. ListText

## Description

Styled list items for bullet and numbered lists.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | `'bullet'` \| `'number'` \| `'check'` | no | `'bullet'` | List style |
| items | `string[]` | yes | — | List items |

## Types

### Bullet List
```
• First item
• Second item
• Third item
```

### Numbered List
```
1. First item
2. Second item
3. Third item
```

### Check List
```
✓ Completed item
✓ Another completed
○ Pending item
```

## Styling

```css
.list {
  @apply space-y-2;
}

.list-bullet {
  @apply list-disc list-inside;
}

.list-number {
  @apply list-decimal list-inside;
}

.list-check li::before {
  @apply text-green-500 mr-2;
}
```

---

# 10. Truncate

## Description

Text truncation with ellipsis for overflow.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| lines | `number` | no | `1` | Lines before truncate |

## Single Line

```css
.truncate-single {
  @apply truncate; /* Tailwind built-in */
}
```

## Multi-line

```css
.truncate-2 {
  @apply line-clamp-2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-3 {
  @apply line-clamp-3;
}
```

---

# 11. Letter Spacing Tokens

Based on design guidelines:

| Token | Value | Tailwind | Use Case |
|-------|-------|----------|----------|
| `wide` | `0.025em` | `tracking-wide` | H1, H2 |
| `wider` | `0.05em` | `tracking-wider` | Buttons, labels |
| `widest` | `0.1em` | `tracking-widest` | All caps text |
| `super` | `0.2em` | `tracking-[0.2em]` | Decorative |

---

# 12. Responsive Typography

## Breakpoint Adjustments

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Page H1 | `text-2xl` | `text-3xl` | `text-3xl` |
| Section H2 | `text-xl` | `text-2xl` | `text-2xl` |
| Body | `text-sm` | `text-base` | `text-base` |
| Caption | `text-xs` | `text-xs` | `text-xs` |

## Implementation

```css
.page-title {
  @apply text-2xl md:text-3xl;
  @apply font-semibold;
  @apply tracking-wide;
}

.section-title {
  @apply text-xl md:text-2xl;
  @apply font-semibold;
}
```

---

*End of Typography Atom Specification*

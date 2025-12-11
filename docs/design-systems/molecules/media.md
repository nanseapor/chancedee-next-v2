# Media

## Overview

Media molecules handle visual content display including avatars, images, documents, and galleries.

**Design Reference:** See `chancedee-design-guidelines.md` for colors.

---

# 1. Avatar

## Description

User or company profile image with fallback initials.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| src | `string` | no | — | Image URL |
| alt | `string` | yes | — | Alt text |
| name | `string` | no | — | Name for initials fallback |
| size | `'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` \| `'2xl'` | no | `'md'` | Avatar size |
| shape | `'circle'` \| `'rounded'` | no | `'circle'` | Avatar shape |
| status | `'online'` \| `'offline'` \| `'busy'` | no | — | Status indicator |
| badge | `ReactNode` | no | — | Corner badge |

## Sizes

| Size | Dimensions | Font Size | Status Dot |
|------|------------|-----------|------------|
| `xs` | `w-6 h-6` | `text-xs` | `w-1.5 h-1.5` |
| `sm` | `w-8 h-8` | `text-xs` | `w-2 h-2` |
| `md` | `w-10 h-10` | `text-sm` | `w-2.5 h-2.5` |
| `lg` | `w-12 h-12` | `text-base` | `w-3 h-3` |
| `xl` | `w-16 h-16` | `text-lg` | `w-3.5 h-3.5` |
| `2xl` | `w-24 h-24` | `text-2xl` | `w-4 h-4` |

## Visual Structure

### With Image
```
┌───────┐
│       │
│  img  │
│       │
└───────┘
```

### With Initials
```
┌───────┐
│       │
│  สช   │    ← First letters of name
│       │
└───────┘
```

### With Status
```
┌───────┐
│       │
│  img  │ 🟢   ← Status dot (bottom-right)
│       │
└───────┘
```

## Fallback Logic

| Condition | Display |
|-----------|---------|
| `src` provided and loads | Image |
| `src` fails to load | Initials from `name` |
| No `src`, `name` provided | Initials from `name` |
| No `src`, no `name` | Default user icon |

## Initials Generation

| Name | Initials |
|------|----------|
| สมชาย ใจดี | สช |
| John Doe | JD |
| Company ABC | CA |
| Single | S |

## Fallback Colors

Based on name hash for consistent colors:

| Hash Range | Background | Text |
|------------|------------|------|
| 0-1 | `bg-red-100` | `text-red-700` |
| 2-3 | `bg-orange-100` | `text-orange-700` |
| 4-5 | `bg-amber-100` | `text-amber-700` |
| 6-7 | `bg-green-100` | `text-green-700` |
| 8-9 | `bg-teal-100` | `text-teal-700` |
| 10-11 | `bg-blue-100` | `text-blue-700` |
| 12+ | `bg-purple-100` | `text-purple-700` |

## Styling

```css
.avatar {
  @apply relative inline-flex items-center justify-center;
  @apply overflow-hidden;
  @apply flex-shrink-0;
}

.avatar-circle {
  @apply rounded-full;
}

.avatar-rounded {
  @apply rounded-lg;
}

.avatar-status {
  @apply absolute bottom-0 right-0;
  @apply rounded-full border-2 border-white;
}
```

---

# 2. AvatarGroup

## Description

Stacked group of avatars with overflow indicator.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| avatars | `AvatarProps[]` | yes | — | Avatar data array |
| max | `number` | no | `4` | Max visible avatars |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Avatar size |
| onClick | `() => void` | no | — | Click handler |

## Visual Structure

```
[👤][👤][👤][+5]
  ↑   ↑   ↑   ↑
 overlap    overflow count
```

## Styling

```css
.avatar-group {
  @apply flex -space-x-2;
}

.avatar-group-item {
  @apply ring-2 ring-white;
}

.avatar-group-overflow {
  @apply bg-gray-200 text-gray-600;
  @apply text-xs font-medium;
}
```

---

# 3. CompanyLogo

## Description

Company logo display with specific sizing and fallback.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| src | `string` | no | — | Logo URL |
| name | `string` | yes | — | Company name |
| size | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | no | `'md'` | Logo size |
| verified | `boolean` | no | `false` | Show verified badge |

## Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| `sm` | `w-8 h-8` | Inline text, lists |
| `md` | `w-12 h-12` | Cards, compact views |
| `lg` | `w-16 h-16` | Headers, detail pages |
| `xl` | `w-24 h-24` | Company profile |

## Visual Structure

### With Logo
```
┌─────────┐
│   ABC   │ ✓    ← Verified badge (optional)
│  logo   │
└─────────┘
```

### Fallback
```
┌─────────┐
│         │
│   AB    │      ← First 2 letters
│         │
└─────────┘
```

## Styling

```css
.company-logo {
  @apply rounded-lg;
  @apply bg-gray-100;
  @apply flex items-center justify-center;
  @apply overflow-hidden;
}

.company-logo-verified {
  @apply absolute -bottom-1 -right-1;
  @apply bg-secondary-500 text-white;
  @apply w-5 h-5 rounded-full;
  @apply flex items-center justify-center;
}
```

---

# 4. ImagePreview

## Description

Clickable image thumbnail that opens full-size viewer.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| src | `string` | yes | — | Image URL |
| alt | `string` | yes | — | Alt text |
| aspectRatio | `'square'` \| `'video'` \| `'auto'` | no | `'auto'` | Aspect ratio |
| onOpen | `() => void` | no | — | Open viewer handler |

## Aspect Ratios

| Ratio | Tailwind | Value |
|-------|----------|-------|
| `square` | `aspect-square` | 1:1 |
| `video` | `aspect-video` | 16:9 |
| `auto` | — | Natural |

## Visual Structure

```
┌─────────────────────────────┐
│                             │
│         [Image]             │
│                             │
│                         🔍  │   ← Zoom icon on hover
└─────────────────────────────┘
```

## States

| State | Visual Change |
|-------|---------------|
| default | — |
| hover | Show zoom overlay |
| loading | Show skeleton |
| error | Show error placeholder |

## Styling

```css
.image-preview {
  @apply relative rounded-lg overflow-hidden;
  @apply cursor-pointer;
}

.image-preview-overlay {
  @apply absolute inset-0;
  @apply bg-black/30 opacity-0 hover:opacity-100;
  @apply transition-opacity duration-200;
  @apply flex items-center justify-center;
}
```

---

# 5. ImageGallery

## Description

Grid of images with lightbox viewer.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| images | `Image[]` | yes | — | Image array |
| columns | `2` \| `3` \| `4` | no | `3` | Grid columns |
| maxVisible | `number` | no | — | Max images before "+N" |

## Visual Structure

```
┌─────────┬─────────┬─────────┐
│   img   │   img   │   img   │
├─────────┼─────────┼─────────┤
│   img   │   img   │  +5 ▹   │   ← Overflow indicator
└─────────┴─────────┴─────────┘
```

## Lightbox Features

| Feature | Description |
|---------|-------------|
| Navigation | Arrow keys / swipe |
| Zoom | Pinch to zoom |
| Close | Escape / click outside |
| Counter | "3 / 10" indicator |

---

# 6. DocumentPreview

## Description

Preview card for uploaded documents (PDF, DOC, etc.).

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| document | `Document` | yes | — | Document data |
| showPreview | `boolean` | no | `true` | Show thumbnail |
| onView | `() => void` | no | — | View handler |
| onDownload | `() => void` | no | — | Download handler |
| onRemove | `() => void` | no | — | Remove handler |
| removable | `boolean` | no | `false` | Show remove button |

### Document Type

| Field | Type | Description |
|-------|------|-------------|
| name | `string` | File name |
| url | `string` | File URL |
| type | `string` | MIME type |
| size | `number` | File size (bytes) |
| uploadedAt | `Date` | Upload timestamp |

## Visual Structure

```
┌─────────────────────────────────────────┐
│  ┌───────┐                              │
│  │ PDF   │  resume.pdf             [✕]  │
│  │ icon  │  1.2 MB • อัปโหลดเมื่อวาน      │
│  └───────┘  [ดู] [ดาวน์โหลด]             │
└─────────────────────────────────────────┘
```

## File Type Icons

| Type | Icon | Color |
|------|------|-------|
| PDF | 📄 | `text-red-500` |
| DOC/DOCX | 📝 | `text-blue-500` |
| XLS/XLSX | 📊 | `text-green-500` |
| Image | 🖼️ | `text-purple-500` |
| Other | 📎 | `text-gray-500` |

## Size Formatting

| Bytes | Display |
|-------|---------|
| < 1024 | {n} B |
| < 1024² | {n} KB |
| < 1024³ | {n} MB |
| ≥ 1024³ | {n} GB |

---

# 7. VideoPlayer

## Description

Embedded video player with controls.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| src | `string` | yes | — | Video URL |
| poster | `string` | no | — | Thumbnail image |
| autoPlay | `boolean` | no | `false` | Auto play |
| controls | `boolean` | no | `true` | Show controls |
| aspectRatio | `'video'` \| `'square'` | no | `'video'` | Aspect ratio |

## Visual Structure

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│               [▶ Play]                  │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  ▶  ━━━━━━━━━━━━━━━░░░░░  1:23 / 5:00  │
│  🔊 ━━━━━━  🔲  ⛶                       │
└─────────────────────────────────────────┘
```

---

# 8. MapEmbed

## Description

Embedded map for location display.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| location | `{ lat: number, lng: number }` | yes | — | Coordinates |
| address | `string` | no | — | Address text |
| zoom | `number` | no | `15` | Zoom level |
| height | `string` | no | `'200px'` | Map height |
| interactive | `boolean` | no | `false` | Allow interaction |

## Visual Structure

```
┌─────────────────────────────────────────┐
│                                         │
│            [Map View]                   │
│                📍                       │
│                                         │
├─────────────────────────────────────────┤
│  📍 123/45 ถนนสุขุมวิท กรุงเทพฯ          │
│     [เปิดใน Google Maps]                │
└─────────────────────────────────────────┘
```

## Provider

Use Google Maps or alternative:

```jsx
<iframe
  src={`https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`}
  loading="lazy"
/>
```

---

# 9. Icon

## Description

Wrapper for icon components with consistent sizing.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| name | `string` | yes | — | Icon name |
| size | `'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | no | `'md'` | Icon size |
| color | `string` | no | `'currentColor'` | Icon color |

## Sizes

| Size | Dimensions |
|------|------------|
| `xs` | `w-3 h-3` |
| `sm` | `w-4 h-4` |
| `md` | `w-5 h-5` |
| `lg` | `w-6 h-6` |
| `xl` | `w-8 h-8` |

## Icon Library

Use Lucide React or similar:

```jsx
import { Search, Heart, User, Settings } from 'lucide-react';
```

## Common Icons

| Name | Use Case |
|------|----------|
| `search` | Search inputs |
| `heart` | Save/favorite |
| `heart-filled` | Saved state |
| `user` | Profile |
| `settings` | Settings |
| `bell` | Notifications |
| `message` | Messages |
| `calendar` | Dates, scheduling |
| `briefcase` | Jobs |
| `building` | Companies |
| `check` | Success, complete |
| `x` | Close, error |
| `chevron-down` | Dropdowns |
| `arrow-left` | Back navigation |
| `external-link` | External links |

---

*End of Media Molecule Specification*

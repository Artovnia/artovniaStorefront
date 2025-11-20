# SellerCard - Elegant Artistic Design ✅

## 🎨 Design Philosophy

**Classy • Simple • Artistic**

A refined, minimalist design that emphasizes the seller's image while maintaining elegance and simplicity. The card features clean lines, subtle animations, and a sophisticated color palette.

---

## 📐 Card Structure

### **Dimensions:**
- Width: **252px** (matches product cards)
- Height: **380px**
- Aspect Ratio: Balanced and elegant

### **Layout (60/40 Split):**

```
┌──────────────────────┐
│                      │
│   Seller Image       │
│   (60% height)       │  ← 228px
│   object-cover       │
│   + subtle gradient  │
│                      │
├──────────────────────┤  ← Decorative line
│   Seller Name        │
│   Description        │  ← 40% height (152px)
│   "Od [date]"        │
└──────────────────────┘

Background: bg-primary (#F4F0EB)
```

---

## ✨ Key Design Features

### **1. Image Section (Top 60%)**

```typescript
<div className="relative h-[60%] w-full overflow-hidden bg-[#F4F0EB]">
  <Image
    src={sellerImage}
    fill
    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
    sizes="252px"
  />
  
  {/* Subtle gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
</div>
```

**Features:**
- ✅ **Proper Image Fitting**: `object-cover object-center` ensures images fit correctly
- ✅ **Hover Effect**: Subtle scale (1.05x) on hover for depth
- ✅ **Gradient Overlay**: Soft gradient at bottom for visual depth
- ✅ **Smooth Transition**: 500ms transform for elegant animation

---

### **2. Content Section (Bottom 40%)**

```typescript
<div className="relative h-[40%] bg-primary p-4 flex flex-col justify-between">
  {/* Decorative line at top */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B3634]/20 to-transparent" />
  
  <div className="flex-1 flex flex-col justify-center">
    {/* Seller Name */}
    <h3 className="font-instrument-serif text-lg font-semibold text-[#3B3634] mb-1.5 text-center leading-tight line-clamp-2">
      {seller.name}
    </h3>
    
    {/* Short Description */}
    <p className="font-instrument-sans text-xs text-[#3B3634]/70 text-center line-clamp-2 leading-relaxed">
      {seller.description}
    </p>
  </div>

  {/* Date Badge */}
  <time className="font-instrument-sans text-[10px] text-[#3B3634]/60 uppercase tracking-wider">
    Od {formatDate(seller.created_at)}
  </time>
</div>
```

**Features:**
- ✅ **bg-primary Background**: Clean, consistent with marketplace
- ✅ **Decorative Line**: Subtle separator between image and content
- ✅ **Centered Layout**: Balanced, elegant typography
- ✅ **Hierarchy**: Name → Description → Date
- ✅ **Subtle Colors**: Muted text for sophistication

---

### **3. Hover Overlay**

```typescript
<div className={`absolute inset-0 bg-gradient-to-t from-[#3B3634]/95 via-[#3B3634]/70 to-transparent transition-opacity duration-500 ${
  isHovered ? "opacity-100" : "opacity-0"
}`}>
  <div className="text-center px-6 flex flex-col items-center gap-3"
    style={{ transform: isHovered ? "translateY(0)" : "translateY(20px)" }}
  >
    <div className="text-white space-y-2">
      <h4>{seller.name}</h4>
      <p>{seller.description}</p>
      {seller.city && <p>📍 {seller.city}</p>}
    </div>
    
    <span className="text-white font-instrument-serif text-lg flex items-center gap-2">
      Zobacz więcej
      <ArrowRightIcon size={20} color="white" />
    </span>
  </div>
</div>
```

**Features:**
- ✅ **Smooth Fade**: 500ms opacity transition
- ✅ **Slide Up**: Content slides up 20px on hover
- ✅ **Dark Gradient**: Professional overlay
- ✅ **Full Details**: Name, description, city
- ✅ **Clear CTA**: "Zobacz więcej" with arrow

---

### **4. Card Interactions**

```typescript
<Link 
  className={cn(
    "group block relative w-[252px] h-[380px]",
    "transition-all duration-300 ease-out",
    "hover:shadow-xl hover:-translate-y-1",  // Lift on hover
    "focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:ring-offset-2"
  )}
>
```

**Features:**
- ✅ **Lift Effect**: Card rises 4px on hover
- ✅ **Shadow**: Dramatic shadow on hover
- ✅ **Smooth Transition**: 300ms ease-out
- ✅ **Focus Ring**: Accessible keyboard navigation

---

## 🎨 Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| **Card Background** | `bg-primary` (#F4F0EB) | Bottom section |
| **Image Background** | `bg-[#F4F0EB]` | Top section placeholder |
| **Text Primary** | `text-[#3B3634]` | Seller name |
| **Text Secondary** | `text-[#3B3634]/70` | Description |
| **Text Tertiary** | `text-[#3B3634]/60` | Date |
| **Overlay** | `from-[#3B3634]/95` | Hover gradient |
| **Decorative Line** | `via-[#3B3634]/20` | Separator |

---

## 📊 Design Comparison

### **Before (Rounded Style):**
```
❌ Small avatar (72px)
❌ Rounded corners
❌ Gradient background
❌ Decorative rings
❌ Complex styling
❌ 240px × 320px
```

### **After (Elegant Style):**
```
✅ Large image (252px × 228px)
✅ Clean edges
✅ bg-primary background
✅ Subtle decorative line
✅ Simple, refined styling
✅ 252px × 380px
```

---

## 🎯 Design Principles

### **1. Simplicity**
- Clean layout with clear hierarchy
- Minimal decorative elements
- Focus on content

### **2. Elegance**
- Refined typography
- Subtle animations
- Sophisticated color palette
- Proper spacing

### **3. Artistic**
- Image-first approach
- Subtle gradient overlays
- Smooth transitions
- Attention to detail

### **4. Functionality**
- Proper image fitting (`object-cover`)
- Clear hover states
- Accessible design
- Responsive behavior

---

## 🔧 Technical Details

### **Image Optimization:**
```typescript
<Image
  src={seller.photo || seller.logo_url || '/images/placeholder-seller.jpg'}
  fill
  className="object-cover object-center"
  sizes="252px"
/>
```

**Features:**
- Next.js Image component for optimization
- Fallback chain: photo → logo_url → placeholder
- `object-cover` ensures proper fitting
- `object-center` for balanced cropping
- Responsive sizes for performance

---

### **Hover Animation:**
```typescript
const [isHovered, setIsHovered] = useState(false)

// Card hover
hover:shadow-xl hover:-translate-y-1

// Image zoom
group-hover:scale-105 transition-transform duration-500

// Overlay fade
opacity-100 : opacity-0

// Content slide
transform: translateY(0) : translateY(20px)
```

**Timing:**
- Card lift: 300ms
- Image zoom: 500ms
- Overlay fade: 500ms
- Content slide: 500ms

---

## 📐 Responsive Grid

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
  {sellers.map((seller) => (
    <SellerCard key={seller.id} seller={seller} />
  ))}
</div>
```

**Breakpoints:**
- Mobile (<640px): 1 column
- Tablet (640px+): 2 columns
- Desktop (1024px+): 3 columns
- Large (1536px+): 4 columns

---

## 🎨 Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| **Seller Name** | Instrument Serif | 18px (lg) | Semibold | #3B3634 |
| **Description** | Instrument Sans | 12px (xs) | Normal | #3B3634/70 |
| **Date** | Instrument Sans | 10px | Normal | #3B3634/60 |
| **Hover Name** | Instrument Serif | 20px (xl) | Semibold | White |
| **Hover Desc** | Instrument Sans | 14px (sm) | Normal | White/90 |
| **CTA** | Instrument Serif | 18px (lg) | Normal | White |

---

## ✅ Design Goals Achieved

### **Classy:**
- ✅ Refined color palette
- ✅ Elegant typography
- ✅ Sophisticated animations
- ✅ Clean, minimal design

### **Simple:**
- ✅ Clear layout
- ✅ Minimal decorative elements
- ✅ Easy to understand
- ✅ Focused content

### **Artistic:**
- ✅ Image-first approach
- ✅ Subtle visual effects
- ✅ Attention to detail
- ✅ Balanced composition

---

## 🧪 Testing Checklist

### **Visual:**
- [ ] Image fits correctly (no stretching/distortion)
- [ ] bg-primary background displays correctly
- [ ] Decorative line visible
- [ ] Text properly centered
- [ ] Date badge at bottom

### **Hover:**
- [ ] Card lifts smoothly
- [ ] Shadow appears
- [ ] Image zooms subtly
- [ ] Overlay fades in
- [ ] Content slides up
- [ ] "Zobacz więcej" displays

### **Responsive:**
- [ ] Works on all screen sizes
- [ ] Grid adjusts properly
- [ ] Text remains readable
- [ ] Images scale correctly

### **Performance:**
- [ ] Images load efficiently
- [ ] Animations smooth (60fps)
- [ ] No layout shift
- [ ] Hover responsive

---

## 📝 Summary

### **New Design:**
- **252px × 380px** elegant card
- **60/40 split** (image/content)
- **bg-primary** bottom section
- **Proper image fitting** with object-cover
- **Subtle hover overlay** with details
- **Clean, artistic aesthetic**

### **Key Improvements:**
- ✅ Images fit correctly
- ✅ bg-primary background
- ✅ Elegant, refined design
- ✅ Simple yet artistic
- ✅ Smooth animations
- ✅ Professional appearance

---

**Status**: ✅ **Complete - Elegant & Artistic Design**

**Style**: Classy, Simple, Refined

**Image Fitting**: Perfect with object-cover

**Background**: bg-primary as requested

**Hover**: Smooth overlay with full details

---

**Last Updated**: November 20, 2025  
**Design Time**: ~20 minutes  
**Complexity**: Medium  
**Impact**: High (visual consistency and elegance)

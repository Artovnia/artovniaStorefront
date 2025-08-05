# Theme Customization Guide

## Overview
This guide explains how to customize the website's colors and fonts. The theme uses:
- **Main Color**: #F4E0EB (soft pink)
- **Accent Color**: #3B3634 (dark brown) for buttons and marked items
- **Font**: "Instrument Serif"

## 🎨 How to Change Colors

### 1. Main Website Colors
**File**: `src/app/colors.css`

```css
/* Custom Theme Colors - Main: #F4E0EB, Buttons/Marked: #3B3634 */
--theme-main: 244, 224, 235; /* #F4E0EB - CHANGE THIS for main website color */
--theme-main-light: 249, 239, 245; /* Lighter shade of main color */
--theme-main-dark: 230, 200, 220; /* Darker shade of main color */
--theme-accent: 59, 54, 52; /* #3B3634 - CHANGE THIS for buttons/marked items */
--theme-accent-light: 89, 84, 82; /* Lighter shade of accent */
--theme-accent-dark: 42, 37, 35; /* Darker shade of accent */
--theme-accent-darker: 31, 27, 25; /* Even darker for pressed states */
```

**To change colors:**
1. Convert your hex color to RGB values (e.g., #F4E0EB = 244, 224, 235)
2. Update the `--theme-main` and `--theme-accent` variables
3. Adjust the light/dark variations accordingly

### 2. Background Colors
**File**: `src/app/colors.css` (lines ~93-96)

```css
/* MAIN COLORS - Change these to adjust the overall theme */
--bg-primary: rgb(var(--theme-main)); /* Main background color #F4E0EB */
--bg-secondary: rgb(var(--theme-main-light)); /* Secondary background */
--bg-tertiary: rgb(var(--theme-accent)); /* Dark background #3B3634 */
```

### 3. Button Colors
**File**: `src/app/colors.css` (lines ~103-106)

```css
/* BUTTON COLORS - Change these to adjust button appearance */
--bg-action-primary: rgb(var(--theme-accent)); /* Button background #3B3634 */
--bg-action-primary-hover: rgb(var(--theme-accent-dark)); /* Button hover */
--bg-action-primary-pressed: rgb(var(--theme-accent-darker)); /* Button pressed */
```

### 4. Individual Button Styles
**File**: `src/app/globals.css` (lines ~78-110)

```css
/* BUTTON STYLES - Modify these classes to change button appearance throughout the app */

.button-filled {
    /* Primary buttons - theme accent background with white text */
    @apply bg-[#3B3634] hover:bg-[#2A2522] active:bg-[#1F1B19] disabled:opacity-50;
}

.button-tonal {
    /* Secondary buttons - subtle theme accent background */
    @apply bg-[#3B3634]/10 hover:bg-[#3B3634]/20 active:bg-[#3B3634]/30 disabled:opacity-50;
}
```

## 🔤 How to Change Fonts

### 1. Main Font Configuration
**File**: `src/app/globals.css` (lines ~5-6)

```css
/* FONT CONFIGURATION - Change font-family here to adjust the main font */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
```

**To change the font:**
1. Replace the Google Fonts URL with your desired font
2. Update the font-family declarations below

### 2. Global Font Application
**File**: `src/app/globals.css` (lines ~11-20)

```css
/* Global font and background configuration */
* {
  font-family: 'Instrument Serif', serif; /* CHANGE THIS to your desired font */
}

body {
  font-family: 'Instrument Serif', serif; /* CHANGE THIS to match above */
  background-color: rgb(var(--theme-main)); /* Main background */
  color: rgb(var(--theme-accent)); /* Text color */
}
```

## 🛠️ Quick Color Change Examples

### Example 1: Blue Theme
```css
/* In colors.css */
--theme-main: 230, 240, 255; /* Light blue #E6F0FF */
--theme-accent: 30, 64, 175; /* Dark blue #1E40AF */
```

### Example 2: Green Theme
```css
/* In colors.css */
--theme-main: 240, 253, 244; /* Light green #F0FDF4 */
--theme-accent: 22, 101, 52; /* Dark green #166534 */
```

### Example 3: Purple Theme
```css
/* In colors.css */
--theme-main: 250, 245, 255; /* Light purple #FAF5FF */
--theme-accent: 88, 28, 135; /* Dark purple #581C87 */
```

## 📁 File Structure Summary

```
src/app/
├── colors.css          # Main color variables and theme configuration
├── globals.css         # Global styles, fonts, and component styles
└── components/atoms/Button/
    └── Button.tsx      # Individual button component (already updated)
```

## 🔄 After Making Changes

1. Save the files
2. The changes should apply automatically in development
3. For production, rebuild the application
4. Clear browser cache if changes don't appear immediately

## 💡 Tips

- Always use the CSS variables instead of hardcoded colors for consistency
- Test your color combinations for accessibility (contrast ratios)
- Keep a backup of your original colors before making changes
- Use online tools to generate color variations (lighter/darker shades)

## 🎯 Common Customization Scenarios

### Change Only Button Color
Update only the `--theme-accent` variable in `colors.css`

### Change Only Background Color
Update only the `--theme-main` variable in `colors.css`

### Change Only Font
Update the Google Fonts import and font-family declarations in `globals.css`

### Complete Theme Overhaul
Update both `--theme-main` and `--theme-accent` variables, plus font configuration

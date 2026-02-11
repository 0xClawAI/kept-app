# Kept — PRD

## Problem Statement
People doing no-spend challenges, 100 envelope challenges, and 52-week savings challenges have NO dedicated app. They use sobriety apps, generic habit trackers, spreadsheets, and printable PDFs. The one competitor charges $50/year for a basic tracker. There's a massive gap between demand (millions of TikTok views, 66K+ subreddit) and supply (one overpriced app with 65 reviews).

## Target User Persona
**Maya, 28** — Started a no-buy year after seeing #nobuy2026 on TikTok. Uses a printable PDF tracker taped to her fridge but forgets to update it. Wants to see her streak, track money saved, and share progress with friends. Would pay $10 once but refuses subscriptions for a simple tracker.

## Success Criteria
- User opens daily to log no-spend days (habit loop)
- Feels satisfying to mark days and stuff envelopes (dopamine)
- Would screenshot streaks/totals and share on social media
- Replaces 3-4 separate tools with one beautiful app

## Features

### P0 — Must Have
1. **No-Spend Calendar** — Monthly calendar view, tap days to toggle spend/no-spend, green heatmap for no-spend days, red dots for spend days
2. **Streak Counter** — Current no-spend streak, longest streak, displayed prominently with 🔥 animation
3. **100 Envelope Challenge** — 10x10 grid of numbered envelopes (1-100), tap to "stuff" (mark complete), shows progress bar and running total toward $5,050
4. **52-Week Savings Challenge** — List of weeks 1-52 with amounts ($1-$52), tap to mark complete, running total toward $1,378
5. **Dashboard/Home** — Total money saved across all challenges, active streaks, quick stats
6. **Tab Navigation** — Home, Calendar, Challenges, Log

### P1 — Should Have
7. **"Didn't Buy It" Log** — Quick-add items resisted with price, cumulative savings counter, list view with swipe-to-delete
8. **Custom No-Buy Rules** — Define personal rules (no Amazon, no takeout, etc.), checklist format, toggle active/inactive
9. **Challenge Reset** — Ability to reset any challenge and start fresh (with confirmation)

### P2 — Nice to Have
10. **Confetti/celebration animations** on milestones (7-day streak, 30-day, envelope milestones)
11. **Daily reminder notification** (Expo push notifications)

## UX Flow

### First Launch
1. App opens to Home/Dashboard tab
2. Empty state: "Start your first challenge!" with cards for each challenge type
3. Tap a challenge card → challenge view with instructions and "Start" button

### Daily Use
1. Open app → Dashboard shows streak, total saved, today's status
2. Tap Calendar tab → see month view, tap today to mark no-spend
3. Tap Challenges tab → see active challenges (100 Envelope, 52-Week)
4. Tap an envelope/week → marks it complete with satisfying animation
5. Tap Log tab → "Didn't Buy It" list, + button to add new entry

### Adding "Didn't Buy It" Entry
1. Tap + button on Log tab
2. Modal slides up: item name field, price field, optional category
3. Tap Save → item added to list, total updated
4. Entry appears in list with item name, price, date

### Editing/Deleting
- Long-press any "Didn't Buy It" entry → delete confirmation
- Long-press any no-buy rule → edit or delete options
- Calendar days: tap to toggle (spend ↔ no-spend ↔ unmarked)
- Envelopes: tap to toggle (stuffed ↔ unstuffed)
- Weeks: tap to toggle (complete ↔ incomplete)

### Empty States
- Dashboard with no challenges started: motivational message + "Get Started" CTA
- Calendar with no days marked: "Tap any day to start tracking"
- Didn't Buy It log empty: "Add items you resisted buying"
- Rules list empty: "Define your no-buy rules"

## Design System
- **Theme:** Dark mode default, rich/warm dark (not pure black)
- **Background:** #0F0F13 (near-black)
- **Surface:** #1A1A24 (cards)
- **Surface Elevated:** #242432 (modals, elevated cards)
- **Primary:** #4ADE80 (green — money/savings theme)
- **Primary Muted:** #22633D
- **Secondary:** #818CF8 (indigo/purple accent)
- **Warning:** #FBBF24 (amber)
- **Error/Destructive:** #EF4444
- **Text Primary:** #F8FAFC
- **Text Secondary:** #94A3B8
- **Text Disabled:** #475569
- **Border:** #2D2D3D
- **Streak Fire:** #F97316 (orange)

### Typography (System fonts — no custom fonts needed)
- H1: 28px, bold (700), -0.5 letter-spacing
- H2: 22px, semibold (600)
- H3: 18px, semibold (600)
- Body: 16px, regular (400), 1.5 line-height
- Caption: 13px, regular (400)
- Button: 16px, semibold (600)
- Stat Number: 36px, bold (700)

### Spacing
- Base unit: 8px
- Card padding: 16px
- Section gap: 24px
- Element gap: 12px
- Screen edge padding: 20px

### Radius
- Cards: 16px
- Buttons: 12px
- Input fields: 12px
- Modals: 20px (top corners)
- Envelope cells: 12px
- Calendar cells: 8px

### Shadows
- Cards: none (use border instead in dark mode)
- Elevated: 0 8px 32px rgba(0,0,0,0.4)

## Technical Architecture
- **Stack:** Expo (React Native), Expo Go compatible
- **Navigation:** Bottom tab navigator (expo-router or @react-navigation/bottom-tabs)
- **Storage:** AsyncStorage for all data persistence
- **Animations:** Built-in Animated API + LayoutAnimation (NO reanimated)
- **Haptics:** expo-haptics (wrapped in try/catch, lowercase enums)
- **No external APIs** — fully local/offline
- **Port:** 8081 (Expo default) with tunnel

### Data Models (AsyncStorage)
```json
{
  "noSpendDays": { "2026-02-10": "no-spend", "2026-02-09": "spend" },
  "envelopes": [3, 17, 42],  // array of stuffed envelope numbers
  "weeks": [1, 2, 3],  // array of completed week numbers
  "didntBuyIt": [
    { "id": "uuid", "name": "Coffee", "price": 5.50, "category": "Food", "date": "2026-02-10" }
  ],
  "rules": [
    { "id": "uuid", "text": "No Amazon purchases", "active": true }
  ],
  "challengeStartDates": {
    "noSpend": "2026-01-01",
    "envelope": "2026-01-15",
    "week52": "2026-01-01"
  }
}
```

### Expo Go Constraints (CRITICAL)
- NO react-native-reanimated
- NO react-native-draggable-flatlist
- NO libraries requiring custom native modules
- USE built-in Animated API + LayoutAnimation
- Haptics: try/catch, lowercase enum values ('medium', 'success')
- expo-haptics, @react-navigation/bottom-tabs, @react-navigation/native, react-native-screens, react-native-safe-area-context, @react-native-async-storage/async-storage

## Edge Cases
- What if user taps a future date? → Don't allow, only today and past dates
- What if user marks same envelope twice? → Toggle off
- What if user resets a challenge? → Confirmation dialog, data cleared
- What if app data is empty/first launch? → Beautiful empty states for every screen
- What if user hasn't opened app in days? → Dashboard shows days since last check-in
- What if 100 envelopes are all stuffed? → Celebration screen, $5,050 total shown

## Mobile App Interaction Checklist
- [x] Tap each visible element: all interactive
- [x] Add item → modal opens immediately with fields
- [x] Edit: tap to toggle for calendar/envelopes/weeks; long-press for log items
- [x] Delete: long-press + confirmation for log items and rules
- [x] Empty states for every screen defined
- [x] All libraries Expo Go compatible
- [x] Haptics wrapped in try/catch
- [x] App Store name "Kept" checked — available

# Calamity Client GUI - App Building Prompt

Build a dark-themed desktop app UI for "Calamity Client" (a Minecraft mod client). Use a dark background (#1a1a2e or similar), green accent color (#4ade80), rounded corners, and clean sans-serif typography.
Copy almost exactly from the images using this text as instructions on what to implement.

## Layout

**Left Sidebar** (fixed, ~200px wide, always visible):
- Top: CalamityCover.png icon + "Calamity Client" title + "Beta Version 0.0.1" subtitle
- **MODULES** section: Category buttons - Combat (x), Mace (x), Misc (x), Movement (x), Spear (x), Visual (x). Each shows an icon, name, and module count (x).
- **GENERAL** section: Settings, Theme, Configs, Socials, Keybinds. Each with an icon.
- Active item has a green-tinted background highlight.

**Right Content Area**: Displays the selected page.

## Pages & Components

### 1. Module Category Page
- Header: Category name + total module count + "x enabled" count
- **Gamemodes** filter button (pill-shaped)
- **View toggle**: List view (hamburger icon) / Grid view (4-dot icon)
- **Search bar**: Top-right. When focused with no text, shows "Start typing" dropdown. When typing, shows filtered results grouped by category.
- **Module cards**: Each card shows module name (bold), description text, a `>` chevron to open settings, and an **ON/OFF toggle** button. Use placeholder: "[Category] Example Module" with "Example Description". Left Click anywhere on card to toggle ON/OFF.

### 2. Module Settings Page
- Right Click **Module cards** to open the Module Settings Page
- `< Back` button to return to module list
- Module name + description at top + ON/OFF toggle
- **Settings rendered dynamically** - each setting type demonstrated once:
  - **Keybind Example**: Shows current key (e.g. "G" with keyboard icon). Click to rebind. Always on top of other settings.
  - **ON/OFF Switch Example**: Toggle (green = on, dark = off)
  - **Slider Example**: Label + description + draggable track + numeric value display (e.g. "70.00"). Green fill shows current value.
  - **Dropdown Example**: Label + description + select box. Opens a floating menu with options. Selected option has a bullet indicator.
  - **Button Group Example**: Row of pill buttons (e.g. Hold / Toggle / None). Active button is green-filled, others are outlined.

### 3. Configs Page
- Three tab buttons at top: **Public Configs**, **Personal Configs**, **Create Config**
- **Personal Configs tab**: Grid of config cards. Each card shows:
  - Config name (bold), module count badge (green circle)
  - Description text
  - Author, timestamp
  - Tags as colored pills or "No tags"
  - **Download** (green) + **Edit** (outlined) buttons
  - When **Edit** is clicked, show "Back" button, "Update" button, and Delete button as seen in "Edit-Saved-Config-Example.png"
- **Search bar**: "Search your configs -- press Enter"
- **Create Config tab**: Form with:
  - Config Name input
  - Description textarea
  - Mode dropdown (Personal / Public)
  - Tags multi-select dropdown
  - **Create** button (green)

### 4. Keybinds Page
- Header: "Keybinds" + "Manage and edit module keybindings"
- List of bound modules, each row shows:
  - Module name + category label
  - Current keybind (keyboard icon + key)
  - **Edit** button (outlined)
  - **Delete** button (outlined)

## Reusable Components

| Component | Behavior |
|-----------|----------|
| **ON/OFF Toggle** | Pill-shaped. OFF = dark bg, circle left. ON = green bg, circle right. Click to toggle. |
| **Slider** | Horizontal track with green fill from left to thumb. Numeric value box on right. Drag thumb to adjust. |
| **Dropdown** | Click to open floating menu below. Options listed vertically. Selected = bullet icon. Click option to select, menu closes. |
| **Button Group** | Row of pill buttons. Only one active (green fill). Others outlined. |
| **Search Input** | Rounded input with magnifier icon. On focus shows dropdown panel. Results grouped by section with headers. |
| **Config Card** | Rounded container with config info, tags, and action buttons. |
| **Tag Pill** | Small rounded label with category color. |

## Style Notes
- All cards/containers: rounded corners (~12px), subtle dark border or slightly lighter bg
- Text: White for headings, gray (#9ca3af) for descriptions
- Green accent (#4ade80) for active states, toggles, primary buttons
- Hover states on interactive elements
- Smooth transitions on toggles and dropdowns

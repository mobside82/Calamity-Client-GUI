Build a dark-themed desktop app UI for "Calamity Client" (a Minecraft mod client). Use a very dark, slightly green-tinted background (`#0e1311`), a mint-green accent color (`#a3d9a7`), rounded corners, and clean sans-serif typography.
Copy almost exactly from the images using this text as instructions on what to implement.

## Layout

**Left Sidebar** (fixed, ~200px wide, always visible, background: `#111713`):
- Top: CalamityCover.png icon + "Calamity Client" title + "Beta Version 0.0.1" subtitle
- **MODULES** section: Category buttons - Combat (x), Mace (x), Misc (x), Movement (x), Spear (x), Visual (x). Each shows an icon, name, and module count (x).
- **GENERAL** section: Settings, Theme, Configs, Socials, Keybinds. Each with an icon.
- Active item has a mint-green-tinted background highlight (`#293831`).

**Right Content Area**: Displays the selected page (background: `#151d19`).

## Pages & Components

### 1. Module Category Page
- Header: Category name + total module count + "x enabled" count
- **Gamemodes** filter button (pill-shaped)
- **View toggle**: List view (hamburger icon) / Grid view (4-dot icon)
- **Search bar**: Top-right. When focused with no text, shows "Start typing" dropdown. When typing, shows filtered results grouped by category.
- **Module cards** (background: `#1a231e`): Each card shows module name (bold, color `#f2f5f3`), description text (color `#8a948d`), a `>` chevron to open settings, and an **ON/OFF toggle** button. Use placeholder: "[Category] Example Module" with "Example Description". Left Click anywhere on card to toggle ON/OFF.

### 2. Module Settings Page
- Right Click **Module cards** to open the Module Settings Page
- `< Back` button to return to module list
- Module name + description at top + ON/OFF toggle
- **Settings rendered dynamically** - each setting type demonstrated once:
  - **Keybind Example**: Shows current key (e.g. "G" with keyboard icon). Click to rebind. Always on top of other settings.
  - **ON/OFF Switch Example**: Toggle (mint `#a3d9a7` = on, dark `#151d19` = off)
  - **Slider Example**: Label + description + draggable track + numeric value display (e.g. "70.00"). Fill is mint green (`#9ad2a1`), track is dark (`#36423e`).
  - **Dropdown Example**: Label + description + select box. Opens a floating menu with options. Selected option has a bullet indicator.
  - **Button Group Example**: Row of pill buttons (e.g. Hold / Toggle / None). Active button is mint-filled (`#7da889`), others are outlined (`#4a5c52`).

### 3. Configs Page
- Three tab buttons at top: **Public Configs**, **Personal Configs**, **Create Config**
- **Personal Configs tab**: Grid of config cards (background: `#1a231e`). Each card shows:
  - Config name (bold, `#f2f5f3`), module count badge (green circle, background: `#2a3a32`, text: `#a3d9a7`)
  - Description text (`#8a948d`)
  - Author, timestamp
  - Tags as colored pills (background: `#27332b`) or "No tags"
  - **Download** (mint `#7da889`) + **Edit** (outlined) buttons
  - When **Edit** is clicked, show "Back" button, "Update" button, and Delete button (red `#914746`) as seen in "Edit-Saved-Config-Example.png"
- **Search bar**: "Search your configs -- press Enter"
- **Create Config tab**: Form with:
  - Config Name input (bg: `#212d26`)
  - Description textarea
  - Mode dropdown (Personal / Public)
  - Tags multi-select dropdown
  - **Create** button (mint `#7da889`)

### 4. Keybinds Page
- Header: "Keybinds" + "Manage and edit module keybindings"
- List of bound modules, each row shows:
  - Module name + category label
  - Current keybind (keyboard icon + key)
  - **Edit** button (outlined, border `#2a3a32`)
  - **Delete** button (outlined)

## Reusable Components

| Component | Behavior |
|-----------|----------|
| **ON/OFF Toggle** | Pill-shaped. OFF = dark bg (`#1a231e`), circle left. ON = mint bg (`#a3d9a7`), circle right. Click to toggle. |
| **Slider** | Horizontal track with mint fill (`#9ad2a1`) from left to thumb. Numeric value box on right. Drag thumb to adjust. |
| **Dropdown** | Click to open floating menu below. Options listed vertically. Selected = bullet icon. Click option to select, menu closes. |
| **Button Group** | Row of pill buttons. Only one active (mint fill `#7da889`). Others outlined (`#4a5c52`). |
| **Search Input** | Rounded input with magnifier icon. On focus shows dropdown panel. Results grouped by section with headers. |
| **Config Card** | Rounded container with config info, tags, and action buttons. |
| **Tag Pill** | Small rounded label with category color. |

## Style Notes
- All cards/containers: rounded corners (~12px), subtle dark border (`#2a3a32`) or slightly lighter bg
- Text: `#f2f5f3` for headings, `#8a948d` for descriptions, `#5a6963` for placeholders
- Green accent (`#a3d9a7`) for active states, toggles, primary buttons
- Hover states on interactive elements (bg: `#293831`)
- Smooth transitions on toggles and dropdowns
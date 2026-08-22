[AGENT: bolt.new]
[TASK: Generate a Vanilla JS/CSS GUI for a Minecraft Ghost Client, optimized for JavaFX WebKit embedding.]

You are an expert frontend developer specializing in legacy-compatible web interfaces. Create a single-page application that replicates the "Prestige Client" aesthetic. 

CRITICAL CONSTRAINTS (DO NOT IGNORE):
1. NO FRAMEWORKS: Do NOT use React, Vue, Svelte, Vite, Webpack, or any build tools. Output RAW HTML, CSS, and JavaScript only.
2. SINGLE FILE OUTPUT: Provide everything in one self-contained `index.html` file with embedded `<style>` and `<script>` tags.
3. JAVAFX WEBKIT COMPATIBILITY: The target runtime is an older WebKit engine. 
   - DO NOT use `ResizeObserver`, `IntersectionObserver`, or `MutationObserver`.
   - DO NOT use CSS Container Queries, `:has()`, or modern `gap` in flexbox.
   - DO NOT use ES Modules (`import`/`export`). Use global scope or IIFEs only.
   - DO use standard CSS3 Flexbox/Grid, CSS Variables, and vanilla DOM APIs (`document.createElement`, `addEventListener`).
4. FIXED VIEWPORT: Design exclusively for 1280x720 pixels. No responsive breakpoints needed.
5. NO KEYBOARD LISTENERS FOR KEYBINDS: The WebView will not receive focus. Keybind capture is handled externally by Java. Do NOT add `keydown` listeners for binding keys.

DESIGN SPECIFICATIONS:
- Theme: Dark background (#0a0a0a), neon cyan accents (#00e5ff), font 'Inter' (fallback: system-ui, sans-serif).
- Layout:
  * Left Sidebar (240px fixed): Header ("Prestige Client" + "RELEASE" badge), category list (Combat, Mace, Misc, Movement, Spear, Visual), bottom settings placeholder.
  * Main Panel: Top bar (title, module count, search input), scrollable grid of module cards (name, description, animated toggle switch).
  * Detail Panel: Slides in from right on module click. Contains back button, module info, "Bind" button, sliders, checkboxes. Semi-transparent backdrop when active.

STATE MANAGEMENT:
- Use a single global `window.appState` object.
- Render via direct DOM manipulation. No virtual DOM.
- Search bar filters modules by name in real-time.
- Category clicks filter the module grid.
- Toggles/sliders immediately update `appState` and call the bridge.

JAVA BRIDGE INTERFACE:
The UI must interact with Java through these globals. Provide dummy implementations for browser testing:

window.java_bridge_callback = {
    toggleModule: (id, state) => console.log(`[Bridge] Toggle ${id}: ${state}`),
    updateModuleSetting: (id, key, value) => console.log(`[Bridge] Setting ${id}.${key} = ${value}`),
    startKeybindCapture: (id) => {
        console.log(`[Bridge] Capturing keybind for ${id}`);
        // Simulate Java callback after 2s for testing
        setTimeout(() => {
            if (window.updateKeybind) window.updateKeybind(id, 82); // 82 = 'R'
        }, 2000);
    }
};

// THIS FUNCTION MUST BE GLOBAL - Java calls it to update keybinds
window.updateKeybind = function(moduleId, keyCode) {
    const keyName = keyCodeToName(keyCode);
    console.log(`[UI] Keybind updated: ${moduleId} -> ${keyName} (${keyCode})`);
    // Update appState and re-render detail panel here
    if (appState.selectedModuleId === moduleId) {
        renderDetailPanel(); // Re-render to show new key name
    }
};

// Helper to convert GLFW key codes to readable names
function keyCodeToName(code) {
    const map = {
        65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G', 72: 'H',
        73: 'I', 74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 80: 'P',
        81: 'Q', 82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 88: 'X',
        89: 'Y', 90: 'Z', 48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5',
        54: '6', 55: '7', 56: '8', 57: '9', 341: 'Ctrl', 340: 'Shift', 342: 'Alt',
        256: 'Esc', 290: 'F1', 291: 'F2', 292: 'F3', 293: 'F4', 294: 'F5',
        295: 'F6', 296: 'F7', 297: 'F8', 298: 'F9', 299: 'F10', 300: 'F11', 301: 'F12'
    };
    return map[code] || `Key_${code}`;
}

INTERACTION FLOW:
1. User clicks "Bind" → UI calls `java_bridge_callback.startKeybindCapture(moduleId)` → Button text changes to "Press a key..."
2. Java captures keypress → Calls `window.updateKeybind(moduleId, keyCode)` → UI updates button text to key name and saves to appState
3. User toggles module → Calls `java_bridge_callback.toggleModule(id, newState)`
4. User adjusts slider → Calls `java_bridge_callback.updateModuleSetting(id, key, value)`

STYLING DETAILS:
- Animated toggle: Sliding pill with cyan fill when active.
- Smooth transitions on detail panel slide-in (transform + opacity).
- Hover states on all interactive elements.
- Custom scrollbar styling for module list.
- All colors defined as CSS variables for easy theming.

OUTPUT REQUIREMENT:
Provide ONE complete `index.html` file. No external dependencies. No build step. Must work when opened directly in Chrome AND when served via localhost to JavaFX WebView. Test all interactions in-browser using the dummy bridge before delivery.
[AGENT: bolt.new – generate Vanilla JS single-page UI]
[TASK: Create a fully functional dark-themed GUI that replicates the Prestige Client layout, optimized for JavaFX WebKit compatibility.]

Context:
This UI will be embedded in a JavaFX WebView (which uses an older WebKit engine). 
CRITICAL WEBKIT LIMITATIONS: 
1. Do NOT use `ResizeObserver`. It is not supported in JavaFX WebKit and will break layouts. Use standard CSS flexbox/grid and fixed dimensions.
2. Do not use modern CSS features like `container queries` or very new `gap` implementations in flexbox; stick to well-supported CSS3.
3. The WebView will NOT receive keyboard events because it’s an unfocused overlay. Keybind capture MUST be handled by Java.

Design requirements:
Theme: Dark background (#0a0a0a) with neon cyan accents (#00e5ff). Font: 'Inter' (fallback to system sans-serif).
Layout:
- Left sidebar: Fixed width (240px). Header: "Prestige Client" + "RELEASE" tag. Module categories list (Combat, Mace, Misc, Movement, Spear, Visual). Bottom section: General settings placeholders.
- Main panel: Top bar (Title, count, search bar). Module list (scrollable grid of cards with name, description, toggle switch). 
- Detail panel: Slides in from the right when a module is clicked. Contains Back button, module info, Keybind section ("Bind" button), and settings (sliders, checkboxes).

State management:
Use a single JS object `appState`. 
Render using plain DOM manipulation (no frameworks like React/Vue).
When a category is clicked, update `currentCategory` and re-render.
When a module is clicked, set `selectedModuleId` and render the detail panel.
Toggles/Sliders/Checkboxes must update `appState` and call the bridge.

Keybind Capture Flow:
1. User clicks "Bind" button. UI calls `window.java_bridge_callback.startKeybindCapture(moduleId)`. UI changes button text to "Press a key...".
2. Java listens for the keypress and calls the global function: `window.updateKeybind(moduleId, keyCode)`.
3. UI receives this, updates `appState.modules[...].settings.bind`, and re-renders.
Provide a `keyCodeToName(code)` helper to map integers (e.g., 82) to strings ("R").

Bridge interface (Dummy for browser testing):
window.java_bridge_callback = {
   toggleModule: (id, state) => console.log(`[Bridge] Toggle ${id} to ${state}`),
   updateModuleSetting: (id, key, value) => console.log(`[Bridge] ${id} ${key}=${value}`),
   startKeybindCapture: (id) => {
     console.log(`[Bridge] Starting keybind capture for ${id}`);
     setTimeout(() => { if (typeof window.updateKeybind === 'function') window.updateKeybind(id, 82); }, 2000);
   }
};

Styling details:
- Custom animated toggle switch (sliding pill).
- Search bar filters the module list by name.
- Sidebar highlights active category.
- Detail panel slides in with a semi-transparent backdrop.
- Design for a fixed 1280x720 viewport.

Output format: 
Provide the complete code in a single `index.html` file (with embedded CSS and JavaScript). Ensure it is self-contained.
Do NOT use React, Vite, or any framework. This UI runs inside JavaFX WebKit, which does not support modern React features. Rewrite everything as a SINGLE self-contained index.html file with embedded vanilla JavaScript and CSS3 only. No build step, no npm, no modules. Use plain DOM manipulation and a global appState object as specified in the original prompt.
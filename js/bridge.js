/* Java <-> WebView bridge. Dummy implementations for browser testing.
   Java (in production) replaces window.java_bridge_callback and calls
   window.updateKeybind directly. Keep everything on the global scope. */

(function () {
  "use strict";

  function keyCodeToName(code) {
    var map = {
      65: "A", 66: "B", 67: "C", 68: "D", 69: "E", 70: "F", 71: "G", 72: "H",
      73: "I", 74: "J", 75: "K", 76: "L", 77: "M", 78: "N", 79: "O", 80: "P",
      81: "Q", 82: "R", 83: "S", 84: "T", 85: "U", 86: "V", 87: "W", 88: "X",
      89: "Y", 90: "Z", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5",
      54: "6", 55: "7", 56: "8", 57: "9", 341: "Ctrl", 340: "Shift", 342: "Alt",
      256: "Esc", 290: "F1", 291: "F2", 292: "F3", 293: "F4", 294: "F5",
      295: "F6", 296: "F7", 297: "F8", 298: "F9", 299: "F10", 300: "F11", 301: "F12"
    };
    return map[code] || ("Key_" + code);
  }

  // Which module is currently waiting for a key from Java.
  window.pendingKeybindModuleId = null;

  window.java_bridge_callback = {
    toggleModule: function (id, state) {
      console.log("[Bridge] Toggle " + id + ": " + state);
    },
    updateModuleSetting: function (id, key, value) {
      console.log("[Bridge] Setting " + id + "." + key + " = " + value);
    },
    startKeybindCapture: function (id) {
      console.log("[Bridge] Capturing keybind for " + id);
      window.pendingKeybindModuleId = id;
      // Simulate Java sending a keypress back after a short delay.
      setTimeout(function () {
        if (window.pendingKeybindModuleId === id && window.updateKeybind) {
          window.updateKeybind(id, 82); // 82 = 'R'
        }
      }, 2000);
    }
  };

  // Global entry point Java invokes once it captures a physical key.
  window.updateKeybind = function (moduleId, keyCode) {
    var keyName = keyCodeToName(keyCode);
    console.log("[UI] Keybind updated: " + moduleId + " -> " + keyName + " (" + keyCode + ")");
    var mod = window.getModule(moduleId);
    if (!mod) return;
    mod.bind.key = keyName;
    if (mod.bind.mode === "None") mod.bind.mode = "Toggle";
    window.pendingKeybindModuleId = null;
    if (typeof window.rerender === "function") window.rerender();
  };

  window.keyCodeToName = keyCodeToName;
})();

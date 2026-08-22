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
      // In production Java captures the physical key and calls updateKeybind.
      // In the browser preview we listen for the next keypress ourselves so a
      // bind can be set and saved without the Java host.
      captureBrowserKey(id);
    }
  };

  // Translate a browser KeyboardEvent into the same readable names Java sends.
  function eventToKeyName(ev) {
    var code = ev.code || "";
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad[0-9]$/.test(code)) return "Num " + code.slice(6);
    if (/^F([1-9]|1[0-2])$/.test(code)) return code;
    var named = {
      ControlLeft: "Ctrl", ControlRight: "Ctrl", ShiftLeft: "Shift",
      ShiftRight: "Shift", AltLeft: "Alt", AltRight: "Alt", Space: "Space",
      Enter: "Enter", Tab: "Tab", Backspace: "Backspace", Escape: "Esc",
      ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right"
    };
    if (named[code]) return named[code];
    if (ev.key && ev.key.length === 1) return ev.key.toUpperCase();
    return ev.key || ("Key_" + (ev.keyCode || 0));
  }

  function captureBrowserKey(id) {
    function onKey(ev) {
      if (window.pendingKeybindModuleId !== id) {
        document.removeEventListener("keydown", onKey, true);
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener("keydown", onKey, true);
      if (ev.code === "Escape" || ev.key === "Escape") {
        // Cancel the capture without changing the bind.
        window.pendingKeybindModuleId = null;
        if (typeof window.rerender === "function") window.rerender();
        return;
      }
      if (ev.key === "Backspace" || ev.key === "Delete" || ev.code === "Backspace" || ev.code === "Delete") {
        // Clear the current bind.
        var mod = window.getModule(id);
        if (mod) {
          mod.bind.key = "None";
          mod.bind.mode = "None";
          window.java_bridge_callback.updateModuleSetting(id, "bindKey", "None");
        }
        window.pendingKeybindModuleId = null;
        if (typeof window.rerender === "function") window.rerender();
        return;
      }
      window.updateKeybind(id, null, eventToKeyName(ev));
    }
    document.addEventListener("keydown", onKey, true);
  }

  // Global entry point Java invokes once it captures a physical key.
  // keyName is optional; when omitted the numeric keyCode is translated.
  window.updateKeybind = function (moduleId, keyCode, keyName) {
    var name = keyName || keyCodeToName(keyCode);
    console.log("[UI] Keybind updated: " + moduleId + " -> " + name);
    var mod = window.getModule(moduleId);
    if (!mod) return;
    mod.bind.key = name;
    if (mod.bind.mode === "None") mod.bind.mode = "Toggle";
    window.pendingKeybindModuleId = null;
    if (typeof window.rerender === "function") window.rerender();
  };

  window.keyCodeToName = keyCodeToName;
  window.eventToKeyName = eventToKeyName;
})();

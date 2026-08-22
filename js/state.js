/* Global application state for the Calamity Client GUI.
   No modules / imports — everything lives on window for JavaFX WebKit. */

(function () {
  "use strict";

  // Description text for the notable modules; everything else falls back to the
  // placeholder from the design brief.
  var DESCRIPTIONS = {
    "Aim Assist": "Automatically aims at your target.",
    "Anchor Exploder": "Automatically explodes nearby respawn anchors.",
    "Auto Crystal": "Automatically places and breaks end crystals.",
    "Auto Totem": "Keeps a totem of undying in your offhand.",
    "Kill Aura": "Automatically attacks nearby entities.",
    "Velocity": "Reduces or cancels incoming knockback.",
    "Shield Drain": "Drains an opponent's shield with a mace.",
    "Trails": "Renders a colored trail behind players.",
    "Auto Drain": "Automatically drains anchors around targets.",
    "Silent Aim": "Aims at targets without moving your camera.",
    "ESP": "Highlights entities through walls.",
    "Full Bright": "Removes darkness from the world."
  };

  var CATEGORIES = [
    {
      id: "combat", name: "Combat", icon: "sword",
      modules: [
        "Aim Assist", "Anchor Exploder", "Anchor Macro", "Anchor Placer",
        "Anti Action", "Anti Bot", "Auto Anchor", "Auto Cart", "Auto Crystal",
        "Auto Drain", "Auto Elytra", "Auto Hit Crystal", "Auto Totem", "Auto Pot",
        "Auto Web", "Bed Aura", "Burrow", "Crystal Aura", "Fast Place", "Hitbox",
        "Hole Filler", "Kill Aura", "Offhand", "Ping Spoof", "Reach", "Self Trap",
        "Shield Breaker", "Silent Aim", "Surround", "Trap", "Trigger Bot",
        "Velocity", "Web Macro", "Auto Double Hand", "Criticals"
      ]
    },
    {
      id: "mace", name: "Mace", icon: "hammer",
      modules: [
        "Shield Drain", "Mace Combo", "Wind Charge", "Smash Attack", "Auto Mace",
        "Mace Aura", "Density Boost", "Breach Assist", "Fall Stack", "Combo Macro",
        "Mace Switch", "Anti Bounce"
      ]
    },
    {
      id: "misc", name: "Misc", icon: "wrench",
      modules: [
        "Auto Fish", "Auto Sprint", "Chat Suffix", "Fake Player", "Name Protect",
        "No Rotate", "Packet Fly Notify", "Portal GUI", "Sound Blocker", "Timer",
        "Auto Respawn", "Auto Reconnect", "Chat Encrypt", "Server Info", "Auto Tool",
        "Auto Sign", "Middle Click Extra", "No Push", "Anti AFK", "Client Spoof",
        "Auto Eat", "Auto Walk", "Free Look", "Nuker", "Fast Use"
      ]
    },
    {
      id: "movement", name: "Movement", icon: "footprints",
      modules: [
        "Sprint", "Speed", "No Slow", "Step", "Fly", "Velocity Boost", "Long Jump",
        "Safe Walk", "Spider", "Elytra Flight", "Strafe"
      ]
    },
    {
      id: "spear", name: "Spear", icon: "spear",
      modules: ["Trident Aura", "Auto Spear", "Riptide Boost", "Impale Assist"]
    },
    {
      id: "visual", name: "Visual", icon: "eye",
      modules: [
        "Trails", "ESP", "Nametags", "Full Bright", "No Hurt Cam", "HUD", "Chams",
        "Storage ESP", "Item Physics", "Free Cam", "Xray", "Tracers", "Shader",
        "Breadcrumbs", "No Weather", "Zoom", "Waypoints", "Block Highlight",
        "Health Tags", "Radar", "Custom Font", "Motion Blur", "Time Changer",
        "Skin Blinker"
      ]
    }
  ];

  // Modules that start enabled, keyed by module id, plus their default keybind.
  var PRESET = {
    "combat-aim-assist": { enabled: true, mode: "Toggle", key: "G" },
    "combat-auto-crystal": { enabled: true, mode: "Hold", key: "V" },
    "combat-auto-totem": { enabled: true },
    "combat-kill-aura": { enabled: true, mode: "Toggle", key: "R" },
    "combat-velocity": { enabled: true },
    "visual-esp": { enabled: true },
    "visual-full-bright": { enabled: true, mode: "Toggle", key: "B" }
  };

  function slug(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function defaultSettings() {
    return {
      mode: "Players",
      target: "Closest",
      fov: 90,
      range: 5,
      sticky: true,
      walls: false,
      rotate: true
    };
  }

  var modules = [];
  CATEGORIES.forEach(function (cat) {
    cat.count = cat.modules.length;
    cat.modules.forEach(function (name) {
      var id = cat.id + "-" + slug(name);
      var preset = PRESET[id] || {};
      modules.push({
        id: id,
        name: name,
        category: cat.id,
        categoryName: cat.name,
        description: DESCRIPTIONS[name] || "Example Description",
        enabled: !!preset.enabled,
        bind: { mode: preset.mode || "None", key: preset.key || "None" },
        settings: defaultSettings()
      });
    });
  });

  var configs = [
    {
      id: "cfg-semi-legit", name: "Semi-Legit SMP", moduleCount: 5,
      description: "A little bit of everything.", author: "You",
      timestamp: "2 days ago", mode: "Personal",
      tags: ["Sword", "Legit", "Blatant"]
    },
    {
      id: "cfg-mace-op", name: "Mace OP", moduleCount: 2,
      description: "Not blatant, just over powered.", author: "You",
      timestamp: "5 days ago", mode: "Personal", tags: []
    },
    {
      id: "cfg-crystal-op", name: "Crystal OP", moduleCount: 2,
      description: "Over Powered Crystal Config.", author: "You",
      timestamp: "1 week ago", mode: "Personal", tags: ["Crystal", "Blatant"]
    },
    {
      id: "cfg-example", name: "Example Config", moduleCount: 1,
      description: "Example Description", author: "You",
      timestamp: "2 weeks ago", mode: "Personal", tags: []
    }
  ];

  window.appState = {
    categories: CATEGORIES,
    modules: modules,
    configs: configs,
    // Navigation
    view: "category",          // category | settings | configs | keybinds | settings-page | theme | socials
    currentCategory: "combat",
    selectedModuleId: null,
    moduleView: "list",        // list | grid
    // Search
    search: "",
    searchOpen: false,
    // Configs
    configTab: "personal",     // public | personal | create
    editingConfigId: null,
    createForm: { name: "", description: "", mode: "Personal", tags: [] }
  };

  window.TAG_OPTIONS = ["Sword", "Crystal", "Mace", "Legit", "Blatant", "PvP", "SMP"];

  window.getModule = function (id) {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].id === id) return modules[i];
    }
    return null;
  };

  window.modulesForCategory = function (catId) {
    return modules.filter(function (m) { return m.category === catId; });
  };

  window.categoryById = function (catId) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === catId) return CATEGORIES[i];
    }
    return null;
  };
})();

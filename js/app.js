/* Rendering + interactions. Plain DOM manipulation, single global appState.
   No frameworks, no observers, no ES modules (JavaFX WebKit safe). */

(function () {
  "use strict";

  var el = window.el, icon = window.icon;
  var state = window.appState;

  // Transient UI flags that should not persist in appState.
  window.ui = { openMenus: {} };

  var root = document.getElementById("app");

  /* ------------------------------------------------------------------ */
  /* Top-level render                                                    */
  /* ------------------------------------------------------------------ */

  function rerender() {
    window.clearNode(root);
    root.appendChild(
      el("div.frame", {}, [renderSidebar(), renderContent()])
    );
  }
  window.rerender = rerender;

  /* ------------------------------------------------------------------ */
  /* Sidebar                                                             */
  /* ------------------------------------------------------------------ */

  function renderSidebar() {
    var brand = el("div.brand", {}, [
      el("div.brand-logo", {}, [el("img", { src: "assets/logo.png", alt: "Calamity" })]),
      el("div.brand-text", {}, [
        el("div.brand-title", { html: '<span>Calamity</span> <em>Client</em>' }),
        el("div.brand-sub", { text: "Beta Version 0.0.1" })
      ])
    ]);
    brand.style.cursor = "pointer";
    brand.addEventListener("click", function () {
      state.view = "brand";
      state.selectedModuleId = null;
      rerender();
    });

    var modItems = state.categories.map(function (cat) {
      var active = state.view === "category" && state.currentCategory === cat.id;
      return el("button.nav-item" + (active ? ".active" : ""), {
        onclick: function () {
          state.view = "category";
          state.currentCategory = cat.id;
          state.selectedModuleId = null;
          rerender();
        }
      }, [
        icon(cat.icon, 18),
        el("span.nav-label", { text: cat.name }),
        el("span.nav-count", { text: "(" + cat.count + ")" })
      ]);
    });

    var general = [
      { key: "settings", name: "Settings", icon: "settings" },
      { key: "theme", name: "Theme", icon: "palette" },
      { key: "configs", name: "Configs", icon: "folder" },
      { key: "socials", name: "Socials", icon: "users" },
      { key: "keybinds", name: "Keybinds", icon: "keyboard" }
    ].map(function (item) {
      var active = state.view === item.key;
      return el("button.nav-item" + (active ? ".active" : ""), {
        onclick: function () {
          state.view = item.key;
          state.selectedModuleId = null;
          rerender();
        }
      }, [icon(item.icon, 18), el("span.nav-label", { text: item.name })]);
    });

    return el("aside.sidebar", {}, [
      brand,
      el("div.nav-section-label", { text: "MODULES" }),
      el("div.nav-group", {}, modItems),
      el("div.nav-section-label", { text: "GENERAL" }),
      el("div.nav-group", {}, general)
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Content dispatch                                                    */
  /* ------------------------------------------------------------------ */

  function renderContent() {
    var body;
    switch (state.view) {
      case "category": body = renderCategoryPage(); break;
      case "module": body = renderModulePage(); break;
      case "brand": body = renderBrandPage(); break;
      case "configs": body = renderConfigsPage(); break;
      case "keybinds": body = renderKeybindsPage(); break;
      case "settings": body = renderGeneralPage("Settings", "Client preferences and general options."); break;
      case "theme": body = renderGeneralPage("Theme", "Customize the accent color and appearance."); break;
      case "socials": body = renderGeneralPage("Socials", "Join the community and follow for updates."); break;
      default: body = renderCategoryPage();
    }
    return el("main.content", {}, [body]);
  }

  /* ------------------------------------------------------------------ */
  /* Category / module list page                                         */
  /* ------------------------------------------------------------------ */

  function renderCategoryPage() {
    var cat = window.categoryById(state.currentCategory);
    var mods = window.modulesForCategory(cat.id);
    var enabled = mods.filter(function (m) { return m.enabled; }).length;

    var header = el("div.page-head", {}, [
      el("div.page-title", { html: "<span>" + cat.name + "</span> <em>Modules</em>" }),
      el("div.page-sub", { text: cat.count + " modules \u00b7 " + enabled + " enabled" })
    ]);

    var controls = el("div.list-controls", {}, [
      el("div.controls-left", {}, [
        el("button.pill-btn", {}, [icon("chevron-down", 14), el("span", { text: "Gamemodes" })]),
        el("div.view-toggle", {}, [
          viewButton("list"),
          viewButton("grid")
        ])
      ]),
      renderSearch(mods)
    ]);

    var cards = mods.map(function (m) { return renderModuleCard(m); });
    var listWrap = el("div." + (state.moduleView === "grid" ? "module-grid" : "module-list"), {}, cards);

    return el("div.page", {}, [
      el("div.page-top", {}, [header]),
      controls,
      el("div.scroll-area", {}, [listWrap])
    ]);
  }

  function viewButton(kind) {
    var active = state.moduleView === kind;
    return el("button.icon-btn" + (active ? ".active" : ""), {
      title: kind === "list" ? "List view" : "Grid view",
      onclick: function () { state.moduleView = kind; rerender(); }
    }, [icon(kind, 16)]);
  }

  function renderModuleCard(m) {
    var grid = state.moduleView === "grid";
    var openSettings = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      state.view = "module";
      state.selectedModuleId = m.id;
      rerender();
    };

    var card = el("div.module-card" + (grid ? ".grid" : "") + (m.enabled ? ".on" : ""), {
      oncontextmenu: openSettings,
      onclick: function (ev) {
        if (ev.target.closest(".module-info")) return;
        toggleModule(m);
      }
    }, [
      el("div.module-info", {}, [
        el("div.module-name", { text: m.name }),
        el("div.module-desc", { text: m.description })
      ]),
      el("div.module-actions", {}, [
        el("button.chevron-btn", {
          title: "Settings",
          onclick: openSettings
        }, [icon("chevron-right", 18)]),
        makeToggle(m.enabled, function (ev) { ev.stopPropagation(); toggleModule(m); })
      ])
    ]);
    return card;
  }

  function toggleModule(m) {
    m.enabled = !m.enabled;
    window.java_bridge_callback.toggleModule(m.id, m.enabled);
    rerender();
  }

  /* ------------------------------------------------------------------ */
  /* Search                                                              */
  /* ------------------------------------------------------------------ */

  function renderSearch() {
    var wrap = el("div.search-wrap", {});
    var input = el("input.search-input", {
      type: "text",
      placeholder: "Search modules...",
      value: state.search
    });
    var panel = el("div.search-panel", {});
    panel.style.display = "none";

    var bestMatch = null;

    function selectResult(m) {
      state.search = "";
      state.searchOpen = false;
      state.view = "module";
      state.selectedModuleId = m.id;
      state.currentCategory = m.category;
      rerender();
    }

    // Rank a module against the query: exact prefix beats a later match, and
    // shorter names win ties (so "Ai" prefers "Aim Assist").
    function scoreOf(name, q) {
      var lower = name.toLowerCase();
      var idx = lower.indexOf(q);
      if (idx === -1) return Infinity;
      return (idx === 0 ? 0 : 1000) + idx * 10 + lower.length * 0.01;
    }

    function updatePanel() {
      window.clearNode(panel);
      bestMatch = null;
      var q = state.search.trim().toLowerCase();
      if (!q) {
        panel.appendChild(el("div.search-empty", {}, [
          icon("search", 20),
          el("span", { text: "Start typing" })
        ]));
        return;
      }
      var groups = {};
      var bestScore = Infinity;
      state.modules.forEach(function (m) {
        if (m.name.toLowerCase().indexOf(q) !== -1) {
          (groups[m.categoryName] = groups[m.categoryName] || []).push(m);
          var s = scoreOf(m.name, q);
          if (s < bestScore) { bestScore = s; bestMatch = m; }
        }
      });
      var names = Object.keys(groups);
      if (!names.length) {
        panel.appendChild(el("div.search-empty", {}, [el("span", { text: "No modules found" })]));
        return;
      }
      names.forEach(function (catName) {
        panel.appendChild(el("div.search-group-label", { text: catName }));
        groups[catName].forEach(function (m) {
          var isBest = bestMatch && m.id === bestMatch.id;
          var row = el("div.search-result" + (isBest ? ".highlight" : ""), {}, [
            el("span.sr-name", { text: m.name }),
            el("span.sr-cat", { text: m.categoryName })
          ]);
          row.addEventListener("mousedown", function (ev) {
            ev.preventDefault();
            selectResult(m);
          });
          panel.appendChild(row);
        });
      });
    }

    input.addEventListener("focus", function () {
      panel.style.display = "block";
      updatePanel();
    });
    input.addEventListener("blur", function () {
      setTimeout(function () { panel.style.display = "none"; }, 120);
    });
    input.addEventListener("input", function () {
      state.search = input.value;
      updatePanel();
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && bestMatch) {
        ev.preventDefault();
        selectResult(bestMatch);
      }
    });

    wrap.appendChild(el("div.search-box", {}, [icon("search", 16), input]));
    wrap.appendChild(panel);
    return wrap;
  }

  /* ------------------------------------------------------------------ */
  /* Module settings page                                                */
  /* ------------------------------------------------------------------ */

  function renderModulePage() {
    var m = window.getModule(state.selectedModuleId);
    if (!m) { state.view = "category"; return renderCategoryPage(); }

    var back = el("button.back-btn", {
      onclick: function () { state.view = "category"; state.currentCategory = m.category; rerender(); }
    }, [icon("arrow-left", 16), el("span", { text: "Back" })]);

    var head = el("div.module-head", {}, [
      el("div.module-head-info", {}, [
        el("div.module-head-name", { text: m.name }),
        el("div.module-head-desc", { text: m.description })
      ]),
      makeToggle(m.enabled, function () { toggleModule(m); })
    ]);

    var settings = el("div.settings-list", {}, [
      keybindRow(m),
      dropdownRow(m, "mode", "Mode", "Aims at players or end crystals.", ["Players", "End Crystals"]),
      dropdownRow(m, "target", "Target", "Which entity to prioritize.", ["Closest", "Crosshair", "Lowest HP", "Lowest Armor"]),
      sliderRow(m, "fov", "Fov", "Field of view used to find targets.", 0, 360),
      sliderRow(m, "range", "Range", "Maximum distance to a target.", 0, 10),
      switchRow(m, "sticky", "Sticky Targeting", "Keep attacking the same target."),
      switchRow(m, "walls", "Through Walls", "Target entities behind blocks."),
      switchRow(m, "rotate", "Only On Rotate", "Only act while rotating.")
    ]);

    return el("div.page", {}, [
      el("div.page-top", {}, [back]),
      el("div.scroll-area", {}, [
        el("div.module-detail", {}, [head, settings])
      ])
    ]);
  }

  function keybindRow(m) {
    var pending = window.pendingKeybindModuleId === m.id;
    var modes = ["Hold", "Toggle", "None"].map(function (mode) {
      return el("button.grp-btn" + (m.bind.mode === mode ? ".active" : ""), {
        onclick: function () {
          m.bind.mode = mode;
          if (mode === "None") m.bind.key = "None";
          window.java_bridge_callback.updateModuleSetting(m.id, "bindMode", mode);
          rerender();
        }
      }, [el("span", { text: mode })]);
    });

    var keyBox = el("button.key-box" + (pending ? ".pending" : ""), {
      onclick: function () {
        if (pending) return;
        window.java_bridge_callback.startKeybindCapture(m.id);
        rerender();
      }
    }, [icon("keyboard", 14), el("span", { text: pending ? "Press a key..." : m.bind.key })]);

    return el("div.setting-row.keybind-row", {}, [
      el("div.setting-info", {}, [
        el("div.setting-label", { text: "Bind" }),
        el("div.setting-desc", { text: "Keybind for this module." })
      ]),
      el("div.setting-control", {}, [
        el("div.btn-group", {}, modes),
        keyBox
      ])
    ]);
  }

  function switchRow(m, key, label, desc) {
    return el("div.setting-row", {}, [
      el("div.setting-info", {}, [
        el("div.setting-label", { text: label }),
        el("div.setting-desc", { text: desc })
      ]),
      makeToggle(m.settings[key], function () {
        m.settings[key] = !m.settings[key];
        window.java_bridge_callback.updateModuleSetting(m.id, key, m.settings[key]);
        rerender();
      })
    ]);
  }

  function sliderRow(m, key, label, desc, min, max) {
    var valueBox = el("button.slider-value", {
      title: "Click to type an exact value",
      text: Number(m.settings[key]).toFixed(2)
    });
    var input = el("input.slider", {
      type: "range", min: min, max: max, step: "0.01",
      value: m.settings[key]
    });
    function paint() {
      var pct = ((input.value - min) / (max - min)) * 100;
      input.style.background =
        "linear-gradient(to right, var(--slider-fill) 0%, var(--slider-fill) " + pct +
        "%, var(--slider-track) " + pct + "%, var(--slider-track) 100%)";
    }
    function apply(value) {
      m.settings[key] = value;
      input.value = value;
      valueBox.textContent = value.toFixed(2);
      window.java_bridge_callback.updateModuleSetting(m.id, key, value);
      paint();
    }
    input.addEventListener("input", function () {
      apply(parseFloat(input.value));
    });

    // Click the value to type an exact, validated value.
    valueBox.addEventListener("click", function () {
      var editor = el("input.slider-value-input", {
        type: "text",
        value: m.settings[key].toFixed(2)
      });
      valueBox.parentNode.replaceChild(editor, valueBox);
      editor.focus();
      editor.select();

      var done = false;
      function commit(save) {
        if (done) return;
        done = true;
        if (save) {
          var num = parseFloat(editor.value);
          if (!isNaN(num)) {
            num = Math.min(max, Math.max(min, num));
            apply(num);
          }
        }
        if (editor.parentNode) editor.parentNode.replaceChild(valueBox, editor);
      }
      editor.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") { ev.preventDefault(); commit(true); }
        else if (ev.key === "Escape") { ev.preventDefault(); commit(false); }
      });
      editor.addEventListener("blur", function () { commit(true); });
    });

    paint();

    return el("div.setting-row.slider-row", {}, [
      el("div.slider-head", {}, [
        el("div.setting-info", {}, [
          el("div.setting-label", { text: label }),
          el("div.setting-desc", { text: desc })
        ]),
        valueBox
      ]),
      input
    ]);
  }

  function dropdownRow(m, key, label, desc, options) {
    var menuId = "set-" + m.id + "-" + key;
    var open = !!window.ui.openMenus[menuId];
    var select = el("button.select-box", {
      onclick: function () { toggleMenu(menuId); }
    }, [el("span", { text: m.settings[key] }), icon("chevron-down", 14)]);

    var control = el("div.setting-control.dropdown-control", {}, [select]);
    if (open) {
      control.appendChild(el("div.dropdown-menu", {}, options.map(function (opt) {
        var sel = m.settings[key] === opt;
        return el("button.dropdown-option" + (sel ? ".selected" : ""), {
          onclick: function () {
            m.settings[key] = opt;
            window.java_bridge_callback.updateModuleSetting(m.id, key, opt);
            window.ui.openMenus[menuId] = false;
            rerender();
          }
        }, [el("span.bullet", {}), el("span", { text: opt })]);
      })));
    }

    return el("div.setting-row", {}, [
      el("div.setting-info", {}, [
        el("div.setting-label", { text: label }),
        el("div.setting-desc", { text: desc })
      ]),
      control
    ]);
  }

  function toggleMenu(id) {
    var open = !!window.ui.openMenus[id];
    window.ui.openMenus = {};
    window.ui.openMenus[id] = !open;
    rerender();
  }

  /* ------------------------------------------------------------------ */
  /* Reusable toggle                                                     */
  /* ------------------------------------------------------------------ */

  function makeToggle(on, handler) {
    return el("button.toggle" + (on ? ".on" : ""), { onclick: handler }, [
      el("span.toggle-knob", {})
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Configs page                                                        */
  /* ------------------------------------------------------------------ */

  function renderConfigsPage() {
    var tabs = el("div.config-tabs", {}, [
      configTab("public", "Public Configs"),
      configTab("personal", "Personal Configs"),
      configTab("create", "Create Config")
    ]);

    var head = el("div.page-top", {}, [
      el("div.page-head", {}, [
        el("div.page-title", { html: "<em>Configs</em>" }),
        el("div.page-sub", { text: "Manage and share your module configurations." })
      ]),
      tabs
    ]);

    var body;
    if (state.configTab === "create") body = renderCreateForm();
    else if (state.configTab === "public") body = renderConfigList(true);
    else body = renderConfigList(false);

    return el("div.page", {}, [head, el("div.scroll-area", {}, [body])]);
  }

  function configTab(key, label) {
    return el("button.config-tab" + (state.configTab === key ? ".active" : ""), {
      onclick: function () {
        state.configTab = key;
        state.editingConfigId = null;
        rerender();
      }
    }, [el("span", { text: label })]);
  }

  function renderConfigList(isPublic) {
    var search = el("div.config-search", {}, [
      el("div.search-box.wide", {}, [
        icon("search", 16),
        el("input.search-input", { type: "text", placeholder: "Search your configs -- press Enter" })
      ])
    ]);

    if (isPublic) {
      return el("div", {}, [
        search,
        el("div.empty-state", {}, [
          icon("folder", 28),
          el("div.empty-title", { text: "No public configs yet" }),
          el("div.empty-sub", { text: "Published configs from the community will appear here." })
        ])
      ]);
    }

    var cards = state.configs.map(function (cfg) {
      return state.editingConfigId === cfg.id ? renderConfigEdit(cfg) : renderConfigCard(cfg);
    });
    return el("div", {}, [search, el("div.config-grid", {}, cards)]);
  }

  function renderConfigCard(cfg) {
    var tags = cfg.tags.length
      ? el("div.tag-row", {}, cfg.tags.map(function (t) { return el("span.tag-pill", { text: t }); }))
      : el("div.tag-row", {}, [el("span.no-tags", { text: "No tags" })]);

    return el("div.config-card", {}, [
      el("div.config-card-head", {}, [
        el("div.config-name", { text: cfg.name }),
        el("div.config-badge", { text: String(cfg.moduleCount) })
      ]),
      el("div.config-desc", { text: cfg.description }),
      el("div.config-meta", { text: "by " + cfg.author + " \u00b7 " + cfg.timestamp }),
      tags,
      el("div.config-actions", {}, [
        el("button.btn.btn-primary", {}, [icon("download", 15), el("span", { text: "Download" })]),
        el("button.btn.btn-outline", {
          onclick: function () { state.editingConfigId = cfg.id; rerender(); }
        }, [icon("pencil", 15), el("span", { text: "Edit" })])
      ])
    ]);
  }

  function renderConfigEdit(cfg) {
    var nameInput = el("input.field-input", { type: "text", value: cfg.name });
    var descInput = el("textarea.field-textarea", { rows: "3" });
    descInput.value = cfg.description;

    return el("div.config-card.editing", {}, [
      el("div.field", {}, [
        el("label.field-label", { text: "Config Name" }), nameInput
      ]),
      el("div.field", {}, [
        el("label.field-label", { text: "Description" }), descInput
      ]),
      el("div.config-actions", {}, [
        el("button.btn.btn-outline", {
          onclick: function () { state.editingConfigId = null; rerender(); }
        }, [icon("arrow-left", 15), el("span", { text: "Back" })]),
        el("button.btn.btn-primary", {
          onclick: function () {
            cfg.name = nameInput.value.trim() || cfg.name;
            cfg.description = descInput.value.trim() || cfg.description;
            state.editingConfigId = null;
            rerender();
          }
        }, [icon("check", 15), el("span", { text: "Update" })]),
        el("button.btn.btn-danger", {
          onclick: function () {
            state.configs = state.configs.filter(function (c) { return c.id !== cfg.id; });
            state.editingConfigId = null;
            rerender();
          }
        }, [icon("trash", 15), el("span", { text: "Delete" })])
      ])
    ]);
  }

  function renderCreateForm() {
    var form = state.createForm;
    var nameInput = el("input.field-input", { type: "text", placeholder: "My awesome config", value: form.name });
    nameInput.addEventListener("input", function () { form.name = nameInput.value; });
    var descInput = el("textarea.field-textarea", { rows: "3", placeholder: "Describe what this config does..." });
    descInput.value = form.description;
    descInput.addEventListener("input", function () { form.description = descInput.value; });

    // Mode dropdown
    var modeMenu = "create-mode";
    var modeControl = el("div.dropdown-control", {}, [
      el("button.select-box.wide", { onclick: function () { toggleMenu(modeMenu); } },
        [el("span", { text: form.mode }), icon("chevron-down", 14)])
    ]);
    if (window.ui.openMenus[modeMenu]) {
      modeControl.appendChild(el("div.dropdown-menu", {}, ["Personal", "Public"].map(function (opt) {
        return el("button.dropdown-option" + (form.mode === opt ? ".selected" : ""), {
          onclick: function () { form.mode = opt; window.ui.openMenus[modeMenu] = false; rerender(); }
        }, [el("span.bullet", {}), el("span", { text: opt })]);
      })));
    }

    // Tags multi-select
    var tagMenu = "create-tags";
    var tagLabel = form.tags.length ? form.tags.join(", ") : "Select tags";
    var tagControl = el("div.dropdown-control", {}, [
      el("button.select-box.wide", { onclick: function () { toggleMenu(tagMenu); } },
        [el("span" + (form.tags.length ? "" : ".placeholder"), { text: tagLabel }), icon("chevron-down", 14)])
    ]);
    if (window.ui.openMenus[tagMenu]) {
      tagControl.appendChild(el("div.dropdown-menu", {}, window.TAG_OPTIONS.map(function (opt) {
        var sel = form.tags.indexOf(opt) !== -1;
        return el("button.dropdown-option" + (sel ? ".selected" : ""), {
          onclick: function () {
            if (sel) form.tags = form.tags.filter(function (t) { return t !== opt; });
            else form.tags = form.tags.concat([opt]);
            rerender();
          }
        }, [el("span.check", {}, sel ? [icon("check", 12)] : []), el("span", { text: opt })]);
      })));
    }

    var createBtn = el("button.btn.btn-primary.btn-block", {
      onclick: function () {
        var name = form.name.trim();
        if (!name) { nameInput.focus(); return; }
        state.configs.unshift({
          id: "cfg-" + Date.now(),
          name: name,
          moduleCount: 0,
          description: form.description.trim() || "Example Description",
          author: "You",
          timestamp: "just now",
          mode: form.mode,
          tags: form.tags.slice()
        });
        state.createForm = { name: "", description: "", mode: "Personal", tags: [] };
        state.configTab = "personal";
        rerender();
      }
    }, [icon("plus", 16), el("span", { text: "Create" })]);

    return el("div.create-form", {}, [
      el("div.field", {}, [el("label.field-label", { text: "Config Name" }), nameInput]),
      el("div.field", {}, [el("label.field-label", { text: "Description" }), descInput]),
      el("div.field", {}, [el("label.field-label", { text: "Mode" }), modeControl]),
      el("div.field", {}, [el("label.field-label", { text: "Tags" }), tagControl]),
      createBtn
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Keybinds page                                                       */
  /* ------------------------------------------------------------------ */

  function renderKeybindsPage() {
    var bound = state.modules.filter(function (m) { return m.bind.key !== "None"; });

    var head = el("div.page-top", {}, [
      el("div.page-head", {}, [
        el("div.page-title", { html: "<em>Keybinds</em>" }),
        el("div.page-sub", { text: "Manage and edit module keybindings." })
      ])
    ]);

    var rows;
    if (!bound.length) {
      rows = el("div.empty-state", {}, [
        icon("keyboard", 28),
        el("div.empty-title", { text: "No keybinds set" }),
        el("div.empty-sub", { text: "Bind a key from any module's settings page." })
      ]);
    } else {
      rows = el("div.keybind-list", {}, bound.map(function (m) {
        return el("div.keybind-item", {}, [
          el("div.kb-info", {}, [
            el("div.kb-name", { text: m.name }),
            el("div.kb-cat", { text: m.categoryName })
          ]),
          el("div.kb-actions", {}, [
            el("div.key-display", {}, [icon("keyboard", 14), el("span", { text: m.bind.key })]),
            el("button.btn.btn-outline.sm", {
              onclick: function () {
                state.view = "module"; state.selectedModuleId = m.id; rerender();
              }
            }, [icon("pencil", 14), el("span", { text: "Edit" })]),
            el("button.btn.btn-outline.sm", {
              onclick: function () {
                m.bind.key = "None"; m.bind.mode = "None"; rerender();
              }
            }, [icon("trash", 14), el("span", { text: "Delete" })])
          ])
        ]);
      }));
    }

    return el("div.page", {}, [head, el("div.scroll-area", {}, [rows])]);
  }

  /* ------------------------------------------------------------------ */
  /* Brand / about page                                                  */
  /* ------------------------------------------------------------------ */

  function renderBrandPage() {
    var discordUrl = "discord.gg/placeholder";

    var discordBtn = el("button.discord-btn", {
      title: "Copy Discord link",
      onclick: function () {
        var link = "https://" + discordUrl;
        copyToClipboard(link);
        showToast("Discord link copied to clipboard!");
      }
    }, [window.filledIcon("discord", 36)]);

    return el("div.page.brand-page", {}, [
      el("div.brand-stage", {}, [
        el("img.brand-logo-xl", { src: "assets/logo.png", alt: "Calamity" }),
        el("div.brand-page-title", { html: '<span>Calamity</span> <em>Client</em>' }),
        el("div.brand-page-sub", { text: "Beta Version 0.0.1" }),
        discordBtn
      ])
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Toast + clipboard helpers                                           */
  /* ------------------------------------------------------------------ */

  function showToast(message) {
    var existing = document.querySelector(".toast");
    if (existing) existing.parentNode.removeChild(existing);
    var toast = el("div.toast", {}, [el("span", { text: message })]);
    document.body.appendChild(toast);
    // Force a reflow so the transition runs from the initial state.
    void toast.offsetWidth;
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2200);
  }
  window.showToast = showToast;

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ------------------------------------------------------------------ */
  /* Generic general pages                                               */
  /* ------------------------------------------------------------------ */

  function renderGeneralPage(title, sub) {
    return el("div.page", {}, [
      el("div.page-top", {}, [
        el("div.page-head", {}, [
          el("div.page-title", { html: "<em>" + title + "</em>" }),
          el("div.page-sub", { text: sub })
        ])
      ]),
      el("div.scroll-area", {}, [
        el("div.empty-state", {}, [
          icon("settings", 28),
          el("div.empty-title", { text: title + " coming soon" }),
          el("div.empty-sub", { text: "This section is a placeholder in the preview build." })
        ])
      ])
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  // Close any open dropdown menus when clicking outside of them.
  document.addEventListener("mousedown", function (ev) {
    var hasOpen = Object.keys(window.ui.openMenus).some(function (k) { return window.ui.openMenus[k]; });
    if (!hasOpen) return;
    if (ev.target.closest && ev.target.closest(".dropdown-control")) return;
    window.ui.openMenus = {};
    rerender();
  });

  rerender();
})();

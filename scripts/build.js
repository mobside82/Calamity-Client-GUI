/* Static build: syntax-checks every JS file, then copies the app into dist/.
   No bundler — the app is vanilla JS/CSS for JavaFX WebKit. */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const files = ["index.html", "css/styles.css", "js/state.js", "js/utils.js", "js/bridge.js", "js/app.js", "assets/logo.png"];

let failed = false;

// 1) Syntax-check each JS file by parsing it in a throwaway context.
["js/state.js", "js/utils.js", "js/bridge.js", "js/app.js"].forEach((rel) => {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  try {
    new vm.Script(src, { filename: rel });
    console.log("  ok  " + rel);
  } catch (err) {
    console.error("  ERR " + rel + ": " + err.message);
    failed = true;
  }
});

if (failed) {
  console.error("\nBuild failed: JS syntax errors.");
  process.exit(1);
}

// 2) Copy the static tree into dist/.
function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.statSync(src).isDirectory()) {
    fs.readdirSync(src).forEach((child) => copy(path.join(src, child), path.join(dest, child)));
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
fs.mkdirSync(dist, { recursive: true });
files.forEach((rel) => copy(path.join(root, rel), path.join(dist, rel)));

console.log("\nBuild succeeded. Output in dist/ (" + files.length + " files).");

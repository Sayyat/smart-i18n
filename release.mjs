// release.mjs
import { execSync } from "child_process";
import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const version = pkg.version;

const status = execSync("git status --porcelain").toString().trim();
if (status) {
    console.error("❌ Git working directory not clean. Commit your changes first.");
    process.exit(1);
}

// Step 1: Clean existing tag if exists
try {
    execSync(`git tag -d v${version}`, { stdio: "inherit" });
    execSync(`git push --delete origin v${version}`, { stdio: "inherit" });
} catch (e) {
    console.warn(`⚠️ Tag v${version} did not exist or couldn't be deleted. Continuing...`);
}

// Step 2: Bump version
const type = process.argv[2] || "patch";
execSync(`npm version ${type}`, { stdio: "inherit" });
const newVersion = JSON.parse(fs.readFileSync("./package.json", "utf8")).version;

// Step 3: Push commits and tags
execSync("git push", { stdio: "inherit" });
execSync("git push --tags", { stdio: "inherit" });

// Step 4: Create GitHub release
execSync(`gh release create v${newVersion} --generate-notes --latest`, {
    stdio: "inherit",
});

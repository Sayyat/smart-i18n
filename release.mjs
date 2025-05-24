// release.mjs
import { execSync } from "child_process";
import fs from "fs";

// Читаем текущую версию из package.json
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const currentVersion = pkg.version;

// Проверяем, чиста ли рабочая директория
const status = execSync("git status --porcelain").toString().trim();
if (status) {
    console.error("❌ Git working directory not clean. Commit your changes first.");
    process.exit(1);
}

// Аргументы CLI: тип версии (patch, minor, major), заметки
const versionType = process.argv[2] || "patch";
const notesIndex = process.argv.findIndex(arg => arg === "--notes");
const notes = notesIndex !== -1 ? process.argv.slice(notesIndex + 1).join(" ") : null;

// Удаляем старый тег, если существует
try {
    execSync(`git tag -d v${currentVersion}`, { stdio: "inherit" });
    execSync(`git push --delete origin v${currentVersion}`, { stdio: "inherit" });
} catch {
    console.warn(`⚠️ Tag v${currentVersion} did not exist or couldn't be deleted. Continuing...`);
}

// Обновляем версию
execSync(`npm version ${versionType}`, { stdio: "inherit" });
const newVersion = JSON.parse(fs.readFileSync("./package.json", "utf8")).version;

// Пушим изменения и теги
execSync("git push", { stdio: "inherit" });
execSync("git push --tags", { stdio: "inherit" });

// Создаём GitHub Release
const releaseCmd = `gh release create v${newVersion} --latest ${
    notes ? `--notes "${notes}"` : "--generate-notes"
}`;
execSync(releaseCmd, { stdio: "inherit" });

console.log(`✅ Published v${newVersion} to GitHub Releases and pushed to NPM`);

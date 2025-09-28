// release.mjs
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const run = (cmd, args = [], opts = {}) => {
    const res = spawnSync(cmd, args, {
        stdio: "inherit",
        shell: process.platform === "win32", // чтобы работало на Windows
        ...opts,
    });
    if (res.status !== 0) process.exit(res.status ?? 1);
    return res;
};

const out = (cmd, args = []) => {
    const res = spawnSync(cmd, args, {
        encoding: "utf8",
        shell: process.platform === "win32",
    });
    if (res.status !== 0) {
        throw new Error(res.stderr?.toString() || `Command failed: ${cmd} ${args.join(" ")}`);
    }
    return res.stdout.toString().trim();
};

// 1) Проверяем git чистоту (игнорируем untracked)
const isClean =
    spawnSync("git", ["diff", "--quiet"]).status === 0 &&
    spawnSync("git", ["diff", "--cached", "--quiet"]).status === 0;

if (!isClean) {
    console.error("❌ Git working directory not clean. Commit or stash your changes first.");
    process.exit(1);
}

// 2) Версия до и после
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const versionType = process.argv[2] || "patch";

// Поддержка --notes "текст заметок"
let notes = null;
for (let i = 3; i < process.argv.length; i++) {
    if (process.argv[i] === "--notes") {
        notes = process.argv.slice(i + 1).join(" ");
        break;
    }
}

// 3) Проверяем, что gh сможет залогиниться (через токен или через локальный gh)
const hasGh = spawnSync("gh", ["--version"], { stdio: "ignore" }).status === 0;
const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!hasGh) {
    console.error("❌ GitHub CLI (gh) не установлен. Установи gh или используй GH_TOKEN/GITHUB_TOKEN.");
    process.exit(1);
}
if (spawnSync("gh", ["auth", "status"], { stdio: "ignore" }).status !== 0 && !ghToken) {
    console.error("❌ Нет аутентификации gh. Выполни `gh auth login` или задай GH_TOKEN/GITHUB_TOKEN в окружении.");
    process.exit(1);
}

// 4) Обновляем версию (npm version: создаст коммит и тег vX.Y.Z)
// чтобы npm не генерил package-lock, держи в проекте .npmrc с `package-lock=false`
run("npm", ["version", versionType]); // создаст коммит с дефолтным сообщением "vX.Y.Z" и тег vX.Y.Z

const newVersion = JSON.parse(fs.readFileSync("./package.json", "utf8")).version;
const newTag = `v${newVersion}`;

// 5) Пушим коммит и тег
run("git", ["push"]);
run("git", ["push", "--tags"]);

// 6) Создаём GitHub Release (без проблем с кавычками)
const ghArgs = ["release", "create", newTag, "--latest"];
if (notes) ghArgs.push("--notes", notes);
else ghArgs.push("--generate-notes");

run("gh", ghArgs, {
    env: { ...process.env, GH_TOKEN: ghToken ?? process.env.GITHUB_TOKEN },
});

console.log(`✅ Release ${newTag} создан. CI подхватит 'release.created' и опубликует в npm.`);

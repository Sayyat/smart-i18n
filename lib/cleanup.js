/*
 * Copyright (c) 2025. Sayat Raykul
 * Очистка неиспользуемых файлов локалей по неймспейсам.
 * Опирается на configs из lib/config.js: includePatterns / excludePatterns / localesDirectory / generatedNamespacesPath
 */
import path from "node:path";
import fs from "node:fs/promises";
import fss from "node:fs";
import chalk from "chalk";
import { glob } from "glob";
import { configs, negatedExcludePatterns } from "./config.js";

function log(...args) {
    console.log("smart-i18n:clean", ...args);
}

async function readText(file) {
    try { return await fs.readFile(file, "utf8"); } catch { return null; }
}

function extractNamespacesFromGenerated(tsContent) {
    if (!tsContent) return new Set();
    // Ищем export const namespaces = ['common','home', ...]
    const m = tsContent.match(/export\s+const\s+namespaces\s*=\s*\[([\s\S]*?)\]/m);
    if (!m) return new Set();
    const raw = m[1];
    const items = [...raw.matchAll(/['"`]([^'"`]+)['"`]/g)].map(x => x[1]);
    return new Set(items);
}

async function collectNamespacesFromCode() {
    const patterns = [...configs.includePatterns, ...negatedExcludePatterns];
    const files = await glob(patterns, { nodir: true });
    const used = new Set();

    const add = ns => { if (ns && typeof ns === "string") used.add(ns); };

    const reKeyWithNs = /\b(?:i18n\.)?t\(\s*['"`]([^'"`]+):/g;                    // t('ns:key') или i18n.t('ns:key')
    const reUseTranslationSingle = /useTranslation\(\s*['"`]([^'"`]+)['"`]\s*\)/g; // useTranslation('ns')
    const reUseTranslationArray = /useTranslation\(\s*\[([^\]]+)\]\s*\)/g;        // useTranslation(['ns1','ns2'])
    const reTransNsProp = /<Trans[^>]*\sns=(["'`])([^"'`]+)\1/gi;                 // <Trans ns="ns">

    for (const file of files) {
        const txt = await readText(file);
        if (!txt) continue;

        for (const m of txt.matchAll(reKeyWithNs)) add(m[1]);
        for (const m of txt.matchAll(reUseTranslationSingle)) add(m[1]);

        for (const m of txt.matchAll(reUseTranslationArray)) {
            const arrTxt = m[1];
            for (const m2 of arrTxt.matchAll(/['"`]([^'"`]+)['"`]/g)) add(m2[1]);
        }
        for (const m of txt.matchAll(reTransNsProp)) add(m[2]);
    }
    return used;
}

async function listLocaleFiles(localesRootAbs) {
    // поддержка вложенных папок: <locales>/<lang>/**/<ns>.json
    const pattern = path.join(localesRootAbs, "*/**/*.json").replace(/\\/g, "/");
    const files = await glob(pattern, { nodir: true });
    return files.map(file => {
        const rel = path.relative(localesRootAbs, file);
        const parts = rel.split(path.sep);
        const lang = parts[0];
        const ns = path.basename(file, ".json");
        return { file, lang, ns };
    });
}

async function isJsonEmpty(file) {
    try {
        const txt = await fs.readFile(file, "utf8");
        const json = JSON.parse(txt);
        if (Array.isArray(json)) return json.length === 0;
        if (json && typeof json === "object") return Object.keys(json).length === 0;
        return false;
    } catch {
        return false;
    }
}

/**
 * Основная функция очистки
 * @param {Object} options
 * @param {boolean} options.dry — показать, что будет удалено, без удаления
 * @param {boolean} options.pruneEmpty — удалять пустые JSON даже если ns используется
 * @param {boolean} options.verbose — подробный вывод
 */
export async function cleanUnusedFiles({ dry = false, pruneEmpty = false, verbose = false } = {}) {
    const localesRootAbs = path.resolve(process.cwd(), configs.localesDirectory);
    const generatedNsFile = path.resolve(process.cwd(), configs.generatedNamespacesPath);

    if (!fss.existsSync(localesRootAbs)) {
        console.error(`❌ Не найден каталог локалей: ${localesRootAbs}`);
        return;
    }

    if (verbose) {
        log("locales:", localesRootAbs);
        log("generated namespaces file:", generatedNsFile);
    }

    const fromGenerated = extractNamespacesFromGenerated(await readText(generatedNsFile));
    const fromCode = await collectNamespacesFromCode();
    const usedNamespaces = new Set([...fromGenerated, ...fromCode]);

    if (verbose) {
        log("used namespaces:", [...usedNamespaces].sort().join(", ") || "(пусто)");
    }

    const files = await listLocaleFiles(localesRootAbs);

    const deletions = [];
    const empties = [];

    for (const e of files) {
        if (!usedNamespaces.has(e.ns)) {
            deletions.push(e.file);
        } else if (pruneEmpty && (await isJsonEmpty(e.file))) {
            empties.push(e.file);
        }
    }

    const toDelete = [...new Set([...deletions, ...empties])];

    if (toDelete.length === 0) {
        console.log("✅ Нечего удалять. Все файлы соответствуют используемым неймспейсам.");
        return;
    }

    if (dry) {
        console.log("🧪 DRY-RUN. Будут удалены файлы:");
        for (const f of toDelete) console.log("  -", path.relative(process.cwd(), f));
        return;
    }

    for (const f of toDelete) {
        try {
            await fs.rm(f, { force: true });
            if (verbose) log("deleted", path.relative(process.cwd(), f));
        } catch (e) {
            console.warn("⚠️ Не удалось удалить", f, e?.message);
        }
    }

    // подчистим пустые директории языков
    const langs = new Set(files.map(f => f.lang));
    for (const lang of langs) {
        const langDir = path.join(localesRootAbs, lang);
        try {
            const rest = await fs.readdir(langDir);
            if (rest.length === 0) {
                await fs.rmdir(langDir);
                if (verbose) log("rmdir", path.relative(process.cwd(), langDir));
            }
        } catch { /* ignore */ }
    }

    console.log(`🧹 Готово. Удалено файлов: ${toDelete.length}`);
}

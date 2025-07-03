/*
 * Copyright (c) 2025. Sayat Raykul
 */
import fs from "fs";
import path from "path";
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from "./paths.js";

export function copyBaseInitFiles() {
    const fileList = ["./i18next.config.json", "./.demo-env"];

    for (const file of fileList) {
        const src = getPathFromLibraryRoot(file);
        const dest = getPathFromConsumerRoot(file);

        if (!fs.existsSync(src)) {
            console.warn(`⚠️ Skipped: ${file} not found in library`);
            continue;
        }

        if (fs.existsSync(dest)) {
            console.warn(`⚠️ Skipped: ${file} already exists in project`);
            continue;
        }

        fs.copyFileSync(src, dest);
        console.log(`✅ Copied: ${file}`);
    }
}

export function copyDirectoryRecursive(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) {
        console.warn(`⚠️ Skipped: ${srcDir} folder not found in library`);
        return;
    }

    if (fs.existsSync(destDir)) {
        console.warn(`⚠️ Skipped: ${destDir} folder already exists in project`);
        return;
    }

    // Internal recursive function
    const copyRecursive = (src, dest) => {
        fs.mkdirSync(dest, { recursive: true });

        for (const item of fs.readdirSync(src)) {
            const srcItem = path.join(src, item);
            const destItem = path.join(dest, item);

            const stat = fs.statSync(srcItem);
            if (stat.isDirectory()) {
                copyRecursive(srcItem, destItem);
            } else {
                fs.copyFileSync(srcItem, destItem);
            }
        }
    };

    copyRecursive(srcDir, destDir);
    console.log(`✅ Copied folder: ${srcDir}`);
}

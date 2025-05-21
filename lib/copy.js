import fs from "fs";
import path from "path";
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from "./paths.js";

/**
 * Copies a list of files from the library to the consumer project,
 * only if the target file does not already exist.
 *
 * @param {string[]} fileList - Array of file paths relative to the library root (e.g., "./i18next.config.json").
 */
export function copyFilesList(fileList) {
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

/**
 * Recursively copies an entire directory from the library to the consumer project,
 * preserving folder structure. Skips if the destination directory already exists.
 *
 * @param {string} srcDir - Absolute path to the source directory in the library.
 * @param {string} destDir - Absolute path to the target directory in the consumer project.
 */
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


export function copyBaseInitFiles() {
    const filesToCopy = ["./i18next.config.json", "./.demo-env"];
    copyFilesList(filesToCopy)
}
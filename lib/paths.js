/*
 * Copyright (c) 2025. Sayat Raykul
 */
import path from "path";
import fs from "fs";

const LIBRARY_NAME = "@sayyyat/smart-i18n";

export function findProjectRoot() {
    let currentDir = process.cwd();

    while (true) {
        const pkgPath = path.join(currentDir, "package.json");

        if (fs.existsSync(pkgPath)) {
            return currentDir;  // Return the current directory if package.json is found
        }

        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            throw new Error("❌ Could not find a valid project root (no package.json found).");
        }

        currentDir = parentDir;
    }
}

export function findLibraryRoot(libraryName) {
    const projectRoot = findProjectRoot()
    const libraryRoot = path.join(projectRoot, 'node_modules', libraryName);
    if (fs.existsSync(path.join(libraryRoot, 'package.json'))) {
        return libraryRoot; // The library's root is found if package.json exists
    }
    throw new Error(`Could not find the root of the library ${libraryName}`);
}

// === Public API === //
export function getPathFromConsumerRoot(...segments) {
    return path.join(findProjectRoot(), ...segments);
}

export function getPathFromLibraryRoot(...segments) {
    return path.join(findLibraryRoot(LIBRARY_NAME), ...segments);
}

// === Useful constants === //
export const SRC_PATH = getPathFromConsumerRoot("src");

export const LIB_SRC_PATH = getPathFromLibraryRoot("src");

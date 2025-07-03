/*
 * Copyright (c) 2025. Sayat Raykul
 */
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const LIBRARY_FLAG_KEY = "smart-i18n-library";

/**
 * @typedef {"consumer" | "self"} ProjectMode
 *
 * Mode explanation:
 * - "consumer": Refers to the end user's project that installs and uses the smart-i18n package.
 * - "self": Refers to the smart-i18n package itself (the library's own root).
 */

/**
 * Finds the root directory based on the project mode and identifying package flag.
 * @param {ProjectMode} mode - Either "consumer" or "self"
 * @param {string} libraryFlagKey - e.g., "smart-i18n-library" or "smart-i18n-react-library"
 * @returns {string} - Absolute path to the project root
 */
export function findRootByMode(mode, libraryFlagKey = LIBRARY_FLAG_KEY) {
  let currentDir = path.dirname(fileURLToPath(import.meta.url));

  while (true) {
    const pkgPath = path.join(currentDir, "package.json");

    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

        if (mode === "self" && pkg[libraryFlagKey] === true) {
          return currentDir;
        }
        if (mode === "consumer" && pkg[libraryFlagKey] !== true) {
          return currentDir;
        }
      } catch {
        // skip
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(`❌ Could not find a valid project root for mode "${mode}" using flag "${libraryFlagKey}".`);
    }

    currentDir = parentDir;
  }
}


/**
 * Joins a given path from the root of the resolved project mode.
 * @param {ProjectMode} mode - Either "consumer" or "self"
 * @param {string[]} segments - Path segments relative to root
 * @returns {string} - Absolute path
 */
export function joinRootPathByMode(mode, segments) {
  return path.join(findRootByMode(mode), ...segments);
}

// === Public API === //


/**
 * Resolves an absolute path from the consumer project root
 * @param  {...string} segments - Path segments
 */
export function getPathFromConsumerRoot(...segments) {
  return joinRootPathByMode("consumer", segments);
}

/**
 * Resolves an absolute path from the smart-i18n package root
 * @param  {...string} segments - Path segments
 */
export function getPathFromLibraryRoot(...segments) {
  return joinRootPathByMode("self", segments);
}

// === Useful constants === //

/** Points to 'src' directory of the consumer project */
export const SRC_PATH = getPathFromConsumerRoot("src");

/** Points to 'src' directory of the smart-i18n library itself */
export const LIB_SRC_PATH = getPathFromLibraryRoot("src");

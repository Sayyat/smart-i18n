/*
 * Copyright (c) 2025. Sayat Raykul
 */

import fs from "fs";
import { configs } from "./config.js";
import { getPathFromConsumerRoot } from "./paths.js";

export function extractLanguagesFromTS() {
  try {
    const projectConfigsPath = getPathFromConsumerRoot(configs.configFilePath);
    const source = fs.readFileSync(projectConfigsPath, "utf8");

    const languagesMatch = source.match(
      /export const languages = \[(.*?)\] as const;/s,
    );
    const fallbackLanguageMatch = source.match(
      /export const FALLBACK_LANGUAGE: TLanguage = "(.*?)";/,
    );

    if (!languagesMatch || !fallbackLanguageMatch) {
      throw new Error("Unable to extract languages or FALLBACK_LANGUAGE");
    }

    const languages = languagesMatch[1]
      .split(",")
      .map((lang) => lang.trim().replace(/['"]/g, ""));

    const fallbackLanguage = fallbackLanguageMatch[1];
    return { languages, fallbackLanguage };
  } catch (error) {
    console.error(
      `❌  Error extracting languages: "${configs.configFilePath} cannot be found!`,
    );
  }
}

export const { languages, fallbackLanguage } = extractLanguagesFromTS();

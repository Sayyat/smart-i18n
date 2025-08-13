/*
 * Copyright (c) 2025. Sayat Raykul
 */
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import chalk from "chalk";
import {fallbackLanguage, languages} from "./language.js";
import dotenv from "dotenv";
import {configs} from "./config.js";

dotenv.config({
    path: ".env.development",
});

const LANGUAGES_DIR = path.resolve(configs.localesDirectory); // Папка с языковыми файлами
const CHUNK_SIZE = 20;
const API_URL = "https://deep-translate1.p.rapidapi.com/language/translate/v2";
const HEADERS = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": "deep-translate1.p.rapidapi.com",
};

function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

function flattenTemplates(dataByFile) {
    const entries = [];
    for (const [filename, data] of Object.entries(dataByFile)) {
        for (const [key, value] of Object.entries(data)) {
            entries.push({filename, key, value});
        }
    }
    return entries;
}

const translationCache = new Map();

async function sendTranslationRequestDeepL(
    text,
    targetLang,
    sourceLang = languages,
) {
    const cacheKey = `${sourceLang}::${targetLang}::${text}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    console.log(`🔁 Translating "${text}" to "${targetLang}"`);

    const response = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
        }),
    });

    if (!response.ok) {
        throw new Error(`DeepL API error (${targetLang}): ${response.status}`);
    }

    const result = await response.json();
    const translated = result.data.translations.translatedText[0];
    translationCache.set(cacheKey, translated);
    return translated;
}

function isAllDigit(str) {
    return /^\d+$/.test(String(str).trim());
}

async function translateChunk(chunk, targetLanguage, sourceLanguage = fallbackLanguage) {
    const results = [];
    const sameLang = targetLanguage === sourceLanguage;

    for (const item of chunk) {
        if (sameLang || isAllDigit(item.value)) {
            results.push({...item, translated: item.value});
        } else {
            const translated = await sendTranslationRequestDeepL(
                item.value,
                targetLanguage,
                sourceLanguage,
            );
            results.push({...item, translated});
        }
    }

    return results;
}

async function writeTranslations(resultMap) {
    for (const [lang, files] of Object.entries(resultMap)) {
        for (const [filename, translations] of Object.entries(files)) {
            const filePath = path.join(LANGUAGES_DIR, lang, filename);

            let existingContent = {};
            try {
                await fs.access(filePath); // Проверяем доступность файла
                const content = await fs.readFile(filePath, "utf8");
                existingContent = JSON.parse(content);
            } catch (err) {
                if (err.code !== "ENOENT") {
                    console.error(`❌ Ошибка при чтении файла: ${filePath}`, err);
                }
                existingContent = {};
            }

            const mergedContent = {...existingContent, ...translations};

            await fs.mkdir(path.dirname(filePath), {recursive: true});
            await fs.writeFile(
                filePath,
                `${JSON.stringify(mergedContent, null, 2)}\n`,
                "utf8",
            );
            console.log(`✔ ${chalk.green(lang)} → ${chalk.cyan(filename)}`);
        }
    }
}

async function getNewKeys(targetLang) {
    const newKeys = [];
    const targetLangFile = path.join(LANGUAGES_DIR, targetLang);

    const files = await fs.readdir(targetLangFile);
    for (const file of files) {
        const filePath = path.join(targetLangFile, file);
        const content = await fs.readFile(filePath, "utf8");
        const json = JSON.parse(content);

        for (const [key, value] of Object.entries(json)) {
            if (value === key) {
                newKeys.push({filename: file, key, value});
            }
        }
    }

    return newKeys;
}

export async function translate(requestedLang = "all") {
    console.log(
        chalk.blue(`🌍 Starting translation generation for ${requestedLang}...`),
    );

    const targetLanguages =
        requestedLang === "all"
            ? languages
            : languages.includes(requestedLang)
                ? [requestedLang]
                : (() => {
                    console.error(
                        chalk.red(
                            `❌ Invalid language: "${requestedLang}". Allowed: ${languages.join(", ")}`,
                        ),
                    );
                    return [];
                })();

    if (targetLanguages.length === 0) return;

    console.log({targetLanguages});
    try {
        const files = await fs.readdir(path.join(LANGUAGES_DIR, fallbackLanguage));

        const dataByFile = {};
        for (const file of files) {
            const filePath = path.join(LANGUAGES_DIR, fallbackLanguage, file);
            const content = await fs.readFile(filePath, "utf8");
            const json = JSON.parse(content);
            dataByFile[file] = json;
        }

        const resultMap = {};

        for (const lang of targetLanguages) {
            resultMap[lang] = {};
            const newKeys = await getNewKeys(lang);

            // translate only the keys that are equal to it's value
            for (const chunk of chunkArray(newKeys, CHUNK_SIZE)) {
                const translatedChunk = await translateChunk(
                    chunk,
                    lang,
                    fallbackLanguage,
                );
                for (const {filename, key, translated} of translatedChunk) {
                    resultMap[lang][filename] = resultMap[lang][filename] || {};
                    resultMap[lang][filename][key] = translated;
                }
            }
        }

        await writeTranslations(resultMap);
        console.log(chalk.green("✅ Translations successfully generated!"));
    } catch (err) {
        console.error(chalk.red("❌ Failed to generate translations:"), err);
    }
}

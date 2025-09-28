# Gulp Scripts File Structure

## Overview

The **Gulp** scripts in the **smart-i18n** project automate various tasks related to translations, including key extraction, namespace generation, type generation, and translation fetching from external services like **RapidAPI**.

This file structure is organized into **`lib/`** for reusable utilities and **`tasks/`** for the individual Gulp tasks. The files inside **`lib/`** contain the core logic used by the tasks, while the **`tasks/`** folder contains the actual tasks that will be executed via Gulp.

---

## File Structure

```plaintext
smart-i18n/
├── lib/
│   ├── config.js                   // Script to parse i18next.config.json and share default configs
│   ├── copy.js                     // Copy related helper functions
│   ├── flush.js                    // Custom logic for flushing or resetting translation keys
│   ├── i18n.js                     // Exports async getI18n function for initializing i18next
│   ├── init.js                     // Project initialization
│   ├── language.js                 // Parses src/i18n/lib/config.ts for languages and fallback language
│   ├── namespaces.js               // Generates namespaces based on translation keys
│   ├── paths.js                    // Exports utility functions like getConsumerRoot and getPathFromConsumerRoot
│   ├── transform.js                // Custom transform logic used by i18next-scanner for processing keys
│   ├── translation.js              // Handles automated translation fetching from RapidAPI
│   └── type.js                     // Handles type generation logic for translation keys
├── src/                            // Optional test folder for local development
├── tasks/
│   ├── generate-namespaces.js      // Gulp task to generate namespaces based on translation keys
│   ├── generate-templates.js       // Task to extract translation keys and update language files
│   ├── generate-translations.js    // Task to fetch translations for missing keys from RapidAPI
│   ├── generate-types.js           // Gulp task to generate TypeScript types for translations
│   ├── help.js                     // Gulp task to display available tasks and their descriptions
│   ├── init.js                     // Gulp task to init the project. Adds i18next.config.json and .demo-env
│   └── watch.js                    // Gulp task to watch for file changes and re-run tasks automatically
├── .demo-env                       // Demo .env
├── gulpfile.js                     // Main Gulp configuration file that imports and runs tasks
├── i18next.config.json             // Custom i18next configuration used by Gulp scripts
└── package.json                    // Defines project dependencies, including Gulp-related packages
```

---

## Explanation of Files

### /lib/

Reusable logic shared between all Gulp tasks:

- **config.js** — Loads and parses `i18next.config.json`.
- **flush.js** — Custom logic to clear/reset translations.
- **i18n.js** — Initializes i18next instance for internal use.
- **language.js** — Parses TS config to detect supported languages and fallback.
- **namespaces.js** — Scans files and generates namespaces from translation keys.
- **paths.js** — Locates consumer root or internal root, and resolves paths accordingly.
- **transform.js** — Custom transform for i18next-scanner to parse translation keys.
- **translation.js** — Handles external translation API (e.g., Deep Translate via RapidAPI).
- **type.js** — Generates TypeScript types from translation files.

### /tasks/

Each file is a self-contained Gulp task:

- **generate-namespaces.js** — Builds a map of translation namespaces.
- **generate-templates.js** — Extracts and updates translation keys in locale files.
- **generate-translations.js** — Requests missing translations from RapidAPI.
- **generate-types.js** — Converts extracted keys into a types.ts file.
- **watch.js** — Watches for changes and triggers translation-related tasks.
- **help.js** — Outputs list of all CLI tasks and usage.
- **copy.js** — Initializes config files (`i18next.config.json`, `.demo-env`) in a consumer project.

---

## How to Use the Gulp Tasks

Each task can be run via CLI using the `smart-i18n` binary:

```bash
  smart-i18n generate-namespaces
  smart-i18n generate-templates
  smart-i18n generate-types
  smart-i18n generate-translations -l ru
  smart-i18n watch
```

For full task details, run:

```bash
  smart-i18n help
```

These scripts make i18n workflows reproducible, automated, and framework-agnostic. You can easily integrate them with **Next.js**, **React**, **Vue**, or any TypeScript/JavaScript project.

> ℹ️ Looking for a concrete example? See the [next-i18n-auth](https://github.com/Sayyat/next-i18n-auth) project for a complete implementation.

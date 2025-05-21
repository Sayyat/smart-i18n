# Smart-i18n

[![npm version](https://img.shields.io/npm/v/@sayyyat/smart-i18n)](https://www.npmjs.com/package/@sayyyat/smart-i18n)
[![npm downloads](https://img.shields.io/npm/dm/@sayyyat/smart-i18n)](https://www.npmjs.com/package/@sayyyat/smart-i18n)
[![License](https://img.shields.io/npm/l/@sayyyat/smart-i18n)](./LICENSE)
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/Sayyat/smart-i18n/npm-publish.yml?branch=main)](https://github.com/Sayyat/smart-i18n/actions)

> A Gulp-based CLI toolkit for modular, scalable i18n in JS/TS projects

Smart-i18n is a framework-agnostic internationalization (i18n) CLI toolkit that automates translation workflows in JavaScript and TypeScript projects. It is based on **Gulp** and designed to integrate seamlessly into apps built with **Next.js**, **React**, **Vue**, or other frontend/backend stacks.

---

## 🚀 Features

* ✅ Automatic **namespace detection** and key extraction
* 🔄 Seamless **translation file merging** with old keys preserved
* 🌐 On-demand **machine translation** via Deep Translate (RapidAPI)
* 🔒 Safe **TypeScript typings** for all i18n keys
* 🧱 Modular Gulp tasks for fully scriptable i18n pipelines
* 🧰 CLI-based, works via `yarn smart-i18n`, `npx smart-i18n`, or direct Gulp

---

## 📦 Installation

In your project root:

```bash
yarn add -D smart-i18n
yarn smart-i18n init
```

This will install the package and create the following files if they don’t exist:

* `i18next.config.json` — main config file
* `.demo-env` — environment file with placeholder API key for translations

---

## 🛠️ Usage

After install, run tasks directly using `yarn` or `npx`:

```bash
yarn smart-i18n generate-namespaces
yarn smart-i18n generate-templates
yarn smart-i18n generate-types
yarn smart-i18n generate-translations -l ru
```

Or simply run all default tasks:

```bash
yarn smart-i18n
```

Available tasks:

| Command                             | Description                                                          |
| ----------------------------------- | -------------------------------------------------------------------- |
| `smart-i18n`                        | Runs `generate-namespaces` → `generate-templates` → `generate-types` |
| `smart-i18n generate-namespaces`    | Builds translation namespace map from file structure                 |
| `smart-i18n generate-templates`     | Extracts new keys, updates locale JSON files                         |
| `smart-i18n generate-types`         | Generates `types.d.ts` for i18n keys                                 |
| `smart-i18n generate-translations`  | Fills missing keys via Deep Translate API                            |
| `smart-i18n watch`                  | Watches files and regenerates as needed                              |
| `smart-i18n create-feature -n name` | Scaffold a new feature folder with boilerplate                       |
| `smart-i18n help`                   | Shows all commands and usage info                                    |

---

## 📁 Documentation

* 📚 [Getting Started Guide](./docs/getting-started.md) — project setup and concepts
* 🏗 [Gulp Scripts Structure](./docs/gulp.md) — full CLI task and file layout overview

---

## 🔗 Example Integration

Looking for a working example? Check out:

👉 [next-i18n-auth](https://github.com/Sayyat/next-i18n-auth) — A full Next.js 14+ app using `smart-i18n` with multi-language authentication, modular translation, and CLI-driven workflows.

---

## ⚖️ License

MIT © Sayat Raykul

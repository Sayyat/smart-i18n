#!/usr/bin/env node

import gulp from "gulp";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { pathToFileURL } from "url";

// Dynamically import your gulpfile.mjs tasks
const __dirname = dirname(fileURLToPath(import.meta.url));
const gulpfilePath = resolve(__dirname, "../gulpfile.mjs");
const gulpfileUrl = pathToFileURL(gulpfilePath).href;

const { registerTasks } = await import(gulpfileUrl);

// You must export registerTasks() from gulpfile.mjs
await registerTasks(gulp);

// Get the task from CLI
const [, , task = "default"] = process.argv;

gulp.series(task)((err) => {
    if (err) {
        console.error(`❌ Task "${task}" failed:`, err.message);
        process.exit(1);
    }
});

import fs from "fs";
import {getPathFromConsumerRoot, getPathFromLibraryRoot} from "../lib/paths.js";

export default function initTask(gulpInstance) {
    gulpInstance.task("init", async function () {
        const filesToCopy = ["./i18next.config.json", "./.demo-env"];

        for (const file of filesToCopy) {
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
    });
}

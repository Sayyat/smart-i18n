import {copyFilesList} from "../lib/copy.js";

export default function initTask(gulpInstance) {
    gulpInstance.task("init", async function () {
        const filesToCopy = ["./i18next.config.json", "./.demo-env"];
        copyFilesList(filesToCopy)
    });
}

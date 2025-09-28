/*
 * Copyright (c) 2025. Sayat Raykul
 */
import { cleanUnusedFiles } from "../lib/cleanup.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export default function cleanTask(gulp) {
    gulp.task("clean-translations", async function () {
        const argv = yargs(hideBin(process.argv))
            .option("dry", {
                type: "boolean",
                default: false,
                describe: "Показать, что будет удалено, без удаления",
                alias: "d",
            })
            .option("prune-empty", {
                type: "boolean",
                default: false,
                describe: "Удалять пустые JSON-файлы даже если namespace используется",
                alias: "p",
            })
            .option("verbose", {
                type: "boolean",
                default: false,
                describe: "Подробный вывод",
                alias: "v",
            })
            .parse();

        await cleanUnusedFiles({
            dry: argv.dry,
            pruneEmpty: argv["prune-empty"],
            verbose: argv.verbose,
        });
    });
}

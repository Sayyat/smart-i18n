export async function registerTasks(gulp) {
    const clean = (await import("./tasks/clean.js")).default;
    const generateNamespaces = (await import("./tasks/generate-namespaces.js")).default;
    const generateTemplates = (await import("./tasks/generate-templates.js")).default;
    const generateTranslations = (await import("./tasks/generate-translations.js")).default;
    const generateTypes = (await import("./tasks/generate-types.js")).default;
    const helpTask = (await import("./tasks/help.js")).default;
    const initTask = (await import("./tasks/init.js")).default;
    const watchTask = (await import("./tasks/watch.js")).default;

    clean(gulp);
    generateNamespaces(gulp);
    generateTemplates(gulp);
    generateTranslations(gulp);
    generateTypes(gulp);
    helpTask(gulp);
    initTask(gulp);
    watchTask(gulp);

    gulp.task("default", gulp.series("generate-namespaces", "generate-templates", "generate-types"));
}

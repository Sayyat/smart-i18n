import {copyBaseInitFiles, copyDirectoryRecursive} from "./copy.js";
import {getPathFromConsumerRoot, getPathFromLibraryRoot} from "./paths.js";

export function init() {
    // Copy core config files (.demo-env, i18next.config.json)
    copyBaseInitFiles();

    // Copy the default folder structure from the library to the consumer
    const libraryTemplatePath = getPathFromLibraryRoot("src", "i18n");
    const consumerSrc = getPathFromConsumerRoot("src", "i18n");
    copyDirectoryRecursive(libraryTemplatePath, consumerSrc);
}

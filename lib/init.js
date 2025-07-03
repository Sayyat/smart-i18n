import {copyBaseInitFiles, copyDirectoryRecursive} from "./copy.js";
import {getPathFromConsumerRoot, getPathFromLibraryRoot} from "./paths.js";

export function init() {
    copyBaseInitFiles();

    const libraryTemplatePath = getPathFromLibraryRoot("src", "i18n");
    const consumerSrc = getPathFromConsumerRoot("src", "i18n");
    copyDirectoryRecursive(libraryTemplatePath, consumerSrc);
}

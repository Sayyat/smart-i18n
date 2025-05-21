import {copyBaseInitFiles} from "../lib/copy.js";

export default function initTask(gulpInstance) {
    gulpInstance.task("init", copyBaseInitFiles);
}

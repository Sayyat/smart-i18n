import {init} from "../lib/init.js";

export default function initTask(gulpInstance) {
    gulpInstance.task("init", init);
}

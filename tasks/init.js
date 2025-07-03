/*
 * Copyright (c) 2025. Sayat Raykul
 */
import {init} from "../lib/init.js";

export default function initTask(gulpInstance) {
    gulpInstance.task("init", init);
}

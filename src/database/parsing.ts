/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export function trimTime(time?: number): number {
    return CoreJS.trimTime(1000, time);
}

export function parseFromTime(time?: number): number {
    return trimTime(time) / 1000;
}

export function parseToTime(time: string): number {
    return Number(time);
}
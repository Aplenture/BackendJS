/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { ErrorCode } from "./errorCode";

export function trimTime(time?: number): number {
    return CoreJS.trimTime(1000, time);
}

export function parseFromTime(time?: number): number {
    return trimTime(time) / 1000;
}

export function parseToTime(time: string): number {
    return Number(time);
}

export function parseToError(error: ErrorCode): CoreJS.CoreErrorCode {
    switch (error) {
        case ErrorCode.Duplicate:
            return CoreJS.CoreErrorCode.Duplicate;

        default:
            throw new Error(`unknown database error code '${error}'`);
    }
}
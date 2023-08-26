/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

export interface Update {
    readonly name: string;
    readonly version: number;
    readonly timestamp: number | string;
    readonly update: string;
    readonly reset?: string;
    readonly revert?: string;
}
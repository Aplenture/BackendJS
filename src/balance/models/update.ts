/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

export interface Update {
    readonly id: number;
    readonly timestamp: number;
    readonly account: number;
    readonly depot: number;
    readonly asset: number;
    readonly value: number;
}
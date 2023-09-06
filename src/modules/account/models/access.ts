/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

export interface Access {
    readonly id: number;
    readonly created: number;
    readonly account: number;
    readonly api: string;
    readonly secret: string;
    readonly rights: number;
    readonly expiration?: number;
    readonly label?: string;
}
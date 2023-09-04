/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

export abstract class Update<T> {
    public abstract readonly name: string;
    public abstract readonly version: number;
    public abstract readonly timestamp: number | string;
    public abstract readonly update: string;
    public abstract readonly reset?: string;
    public abstract readonly revert?: string;

    constructor(_: T) { }
}
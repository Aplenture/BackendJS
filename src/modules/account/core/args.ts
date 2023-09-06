/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { Module } from "../../..";

export interface Args extends Module.Args {
    readonly timestamp?: number;
    readonly account?: number;
    readonly access?: number;
    readonly api?: string;
}
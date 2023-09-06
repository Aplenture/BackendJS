/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { Database, Module } from "../../..";

export interface Options extends Module.Options {
    readonly databaseConfig: Database.Config;
    readonly accessTable?: string;
    readonly accountTable?: string;
}
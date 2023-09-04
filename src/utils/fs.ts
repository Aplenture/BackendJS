/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as FS from "fs";

export interface LoadModuleConfig {
    readonly class: string;
    readonly path: string;
}

export function loadModule<T>(config: LoadModuleConfig, ...args: any[]): T {
    const path = `${process.cwd()}/${config.path}.js`;

    let constructor: new (...args: any[]) => T;

    try {
        constructor = require(path)[config.class];
    } catch (error) {
        throw new Error(`module '${config.class}' not found at '${path}'`);
    }

    return new constructor(...args);
}

export function loadConfig(name = 'config.json', _default = {}) {
    const path = `${process.cwd()}/${name}`;

    if (!FS.existsSync(path))
        if (_default)
            return _default;
        else
            throw new Error(`missing config at path '${path}'`);

    const content = FS.readFileSync(path, 'utf8');

    return JSON.parse(content);
}
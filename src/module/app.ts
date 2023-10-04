/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export interface IApp extends CoreJS.IEventManager {
    updateLoop: CoreJS.Updateloop;
    execute(route?: string, args?: NodeJS.ReadOnlyDict<any>): Promise<CoreJS.Response>;
}
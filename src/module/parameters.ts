/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export enum GlobalParamterName {
    Debug = 'debug'
}

export const GlobalParameters: readonly CoreJS.Parameter<any>[] = [
    new CoreJS.BoolParameter(GlobalParamterName.Debug, 'enables/disables debug mode', false)
]
/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export const GlobalParameters: readonly CoreJS.Parameter<any>[] = [
    new CoreJS.BoolParameter('debug', 'enables/disables debug mode', false)
]
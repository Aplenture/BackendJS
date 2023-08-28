/**
 * Aplenture/ModuleJS
 * https://github.com/Aplenture/ModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/ModuleJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export const GlobalParameters: readonly CoreJS.Parameter<any>[] = [
    new CoreJS.BoolParameter('debug', 'enables/disables debug mode', false)
]
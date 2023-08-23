/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";

export const Parameters: readonly CoreJS.Parameter<any>[] = [
    new CoreJS.StringParameter('host', 'to database'),
    new CoreJS.StringParameter('user', 'from database'),
    new CoreJS.StringParameter('password', 'from user'),
    new CoreJS.StringParameter('database', 'name of database')
]
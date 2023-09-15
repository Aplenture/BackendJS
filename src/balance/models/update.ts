/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { UpdateType } from "../enums";

export interface Update {
    readonly id: number;
    readonly timestamp: number;
    readonly type: UpdateType;
    readonly account: number;
    readonly depot: number;
    readonly order: number;
    readonly asset: number;
    readonly change: number;
    readonly data: string;
}
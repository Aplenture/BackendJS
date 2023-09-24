/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { EventType } from "../enums";

export interface Event {
    readonly id: number;
    readonly timestamp: number;
    readonly type: EventType;
    readonly account: number;
    readonly depot: number;
    readonly asset: number;
    readonly order: number;
    readonly value: number;
    readonly data: string;
}
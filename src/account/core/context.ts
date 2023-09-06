/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import { AccessRepository, AccountRepository } from "../repositories";
import { Module, Database } from "../..";

export interface Context extends Module.Context {
    readonly database: Database.Database;
    readonly accessRepository: AccessRepository;
    readonly accountRepository: AccountRepository;
}
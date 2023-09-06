/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../core";
import { Module } from "../../..";

interface Args extends GlobalArgs {
    readonly version: number;
}

export class Revert extends Module.Command<Context, Args, Options> {
    public readonly description = 'rolls back the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('version', 'reverts to this version', 0)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        await this.context.accessRepository.revert({ minVersion: args.version });
        await this.context.accountRepository.revert({ minVersion: args.version });

        return new CoreJS.TextResponse('reverted to version ' + args.version);
    }
}
/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../core";
import { Command } from "../../module";

interface Args extends GlobalArgs {
    readonly version: number;
}

export class Update extends Command<Context, Args, Options> {
    public readonly description = 'updates the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('version', 'updates to this version', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        await this.context.accessRepository.update({ maxVersion: args.version });
        await this.context.accountRepository.update({ maxVersion: args.version });

        return new CoreJS.TextResponse('updated to version ' + args.version);
    }
}
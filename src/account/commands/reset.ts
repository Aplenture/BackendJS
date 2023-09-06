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
    readonly versions: readonly number[];
}

export class Reset extends Command<Context, Args, Options> {
    public readonly description = 'resets the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.ArrayParameter('versions', 'resets these versions only', new CoreJS.NumberParameter('', ''), null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        await this.context.accessRepository.reset({ versions: args.versions });
        await this.context.accountRepository.reset({ versions: args.versions });

        return new CoreJS.TextResponse('reset');
    }
}
/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Context, Args as ArgsData, Options } from "../core";
import { Command } from "../../module";

interface Args extends ArgsData {
}

export class GetAccesses extends Command<Context, Args, Options> {
    public readonly description = "Returns all open accesses.";
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', "ID of account.")
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.accessRepository.getByAccount(args.account);

        return new CoreJS.JSONResponse(result);
    }
}
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
    readonly rights: number;
    readonly label: string;
    readonly expiration_duration: number;
}

export class CreateAccess extends Command<Context, Args, Options> {
    public readonly description = "Creates a new access."
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', "ID of account."),
        new CoreJS.NumberParameter('rights', "of access.", null),
        new CoreJS.StringParameter('label', "of the access.", null),
        new CoreJS.NumberParameter('expiration_duration', "of the access.", null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.accessRepository.create(args.account, {
            label: args.label,
            rights: args.rights,
            expirationDuration: args.expiration_duration
        });

        this.message(`created access '${result.id}' for account '${result.account}'`);

        return new CoreJS.JSONResponse(result);
    }
}
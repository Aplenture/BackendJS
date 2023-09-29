/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Context, Args as ArgsData, Options } from "../core";
import { Command } from "../../module";

const DURATION_ACCESS_EXPIRATION = CoreJS.Milliseconds.Hour;
const LENGTH_PASSWORD_BLOCKS = 6;

interface Args extends ArgsData {
    readonly username: string;
    readonly password: string;
    readonly publickey: string;
    readonly label: string;
    readonly create_access: boolean;
    readonly access_expiration: number;
}

export class CreateAccount extends Command<Context, Args, Options> {
    public readonly description = "Creates a new account and optionaly a temporary access.";
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.StringParameter("username", "For account."),
        new CoreJS.StringParameter("password", "For account.", null),
        new CoreJS.StringParameter("publickey", "From password.", null),
        new CoreJS.StringParameter("label", "To assign creator of temporary open access for created account.", null),
        new CoreJS.BoolParameter("create_access", "Flag to create temporary access too.", false),
        new CoreJS.NumberParameter("access_expiration", "Expiration duration of access.", DURATION_ACCESS_EXPIRATION)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const seed = !args.publickey && (args.password || CoreJS.randomPassword(LENGTH_PASSWORD_BLOCKS));
        const publicKey = args.publickey || CoreJS.EC.secp256k1.createPublicKey(CoreJS.EC.createPrivateKey(seed));

        const account = await this.context.accountRepository.create(args.username, publicKey.toString());

        this.message(`created new account with id '${account.id}'`);

        if (!args.create_access)
            return new CoreJS.OKResponse();

        const access = await this.context.accessRepository.create(account.id, {
            label: args.label,
            expirationDuration: args.access_expiration
        });

        this.message(`created new access for account '${account.id}'`);

        return new CoreJS.JSONResponse(access);
    }
}
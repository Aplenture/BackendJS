/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Context, Args as ArgsData, Options } from "../core";
import { Module } from "../../..";

const DURATION_DELAY = CoreJS.Milliseconds.Second;
const DURATION_SHORT_ACCESS = CoreJS.Milliseconds.Day;
const DURATION_LONG_ACCESS = CoreJS.Milliseconds.Day * 30;

interface Args extends ArgsData {
    readonly timestamp: number;
    readonly username: string;
    readonly sign: string;
    readonly keepLogin?: boolean;
    readonly label?: string;
}

export class Login extends Module.Command<Context, Args, Options> {
    public readonly description = "Creates access to account."
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter("timestamp", "For validation."),
        new CoreJS.StringParameter("username", "From account."),
        new CoreJS.StringParameter("sign", "From timestamp."),
        new CoreJS.BoolParameter("keepLogin", "Keeps access for long time.", false),
        new CoreJS.StringParameter("label", "To assign the access creator.", '')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        // delay execution
        // to protect against brute force attack
        await CoreJS.sleep(DURATION_DELAY);

        const account = await this.context.accountRepository.getByName(args.username);

        if (!account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Unauthorized, '#_login_invalid');

        const hash = CoreJS.toHashInt(args.timestamp.toString());
        const key = CoreJS.EC.Point.fromHex(account.key);
        const sign = CoreJS.ECDSA.Sign.fromHex(args.sign);

        if (!CoreJS.ECDSA.verify(hash, key, sign))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Unauthorized, '#_login_invalid');

        const expirationDuration = args.keepLogin
            ? DURATION_LONG_ACCESS
            : DURATION_SHORT_ACCESS;

        const access = await this.context.accessRepository.create(account.id, {
            label: args.label,
            expirationDuration
        });

        this.message(`created access '${access.id}' for account '${access.account}'`);

        return new CoreJS.JSONResponse(access);
    }
}
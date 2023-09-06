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
    readonly old: string;
    readonly new: string;
}

export class ChangePassword extends Command<Context, Args, Options> {
    public readonly description = "Changes the account password."
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter("account", "Where to change the password."),
        new CoreJS.StringParameter("old", "Of current password."),
        new CoreJS.StringParameter("new", "Of new password.")
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const account = await this.context.accountRepository.getByID(args.account);

        if (account.key != args.old)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_wrong_old_password');

        await this.context.accountRepository.changePassword(args.account, args.new);

        this.message(`changed password from account '${args.account}'`);

        return new CoreJS.OKResponse();
    }
}
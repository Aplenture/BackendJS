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
    readonly api_to_delete: string;
}

export class DeleteAccess extends Command<Context, Args, Options> {
    public readonly description = "Deletes all or one specific access.";
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', "ID of account."),
        new CoreJS.StringParameter('api_to_delete', "API of the access to delete.")
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const access = await this.context.accessRepository.getByAPI(args.api_to_delete);

        if (!access)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_access_invalid");

        if (access.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_access_invalid");

        if (access.id == args.access)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_access_delte_current_not_allowed");

        await this.context.accessRepository.deleteByID(access.id);

        this.message(`deleted access '${access.id}' of account '${access.account}'`);

        return new CoreJS.OKResponse();
    }
}
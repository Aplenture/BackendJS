/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Context, Args as ArgsData, Options } from "../core";
import { Module } from "../../..";

interface Args extends ArgsData {
}

export class Logout extends Module.Command<Context, Args, Options> {
    public readonly description = "Closes the access."
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.StringParameter("api", "From access to close.")
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const access = await this.context.accessRepository.getByAPI(args.api);

        if (!access)
            // throw error because its an configuration falure
            throw new Error('invalid api, no existing access');

        await this.context.accessRepository.deleteByID(access.id);

        this.message(`deleted access '${access.id}' of account '${access.account}'`);

        return new CoreJS.OKResponse();
    }
}
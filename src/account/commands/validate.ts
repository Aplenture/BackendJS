/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Context, Args as ArgsData, Options } from "../core";
import { validateAPIRights, validateAccess, validateSignature } from "../utils";
import { Command } from "../../module";

interface Args extends ArgsData {
    timestamp: number;
    account: number;
    access: number;
    api: string;
    rights: number;
    sign: string;
    debug: boolean;
}

export class Validate extends Command<Context, Args, Options> {
    public readonly description = "Changes the account password."
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter("rights", "bitmap to describe the api rights"),
        new CoreJS.NumberParameter("timestamp", "nonce of sign"),
        new CoreJS.StringParameter("api", "api key"),
        new CoreJS.StringParameter("sign", "signed with private key of api")
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const debug = args.debug;
        const rights = args.rights;
        const api = args.api;
        const sign = args.sign;

        // prepare args
        delete args.debug;
        delete args.account;
        delete args.access;
        delete args.api;
        delete args.sign;
        delete args.rights;

        if (!rights)
            return;

        const access = await this.context.accessRepository.getByAPI(api);

        if (!validateAccess(access))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Unauthorized, '#_api_key_invalid');

        if (!validateAPIRights(access, rights))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Unauthorized, '#_api_rights_invalid');

        if (!validateSignature(sign, args, access.secret))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Unauthorized, '#_signature_invalid');

        // update args
        args.debug = debug;
        args.account = access.account;
        args.access = access.id;
        args.api = access.api;
        args.rights = access.rights;
    }
}
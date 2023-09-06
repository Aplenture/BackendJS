/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Context, Args as ArgsData, Options } from "../core";
import { validateAccess, validateSignature } from "../utils";
import { Module } from "../../..";

const DURATION_DELAY = CoreJS.Milliseconds.Second;

interface Args extends ArgsData {
    readonly signature: string;
    readonly timestamp: number;
}

export class HasAccess extends Module.Command<Context, Args, Options> {
    public readonly description = "Returns whether access is valid.";
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.StringParameter("api", "From access."),
        new CoreJS.StringParameter("signature", "Signatured timestamp."),
        new CoreJS.NumberParameter("timestamp", "Validation timestamp.")
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        // delay execution
        // to protect against brute force attack
        await CoreJS.sleep(DURATION_DELAY);

        const access = await this.context.accessRepository.getByAPI(args.api);

        if (!validateAccess(access))
            return new CoreJS.BoolResponse(false);

        if (!validateSignature(args.signature, { timestamp: args.timestamp }, access.secret))
            return new CoreJS.BoolResponse(false);

        return new CoreJS.JSONResponse({
            rights: access.rights,
            expiration: access.expiration,
            label: access.label
        });
    }
}
// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';

export class Crowdloan implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public parachainId?: string;

    public retiring: boolean;

    public auctionId: string;

    public depositorId: string;

    public cap: bigint;

    public raised: bigint;

    public lockExpiredBlock: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Crowdloan entity without an ID");
        await store.set('Crowdloan', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Crowdloan entity without an ID");
        await store.remove('Crowdloan', id.toString());
    }

    static async get(id:string): Promise<Crowdloan>{
        assert(id !== null, "Cannot get Crowdloan entity without an ID");
        const record = await store.get('Crowdloan', id.toString());
        if (record){
            return Crowdloan.create(record);
        }else{
            return;
        }
    }

    static create(record){
        let entity = new Crowdloan(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

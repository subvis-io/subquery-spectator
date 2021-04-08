// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';

export class Contribution implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public AuctionId: string;

    public AccountId: string;

    public parachainId: string;

    public fundId: string;

    public value: bigint;

    public blockNum: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Contribution entity without an ID");
        await store.set('Contribution', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Contribution entity without an ID");
        await store.remove('Contribution', id.toString());
    }

    static async get(id:string): Promise<Contribution>{
        assert(id !== null, "Cannot get Contribution entity without an ID");
        const record = await store.get('Contribution', id.toString());
        if (record){
            return Contribution.create(record);
        }else{
            return;
        }
    }

    static create(record){
        let entity = new Contribution(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

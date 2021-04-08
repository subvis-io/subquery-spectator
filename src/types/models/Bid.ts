// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';

export class Bid implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public auctionId: string;

    public blockNum: number;

    public parachainId: string;

    public isCrowdloan: boolean;

    public value: bigint;

    public fundId?: string;

    public slotStart: number;

    public slotEnd: number;

    public bidderId?: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Bid entity without an ID");
        await store.set('Bid', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Bid entity without an ID");
        await store.remove('Bid', id.toString());
    }

    static async get(id:string): Promise<Bid>{
        assert(id !== null, "Cannot get Bid entity without an ID");
        const record = await store.get('Bid', id.toString());
        if (record){
            return Bid.create(record);
        }else{
            return;
        }
    }

    static create(record){
        let entity = new Bid(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

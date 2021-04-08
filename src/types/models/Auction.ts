// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';

export class Auction implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockNum: number;

    public status: string;

    public leaseStart: number;

    public leaseEnd: number;

    public started: number;

    public closingStart: number;

    public closingEnd: number;

    public resultBlock?: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Auction entity without an ID");
        await store.set('Auction', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Auction entity without an ID");
        await store.remove('Auction', id.toString());
    }

    static async get(id:string): Promise<Auction>{
        assert(id !== null, "Cannot get Auction entity without an ID");
        const record = await store.get('Auction', id.toString());
        if (record){
            return Auction.create(record);
        }else{
            return;
        }
    }

    static create(record){
        let entity = new Auction(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

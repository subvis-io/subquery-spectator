// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';

export class WinningBid implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public bidId: string;

    public auctionId: string;

    public slotStart: number;

    public slotEnd: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save WinningBid entity without an ID");
        await store.set('WinningBid', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove WinningBid entity without an ID");
        await store.remove('WinningBid', id.toString());
    }

    static async get(id:string): Promise<WinningBid>{
        assert(id !== null, "Cannot get WinningBid entity without an ID");
        const record = await store.get('WinningBid', id.toString());
        if (record){
            return WinningBid.create(record);
        }else{
            return;
        }
    }

    static create(record){
        let entity = new WinningBid(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

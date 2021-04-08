// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';

export class ParachainLeased implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public parachainId: string;

    public slotStart: number;

    public slotEnd: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ParachainLeased entity without an ID");
        await store.set('ParachainLeased', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ParachainLeased entity without an ID");
        await store.remove('ParachainLeased', id.toString());
    }

    static async get(id:string): Promise<ParachainLeased>{
        assert(id !== null, "Cannot get ParachainLeased entity without an ID");
        const record = await store.get('ParachainLeased', id.toString());
        if (record){
            return ParachainLeased.create(record);
        }else{
            return;
        }
    }

    static create(record){
        let entity = new ParachainLeased(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

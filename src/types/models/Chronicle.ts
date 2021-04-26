// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class Chronicle implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public curAuctionId?: string;

    public curBlockNum?: number;

    public curLease?: number;

    public curLeaseStart?: number;

    public curLeaseEnd?: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Chronicle entity without an ID");
        await store.set('Chronicle', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Chronicle entity without an ID");
        await store.remove('Chronicle', id.toString());
    }

    static async get(id:string): Promise<Chronicle | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Chronicle entity without an ID");
        const record = await store.get('Chronicle', id.toString());
        if (record){
            return Chronicle.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new Chronicle(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

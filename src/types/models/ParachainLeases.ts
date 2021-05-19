// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class ParachainLeases implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public parachainId: string;

    public firstSlot: number;

    public lastSlot: number;

    public blockNum: number;

    public winningAmount: bigint;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ParachainLeases entity without an ID");
        await store.set('ParachainLeases', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ParachainLeases entity without an ID");
        await store.remove('ParachainLeases', id.toString());
    }

    static async get(id:string): Promise<ParachainLeases | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ParachainLeases entity without an ID");
        const record = await store.get('ParachainLeases', id.toString());
        if (record){
            return ParachainLeases.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new ParachainLeases(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

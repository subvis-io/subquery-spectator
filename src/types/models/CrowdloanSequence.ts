// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class CrowdloanSequence implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public curIndex: number;

    public createdAt: Date;

    public blockNum: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save CrowdloanSequence entity without an ID");
        await store.set('CrowdloanSequence', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove CrowdloanSequence entity without an ID");
        await store.remove('CrowdloanSequence', id.toString());
    }

    static async get(id:string): Promise<CrowdloanSequence | undefined>{
        assert((id !== null && id !== undefined), "Cannot get CrowdloanSequence entity without an ID");
        const record = await store.get('CrowdloanSequence', id.toString());
        if (record){
            return CrowdloanSequence.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new CrowdloanSequence(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

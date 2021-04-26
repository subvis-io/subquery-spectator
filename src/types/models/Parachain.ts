// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class Parachain implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public paraId: number;

    public createdAt?: Date;

    public creationBlock?: number;

    public deregistered: boolean;

    public deposit: bigint;

    public manager: string;

    public chronicleId?: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Parachain entity without an ID");
        await store.set('Parachain', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Parachain entity without an ID");
        await store.remove('Parachain', id.toString());
    }

    static async get(id:string): Promise<Parachain | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Parachain entity without an ID");
        const record = await store.get('Parachain', id.toString());
        if (record){
            return Parachain.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new Parachain(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

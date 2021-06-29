// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class Contribution implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public account: string;

    public parachainId: string;

    public fundId: string;

    public amount: bigint;

    public blockNum: number;

    public createdAt: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Contribution entity without an ID");
        await store.set('Contribution', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Contribution entity without an ID");
        await store.remove('Contribution', id.toString());
    }

    static async get(id:string): Promise<Contribution | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Contribution entity without an ID");
        const record = await store.get('Contribution', id.toString());
        if (record){
            return Contribution.create(record);
        }else{
            return;
        }
    }


    static async getByAccount(account: string): Promise<Contribution[] | undefined>{
      
      const records = await store.getByField('Contribution', 'account', account);
      return records.map(record => Contribution.create(record));
      
    }

    static async getByAmount(amount: bigint): Promise<Contribution[] | undefined>{
      
      const records = await store.getByField('Contribution', 'amount', amount);
      return records.map(record => Contribution.create(record));
      
    }

    static async getByBlockNum(blockNum: number): Promise<Contribution[] | undefined>{
      
      const records = await store.getByField('Contribution', 'blockNum', blockNum);
      return records.map(record => Contribution.create(record));
      
    }


    static create(record){
        let entity = new Contribution(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

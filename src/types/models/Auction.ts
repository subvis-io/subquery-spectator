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

    public leaseStart?: number;

    public slotsStart: number;

    public leaseEnd?: number;

    public slotsEnd: number;

    public closingStart: number;

    public closingEnd: number;

    public resultBlock?: number;

    public ongoing: boolean;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Auction entity without an ID");
        await store.set('Auction', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Auction entity without an ID");
        await store.remove('Auction', id.toString());
    }

    static async get(id:string): Promise<Auction | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Auction entity without an ID");
        const record = await store.get('Auction', id.toString());
        if (record){
            return Auction.create(record);
        }else{
            return;
        }
    }


    static async getByStatus(status: string): Promise<Auction[] | undefined>{
      
      const records = await store.getByField('Auction', 'status', status);
      return records.map(record => Auction.create(record));
      
    }

    static async getByOngoing(ongoing: boolean): Promise<Auction[] | undefined>{
      
      const records = await store.getByField('Auction', 'ongoing', ongoing);
      return records.map(record => Auction.create(record));
      
    }


    static create(record){
        let entity = new Auction(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

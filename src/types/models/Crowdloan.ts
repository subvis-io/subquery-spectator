// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class Crowdloan implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public parachainId: string;

    public retiring: boolean;

    public depositor: string;

    public verifier?: string;

    public cap: bigint;

    public raised: bigint;

    public lockExpiredBlock: number;

    public blockNum?: number;

    public firstSlot: number;

    public lastSlot: number;

    public wonAuctionId?: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Crowdloan entity without an ID");
        await store.set('Crowdloan', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Crowdloan entity without an ID");
        await store.remove('Crowdloan', id.toString());
    }

    static async get(id:string): Promise<Crowdloan | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Crowdloan entity without an ID");
        const record = await store.get('Crowdloan', id.toString());
        if (record){
            return Crowdloan.create(record);
        }else{
            return;
        }
    }


    static async getByRetiring(retiring: boolean): Promise<Crowdloan[] | undefined>{
      
      const records = await store.getByField('Crowdloan', 'retiring', retiring);
      return records.map(record => Crowdloan.create(record));
      
    }

    static async getByWonAuctionId(wonAuctionId: string): Promise<Crowdloan[] | undefined>{
      
      const records = await store.getByField('Crowdloan', 'wonAuctionId', wonAuctionId);
      return records.map(record => Crowdloan.create(record));
      
    }


    static create(record){
        let entity = new Crowdloan(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

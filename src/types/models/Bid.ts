// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class Bid implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public auctionId: string;

    public winningAuction?: number;

    public blockNum: number;

    public parachainId: string;

    public isCrowdloan: boolean;

    public amount: bigint;

    public fundId?: string;

    public firstSlot: number;

    public lastSlot: number;

    public bidder?: string;

    public createdAt: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Bid entity without an ID");
        await store.set('Bid', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Bid entity without an ID");
        await store.remove('Bid', id.toString());
    }

    static async get(id:string): Promise<Bid | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Bid entity without an ID");
        const record = await store.get('Bid', id.toString());
        if (record){
            return Bid.create(record);
        }else{
            return;
        }
    }


    static async getByWinningAuction(winningAuction: number): Promise<Bid[] | undefined>{
      
      const records = await store.getByField('Bid', 'winningAuction', winningAuction);
      return records.map(record => Bid.create(record));
      
    }

    static async getByBlockNum(blockNum: number): Promise<Bid[] | undefined>{
      
      const records = await store.getByField('Bid', 'blockNum', blockNum);
      return records.map(record => Bid.create(record));
      
    }


    static create(record){
        let entity = new Bid(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

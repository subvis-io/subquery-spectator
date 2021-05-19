// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class ParachainWinningLeases implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public paraId: number;

    public leaseRange: string;

    public auctionId: string;

    public activeForAuction?: string;

    public numBlockWon: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ParachainWinningLeases entity without an ID");
        await store.set('ParachainWinningLeases', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ParachainWinningLeases entity without an ID");
        await store.remove('ParachainWinningLeases', id.toString());
    }

    static async get(id:string): Promise<ParachainWinningLeases | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ParachainWinningLeases entity without an ID");
        const record = await store.get('ParachainWinningLeases', id.toString());
        if (record){
            return ParachainWinningLeases.create(record);
        }else{
            return;
        }
    }


    static async getByLeaseRange(leaseRange: string): Promise<ParachainWinningLeases[] | undefined>{
      
      const records = await store.getByField('ParachainWinningLeases', 'leaseRange', leaseRange);
      return records.map(record => ParachainWinningLeases.create(record));
      
    }

    static async getByAuctionId(auctionId: string): Promise<ParachainWinningLeases[] | undefined>{
      
      const records = await store.getByField('ParachainWinningLeases', 'auctionId', auctionId);
      return records.map(record => ParachainWinningLeases.create(record));
      
    }

    static async getByActiveForAuction(activeForAuction: string): Promise<ParachainWinningLeases[] | undefined>{
      
      const records = await store.getByField('ParachainWinningLeases', 'activeForAuction', activeForAuction);
      return records.map(record => ParachainWinningLeases.create(record));
      
    }


    static create(record){
        let entity = new ParachainWinningLeases(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

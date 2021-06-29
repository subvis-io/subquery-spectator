// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class ParachainLeases implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public paraId: number;

    public parachainId: string;

    public leaseRange: string;

    public firstLease: number;

    public lastLease: number;

    public latestBidAmount: bigint;

    public auctionId?: string;

    public activeForAuction?: string;

    public winningAmount?: bigint;

    public extraAmount?: bigint;

    public wonBidFrom?: string;

    public numBlockWon?: number;

    public winningResultBlock?: number;

    public hasWon: boolean;


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


    static async getByParachainId(parachainId: string): Promise<ParachainLeases[] | undefined>{
      
      const records = await store.getByField('ParachainLeases', 'parachainId', parachainId);
      return records.map(record => ParachainLeases.create(record));
      
    }

    static async getByLeaseRange(leaseRange: string): Promise<ParachainLeases[] | undefined>{
      
      const records = await store.getByField('ParachainLeases', 'leaseRange', leaseRange);
      return records.map(record => ParachainLeases.create(record));
      
    }

    static async getByAuctionId(auctionId: string): Promise<ParachainLeases[] | undefined>{
      
      const records = await store.getByField('ParachainLeases', 'auctionId', auctionId);
      return records.map(record => ParachainLeases.create(record));
      
    }

    static async getByActiveForAuction(activeForAuction: string): Promise<ParachainLeases[] | undefined>{
      
      const records = await store.getByField('ParachainLeases', 'activeForAuction', activeForAuction);
      return records.map(record => ParachainLeases.create(record));
      
    }

    static async getByHasWon(hasWon: boolean): Promise<ParachainLeases[] | undefined>{
      
      const records = await store.getByField('ParachainLeases', 'hasWon', hasWon);
      return records.map(record => ParachainLeases.create(record));
      
    }


    static create(record){
        let entity = new ParachainLeases(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

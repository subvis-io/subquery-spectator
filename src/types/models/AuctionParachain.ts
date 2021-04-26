// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class AuctionParachain implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public auctionId: string;

    public parachainId: string;

    public blockNum: number;

    public createdAt: Date;

    public firstSlot: number;

    public lastSlot: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save AuctionParachain entity without an ID");
        await store.set('AuctionParachain', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove AuctionParachain entity without an ID");
        await store.remove('AuctionParachain', id.toString());
    }

    static async get(id:string): Promise<AuctionParachain | undefined>{
        assert((id !== null && id !== undefined), "Cannot get AuctionParachain entity without an ID");
        const record = await store.get('AuctionParachain', id.toString());
        if (record){
            return AuctionParachain.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new AuctionParachain(record.id);
        Object.assign(entity,record);
        return entity;
    }
}

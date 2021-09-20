import EventEmitter from 'events';
import JSONB from 'json-buffer';
import { KeyvSqlite } from './KeyvSqlite';

export class Keyv extends EventEmitter{
    private opts:any;

    public constructor(uri: string|any, opts?){
        super();
        this.opts=Object.assign({
            namespace: "keyv",
            serialize: JSONB.stringify,
            deserialize: JSONB.parse
        },
        (typeof uri==="string")? {uri} : uri,
        opts);

        if(!this.opts.store){
            this.opts.store=new KeyvSqlite(this.opts);
        }

        if(typeof this.opts.store.on==="function"){
            this.opts.store.on("error", err=>this.emit("error", err));
        }

        this.opts.store.namespace=this.opts.namespace;
    }

    private getKeyPrefix(key : string) : string{
        return `${this.opts.namespace}:${key}`;
    }

    private stripKeyPrefix(fullKey : string) :string {
        const nsregexp = new RegExp('^' + this.opts.namespace + ':');
        return fullKey.replace(nsregexp, '');
    }



    private parseValue(key, data, opts: any = {}) {
        let value;
        const raw = opts ? opts.raw : false;
        if (typeof data === 'string') {
            value = this.opts.deserialize(data);
        } else {
            value = data;
        }
        if (data === undefined) {
            return undefined;
        }
        if (typeof data.expires === 'number' && Date.now() > data.expires) {
            if (opts.removeExpired === true) {
                this.delete(key);
            }
            return undefined;
        }
        if (raw === true) {
            return value;
        } else {
            return value.value;
        }
    }

    public get(key : string, opts?) : Promise<any>{
        opts=Object.assign({removeExpired: true}, opts);
        const oldKey=key;
        key=this.getKeyPrefix(key);
        const store=this.opts.store;
        return Promise.resolve()
            .then(()=>store.get(key))
            .then(data=>{
                data = (typeof data==="string") ? this.opts.deserialize(data) : data;
                return this.parseValue(oldKey, data, opts);
            });
    }

    public query(q : string) : Promise<any>{
        const store=this.opts.store;

        return store.query(q);
    }

    public set(key : string, value : any, ttl?){
        key = this.getKeyPrefix(key);
        if (typeof ttl === 'undefined') {
            ttl = this.opts.ttl;
        }
        if (ttl === 0) {
            ttl = undefined;
        }
        const store = this.opts.store;

        return Promise.resolve()
            .then(() => {
                const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
                value = { value, expires };
                return store.set(key, this.opts.serialize(value), ttl);
            })
            .then(() => true);
    }

    public delete(key : string){
        key = this.getKeyPrefix(key);
        const store = this.opts.store;
        return Promise.resolve()
            .then(() => store.delete(key));
    }

    public clear(){
        const store = this.opts.store;
        return Promise.resolve()
            .then(() => store.clear());
    }

    public keys() {
        return Promise.resolve()
            .then(()=>this.query("SELECT * FROM keyv"))
            .then(data=>{
                const lst=[];
                data.forEach(element => {
                    lst.push(this.stripKeyPrefix(element.key));
                });
                return lst;
            });
    }

    public values(opts?) {
        return Promise.resolve()
            .then(()=>this.query("SELECT * FROM keyv"))
            .then(data=>{
                const lst=[];
                data.forEach(element => {
                    lst.push(this.parseValue(element.key, element.value, opts));
                });
                return lst;
            });
    }

    public valuesFrom(key, opts?){
        return Promise.resolve()
            .then(()=>this.query(`SELECT * FROM keyv`))
            .then(data=>{
                const lst=[];
                data.forEach(element => {
                    if(element.key===this.getKeyPrefix(key))
                        lst.push(this.parseValue(element.key, element.value, opts));
                });
                return lst;
            });
    }

    public entries(opts?){
        return Promise.resolve()
            .then(()=>this.query("SELECT * FROM keyv"))
            .then((data)=>{
                const newData:{"key": string, "value": any}[]=[];
                data.forEach(e=>{
                    newData.push({
                        "key": this.stripKeyPrefix(e["key"]),
                        "value": this.parseValue(e["key"], e["value"], opts)
                    });
                });
                return newData;
            });
    }
}
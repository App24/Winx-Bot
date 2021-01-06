module.exports=class Command{
    constructor(name){
        this.name=name;
    }

    set name(value){
        this._name=value;
    }

    get name(){
        return this._name;
    }

    set description(value){
        this._description=value;
    }

    get description(){
        return this._description;
    }

    set usage(value){
        this._usage=value;
    }

    get usage(){
        return this._usage;
    }

    set args(value){
        this._args=value;
    }

    get args(){
        return this._args;
    }

    set permissions(value){
        this._permissions=value;
    }

    get permissions(){
        return this._permissions;
    }

    set deprecated(value){
        this._deprecated=value;
    }

    get deprecated(){
        return this._deprecated;
    }

    set run(value){
        this._run=value;
    }

    get run(){
        return this._run;
    }

    set cooldown(value){
        this._cooldown=value;
    }

    get cooldown(){
        return this._cooldown;
    }

    set ownerOnly(value){
        this._ownerOnly=value;
    }

    get ownerOnly(){
        return this._ownerOnly;
    }

    set hidden(value){
        this._hidden=value;
    }

    get hidden(){
        return this._hidden;
    }

    set aliases(value){
        this._aliases=value;
    }

    get aliases(){
        return this._aliases;
    }
}
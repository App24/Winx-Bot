const CAT_SETTINGS="Settings";
const CAT_OWNER="Owner";
const CAT_TINGZ="Characters";
const CAT_RANK="Rankings";
const CAT_INFO="Info";
const CAT_CUSTOM="Customisation";
const CAT_PATREON="Patreon";

class Command{
    constructor(name){
        this.name=name;
        this.minArgsLength=1;
        this.guildOnly=true;
        this.category="Other";
    }

    set guildOnly(value){
        this._guildOnly=value;
    }

    get guildOnly(){
        return this._guildOnly;
    }

    set name(value){
        this._name=value;
    }

    get name(){
        return this._name;
    }

    set modOnly(value){
        this._modOnly=value;
    }

    get modOnly(){
        return this._modOnly;
    }

    set minArgsLength(value){
        this._minArgsLength=value;
    }

    get minArgsLength(){
        return this._minArgsLength;
    }

    set paid(value){
        this._paid=value;
    }

    get paid(){
        return this._paid;
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

    // set run(value){
    //     this._run=value;
    // }

    // get run(){
    //     return this._run;
    // }

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

    set category(value){
        this._category=value;
    }

    get category(){
        return this._category;
    }

    async onRun(bot,message,args){}

    _printTLArgsError(message, num){
        message.reply(`You need ${num} arguments!`);
    }

    static get SettingsCategory(){
        return CAT_SETTINGS;
    }

    static get OwnerCategory(){
        return CAT_OWNER;
    }

    static get TingzCategory(){
        return CAT_TINGZ;
    }

    static get RankCategory(){
        return CAT_RANK;
    }

    static get InfoCategory(){
        return CAT_INFO;
    }

    static get CustomisationCategory(){
        return CAT_CUSTOM;
    }

    static get PatreonCategory(){
        return CAT_PATREON;
    }
}

module.exports=Command;
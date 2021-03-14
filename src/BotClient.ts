import Discord, { Intents } from 'discord.js';
import fs from 'fs';
import Command from './Command';
import Keyv from './keyv-index';
import {loadFiles, isClass, asyncForEach} from "./Utils";

class BotClient extends Discord.Client{
    private Tables = new Discord.Collection<string, Keyv>();
    public Commands = new Discord.Collection<string, Command>();

    public constructor(intents : Intents){
        super({ws: {intents: intents}});
        
        this.loadCommands();

        this.loadDatabases();
    }

    public async loadDatabases(){
        const databaseDir="databases";

        if(!fs.existsSync(databaseDir)){
            fs.mkdirSync(databaseDir);
        }

        const Levels = new Keyv(`sqlite://${databaseDir}/levels.sqlite`);
        const Ranks = new Keyv(`sqlite://${databaseDir}/ranks.sqlite`);
        const Excludes=new Keyv(`sqlite://${databaseDir}/excludes.sqlite`);
        const ServerInfo=new Keyv(`sqlite://${databaseDir}/serverInfo.sqlite`);
        const UserSettings=new Keyv(`sqlite://${databaseDir}/userSettings.sqlite`);
        const Errors=new Keyv(`sqlite://${databaseDir}/errors.sqlite`);
        const Paid=new Keyv(`sqlite://${databaseDir}/paid.sqlite`);
        const ModRoles=new Keyv(`sqlite://${databaseDir}/modRoles.sqlite`);
        const Suggestions=new Keyv(`sqlite://${databaseDir}/suggestions.sqlite`);
        const CustomCommands=new Keyv(`sqlite://${databaseDir}/customCommands.sqlite`);

        this.Tables.set("levels", Levels);
        this.Tables.set("ranks", Ranks);
        this.Tables.set("excludes", Excludes);
        this.Tables.set("serverInfo", ServerInfo);
        this.Tables.set("userSettings", UserSettings);
        this.Tables.set("errors", Errors);
        this.Tables.set("paid", Paid);
        this.Tables.set("modRoles", ModRoles);
        this.Tables.set("suggestions", Suggestions);
        this.Tables.set("customCommands", CustomCommands);
    }

    private loadCommands(){
        const files=loadFiles("dist/commands");
        if(!files) return;
        for(const file of files){
            if(file.endsWith(".js")){
                try{
                    const commandRequire=require(`./${file.substr(5, file.length)}`);
                    if(isClass(commandRequire)){
                        const command=new commandRequire();
                        if(!command.deprecated){
                            this.Commands.set(command.name, command);
                            console.log(`Loaded Command: ${command.name}`);
                        }
                    }
                }catch{}
            }
        }
    }

    public getDatabase(name : string) : Keyv{
        return this.Tables.get(name);
    }
}

export=BotClient;
import Discord, { Intents } from 'discord.js';
import fs from 'fs';
import path from 'path';
import Command from './Command';
import Keyv from './keyv-index';
import {loadFiles, isClass, asyncForEach} from "./Utils";

interface BotOptions{
    clientOptions? : Discord.ClientOptions;
    logLoading? : 'none' | 'simplified' | 'complex' | 'all';
    loadEvents? : boolean;
    loadCommands? : boolean;
}

class BotClient extends Discord.Client{
    private Tables = new Discord.Collection<string, Keyv>();
    public Commands = new Discord.Collection<string, Command>();

    private botOptions : BotOptions;

    public constructor(options?: BotOptions){
        super(options.clientOptions);
        this.botOptions=options;
        
        this.loadDatabases();
        if(this.botOptions.loadCommands)
            this.loadCommands();
        if(this.botOptions.loadEvents)
            this.loadEvents();
    }

    private loadDatabases(){
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
        const Suggestions=new Keyv(`sqlite://${databaseDir}/suggestions.sqlite`);
        const CustomCommands=new Keyv(`sqlite://${databaseDir}/customCommands.sqlite`);

        this.Tables.set("levels", Levels);
        this.Tables.set("ranks", Ranks);
        this.Tables.set("excludes", Excludes);
        this.Tables.set("serverInfo", ServerInfo);
        this.Tables.set("userSettings", UserSettings);
        this.Tables.set("errors", Errors);
        this.Tables.set("paid", Paid);
        this.Tables.set("suggestions", Suggestions);
        this.Tables.set("customCommands", CustomCommands);
    }

    private loadCommands(){
        const files=loadFiles("dist/commands");
        if(!files) return;
        let loaded=0;
        for(const file of files){
            if(file.endsWith(".js")){
                try{
                    const commandRequire=require(`./${file.substr(5, file.length)}`);
                    if(isClass(commandRequire)){
                        const command=new commandRequire();
                        if(!command.deprecated){
                            const name=path.basename(file).slice(0,-3);
                            this.Commands.set(name, command);
                            switch(this.botOptions.logLoading){
                                case 'complex':
                                case 'all':
                                    console.log(`Loaded Command: ${name}`);
                                    break;
                            }
                            loaded++;
                        }
                    }
                }catch{}
            }
        }
        switch(this.botOptions.logLoading){
            case 'simplified':
            case 'all':
                console.log(`Loaded ${loaded} commands!`);
                break;
        }
    }

    private loadEvents(){
        const files=loadFiles("dist/events");
        if(!files) return;
        let loaded=0;
        ;(async()=>{
            for(const file of files){
                if(file.endsWith(".js")){
                    const event=await import(`./${file.substr(5, file.length)}`);
                    const {default: func}=event;
                    const name=path.basename(file).slice(0,-3);
    
                    if(typeof func !== "function"){
                        continue;
                    }
    
                    func(this);

                    switch(this.botOptions.logLoading){
                        case 'complex':
                        case 'all':
                            console.log(`Loaded Event: ${name}`);
                            break;
                    }
                    loaded++;
                }
            }
            switch(this.botOptions.logLoading){
                case 'simplified':
                case 'all':
                    console.log(`Loaded ${loaded} events!`);
                    break;
            }
        })();
    }

    public getDatabase(name : string) : Keyv{
        return this.Tables.get(name);
    }
}

export=BotClient;
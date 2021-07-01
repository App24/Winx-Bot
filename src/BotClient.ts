import Discord, { Intents } from 'discord.js';
import fs from 'fs';
import path from 'path';
import Command from './Command';
import DatabaseType from './DatabaseTypes';
import Keyv from './keyv-index';
import SlashCommand from './SlashCommand';
import {loadFiles, isClass, asyncForEach} from "./Utils";
import Logger from './Logger';

interface BotOptions{
    clientOptions? : Discord.ClientOptions;
    logLoading? : 'none' | 'simplified' | 'complex' | 'all';
    loadEvents? : boolean;
    loadCommands? : boolean;
    loadSlashes? : boolean;
}

class BotClient extends Discord.Client{
    private Tables = new Discord.Collection<DatabaseType, Keyv>();
    public Commands = new Discord.Collection<string, Command>();
    public Slashes = new Discord.Collection<string, SlashCommand>();

    private botOptions : BotOptions;

    public constructor(options?: BotOptions){
        super(options.clientOptions);
        this.botOptions=options;
        
        Logger.Initialise();
        this.loadDatabases();
        ;(async()=>{
            if(this.botOptions.loadCommands)
                await this.loadCommands();
            if(this.botOptions.loadSlashes)
                await this.loadSlashes();
            if(this.botOptions.loadEvents)
                await this.loadEvents();
        })();
    }

    private loadDatabases(){
        const databaseDir="databases";

        if(!fs.existsSync(databaseDir)){
            fs.mkdirSync(databaseDir);
        }

        this.Tables.set(DatabaseType.Levels, new Keyv(`sqlite://${databaseDir}/levels.sqlite`));
        this.Tables.set(DatabaseType.Ranks, new Keyv(`sqlite://${databaseDir}/ranks.sqlite`));
        this.Tables.set(DatabaseType.Excludes, new Keyv(`sqlite://${databaseDir}/excludes.sqlite`));
        this.Tables.set(DatabaseType.ServerInfo, new Keyv(`sqlite://${databaseDir}/serverInfo.sqlite`));
        this.Tables.set(DatabaseType.UserSettings, new Keyv(`sqlite://${databaseDir}/userSettings.sqlite`));
        this.Tables.set(DatabaseType.Errors, new Keyv(`sqlite://${databaseDir}/errors.sqlite`));
        this.Tables.set(DatabaseType.Paid, new Keyv(`sqlite://${databaseDir}/paid.sqlite`));
        this.Tables.set(DatabaseType.Suggestions, new Keyv(`sqlite://${databaseDir}/suggestions.sqlite`));
        this.Tables.set(DatabaseType.CustomCommands, new Keyv(`sqlite://${databaseDir}/customCommands.sqlite`));

        Logger.Log("Loaded Databases!");
    }

    private async loadCommands(){
        const files=loadFiles("dist/commands");
        if(!files) return;
        let loaded=0;
        for(const file of files){
            if(file.endsWith(".js")){
                try{
                    const commandImport=await import(`./${file.substr(5, file.length)}`);
                    const {default: cClass}=commandImport;
                    if(isClass(cClass)){
                        const command=new cClass();
                        if(!command.deprecated){
                            const name=path.basename(file).slice(0,-3);
                            this.Commands.set(name, command);
                            switch(this.botOptions.logLoading){
                                case 'complex':
                                case 'all':
                                    Logger.Log(`Loaded Command: ${name}`);
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
                Logger.Log(`Loaded ${loaded} commands!`);
                break;
        }
    }

    private async loadEvents(){
        const files=loadFiles("dist/events");
        if(!files) return;
        let loaded=0;
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
                        Logger.Log(`Loaded Event: ${name}`);
                        break;
                }
                loaded++;
            }
        }
        switch(this.botOptions.logLoading){
            case 'simplified':
            case 'all':
                Logger.Log(`Loaded ${loaded} events!`);
                break;
        }
    }

    private async loadSlashes(){
        const files=loadFiles("dist/slashes");
        if(!files) return;
        let loaded=0;
        for(const file of files){
            if(file.endsWith(".js")){
                try{
                    const slash=await import(`./${file.substr(5, file.length)}`);
                    const {data, onRun}=slash;
                    const name=(data&&data.name)?data.name:path.basename(file).slice(0,-3);
                    data.name=name;

                    const command=new SlashCommand(data||{}, onRun);
                    this.Slashes.set(name, command);

                    switch(this.botOptions.logLoading){
                        case 'complex':
                        case 'all':
                            Logger.Log(`Loaded Slash: ${name}`);
                            break;
                    }

                    loaded++;
                }catch{}
            }
        }
        switch(this.botOptions.logLoading){
            case 'simplified':
            case 'all':
                Logger.Log(`Loaded ${loaded} slashes!`);
                break;
        }
    }

    public getDatabase(name : DatabaseType) : Keyv{
        return this.Tables.get(name);
    }
}

export=BotClient;
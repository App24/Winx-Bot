import { Client, ClientOptions, Collection, Intents } from "discord.js";
import Keyv from "./keyv-index";
import { DatabaseType } from "./structs/DatabaseTypes";
import fs from 'fs';
import path from 'path';
import { DATABASE_FOLDER } from "./Constants";
import { loadFiles } from "./Utils";
import { Command } from "./structs/Command";
import { Localisation } from "./localisation";

interface BotOptions{
    clientOptions? : ClientOptions;
    logLoading? : 'none' | 'simplified' | 'complex' | 'all';
    loadEvents? : boolean;
    loadCommands? : boolean;
    loadSlashes? : boolean;
}

class BotClient extends Client{
    private databases=new Collection<DatabaseType, Keyv>();
    public Commands = new Collection<string, Command>();

    private botOptions : BotOptions;

    public constructor(options: BotOptions){
        super(options.clientOptions);
        this.botOptions=options;
        
        this.loadLocalisation();

        this.loadDatabases();
        ;(async()=>{
            if(this.botOptions.loadCommands)
                await this.loadCommands();
            // if(this.botOptions.loadSlashes)
            //     await this.loadSlashes();
            if(this.botOptions.loadEvents)
                await this.loadEvents();
        })();
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
                    const command=new cClass();
                    if(!command.deprecated){
                        const name=path.basename(file).slice(0,-3);
                        if(!command.description)
                            command.description=`${name}.command.description`;
                        this.Commands.set(name, command);
                        switch(this.botOptions.logLoading){
                            case 'complex':
                            case 'all':
                                console.log(Localisation.getTranslation("bot.load.command.complex", name));
                                break;
                        }
                        loaded++;
                    }
                }catch{}
            }
        }
        switch(this.botOptions.logLoading){
            case 'simplified':
            case 'all':
                console.log(Localisation.getTranslation("bot.load.command.simple", loaded));
                break;
        }
    }
    
    public loadDatabases(){
        if(!fs.existsSync(DATABASE_FOLDER)){
            fs.mkdirSync(DATABASE_FOLDER);
        }

        const values = Object.values(DatabaseType);
        values.forEach((value, index)=>{
            this.databases.set(<DatabaseType>value, new Keyv(`sqlite://${DATABASE_FOLDER}/${value}.sqlite`));
        });
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

                func();

                switch(this.botOptions.logLoading){
                    case 'complex':
                    case 'all':
                        console.log(Localisation.getTranslation("bot.load.event.complex", name));
                        break;
                }
                loaded++;
            }
        }
        switch(this.botOptions.logLoading){
            case 'simplified':
            case 'all':
                console.log(Localisation.getTranslation("bot.load.event.simple", loaded));
                break;
        }
    }

    public getDatabase(databaseType : DatabaseType) : Keyv{
        return this.databases.get(databaseType);
    }

    public loadLocalisation(){
        Localisation.loadLocalisation("lang/en.json");
    }

    public getCommand(commandName : string){
        return this.Commands.get(commandName)||this.Commands.find(cmd=>cmd.aliases&&cmd.aliases.includes(commandName));
    }
}

const intents=new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
export const BotUser=new BotClient({
    clientOptions: {ws: {intents: intents}},
    logLoading: 'simplified',
    loadCommands: true,
    loadEvents: true,
    loadSlashes: true
});
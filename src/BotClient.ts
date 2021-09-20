import { Client, ClientOptions, Collection, Intents } from "discord.js";
import path from "path";
import { DATABASE_FOLDER } from "./Constants";
import { Keyv } from "./keyv/keyv-index";
import { Localisation } from "./localisation";
import { DatabaseType } from "./structs/DatabaseTypes";
import { loadFiles } from "./utils/Utils";
import fs from "fs";
import { Command } from "./structs/Command";

interface BotOptions{
    clientOptions? : ClientOptions;
    logLoading : 'none' | 'simplified' | 'complex' | 'all';
    loadEvents : boolean;
    loadCommands : boolean;
}

class BotClient extends Client{
    private databases=new Collection<DatabaseType, Keyv>();
    public Commands = new Collection<string, Command>();

    private botOptions:BotOptions;

    public constructor(options: BotOptions){
        super(options.clientOptions);

        this.botOptions=options;

        this.loadLocalisation();

        this.loadDatabases();

        (async()=>{
            if(this.botOptions.loadCommands){
                await this.loadCommands();
            }
            if(this.botOptions.loadEvents){
                await this.loadEvents();
            }
        })();
    }
    
    public loadDatabases(){
        if(!fs.existsSync(DATABASE_FOLDER)){
            fs.mkdirSync(DATABASE_FOLDER);
        }

        const values = Object.values(DatabaseType);
        values.forEach((value)=>{
            this.databases.set(<DatabaseType>value, new Keyv(`sqlite://${DATABASE_FOLDER}/${value}.sqlite`));
        });
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

    private async loadEvents(){
        const files=loadFiles("dist/events");
        if(!files) return;
        let loaded=0;
        for(const file of files){
            if(file.endsWith(".js")){
                const event=await import(`./${file.substr(5, file.length)}`);
                const {default: func}=event;
                const name=path.basename(file).slice(0, -3);

                if(typeof func !== "function") continue;

                func();

                switch(this.botOptions.logLoading){
                case "complex":
                case "all":
                    console.log(Localisation.getTranslation("bot.load.event.complex", name));
                    break;
                }
                loaded++;
            }
        }

        switch(this.botOptions.logLoading){
        case "simplified":
        case "all":
            console.log(Localisation.getTranslation("bot.load.event.simple", loaded));
            break;
        }
    }

    public loadLocalisation(){
        Localisation.clearLocalisation();

        Localisation.loadLocalisation("lang/activities.json");
        Localisation.loadLocalisation("lang/arguments.json");
        Localisation.loadLocalisation("lang/buttons.json");
        Localisation.loadLocalisation("lang/categories.json");
        Localisation.loadLocalisation("lang/commandDescriptions.json");
        Localisation.loadLocalisation("lang/commands.json");
        Localisation.loadLocalisation("lang/errors.json");
        Localisation.loadLocalisation("lang/generics.json");
        Localisation.loadLocalisation("lang/levels.json");
        Localisation.loadLocalisation("lang/miscs.json");
    }

    public getDatabase(databaseType : DatabaseType) : Keyv{
        return this.databases.get(databaseType);
    }

    public getCommand(commandName : string){
        return this.Commands.get(commandName)||this.Commands.find(cmd=>cmd.aliases&&cmd.aliases.includes(commandName));
    }
}

const intents=new Intents(Intents.FLAGS.DIRECT_MESSAGES|Intents.FLAGS.DIRECT_MESSAGE_REACTIONS|Intents.FLAGS.DIRECT_MESSAGE_TYPING|Intents.FLAGS.GUILDS|Intents.FLAGS.GUILD_BANS|Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS|Intents.FLAGS.GUILD_INTEGRATIONS|Intents.FLAGS.GUILD_INVITES|Intents.FLAGS.GUILD_MEMBERS|Intents.FLAGS.GUILD_MESSAGES|Intents.FLAGS.GUILD_MESSAGE_REACTIONS|Intents.FLAGS.GUILD_MESSAGE_TYPING|Intents.FLAGS.GUILD_VOICE_STATES|Intents.FLAGS.GUILD_WEBHOOKS);
export const BotUser=new BotClient({
    clientOptions: {intents: intents, allowedMentions: {repliedUser: false}, partials: ["CHANNEL"]},
    logLoading: 'simplified',
    loadCommands: true,
    loadEvents: true
});
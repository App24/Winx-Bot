import fs from "fs";
import { Message } from "discord.js";
import { BotUser } from "../../../BotClient";
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { Owner } from "../../../structs/Category";
import { Command, CommandAccess } from "../../../structs/Command";
import { DatabaseType } from "../../../structs/DatabaseTypes";

class RestoreDBCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
    }

    public async onRun(message : Message, args : string[]){
        if(!fs.existsSync(DATABASE_BACKUP_FOLDER)){
            return message.reply(Localisation.getTranslation("restoredb.empty.backups"));
        }

        const values = Object.values(DatabaseType);
        values.forEach((value, index)=>{
            fs.copyFileSync(`${DATABASE_BACKUP_FOLDER}/${value}.sqlite`, `${DATABASE_FOLDER}/${value}.sqlite`);
        });

        BotUser.loadDatabases();

        message.channel.send(Localisation.getTranslation("generic.done"));
    }
}

export=RestoreDBCommand;
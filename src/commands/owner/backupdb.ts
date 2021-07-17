import { Message } from "discord.js";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess } from "../../structs/Command";
import fs from "fs";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DATABASE_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";

class BackupDBCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
    }

    public async onRun(message : Message, args : string[]){
        const backUpDatabaseFolder="backupDatabases";

        if(!fs.existsSync(backUpDatabaseFolder)){
            fs.mkdirSync(backUpDatabaseFolder);
        }

        const values = Object.values(DatabaseType);
        values.forEach((value, index)=>{
            fs.copyFileSync(`${DATABASE_FOLDER}/${value}.sqlite`, `${backUpDatabaseFolder}/${value}.sqlite`);
        });
        message.channel.send(Localisation.getTranslation("generic.done"));
    }
}

export=BackupDBCommand;
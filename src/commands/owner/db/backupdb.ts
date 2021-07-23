import { Message } from "discord.js";
import { Owner } from "../../../structs/Category";
import { Command, CommandAccess, CommandArguments } from "../../../structs/Command";
import fs from "fs";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { backupDatabases } from "../../../Utils";

class BackupDBCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
    }

    public async onRun(cmdArgs : CommandArguments){
        backupDatabases();
        cmdArgs.channel.send(Localisation.getTranslation("generic.done"));
    }
}

export=BackupDBCommand;
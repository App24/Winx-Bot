import { Localisation } from "../../../localisation";
import { Owner } from "../../../structs/Category";
import { Command, CommandAccess, CommandArguments } from "../../../structs/Command";
import { backupDatabases } from "../../../Utils";

class BackupDBCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
    }

    public async onRun(cmdArgs : CommandArguments){
        backupDatabases();
        cmdArgs.message.reply(Localisation.getTranslation("generic.done"));
    }
}

export=BackupDBCommand;
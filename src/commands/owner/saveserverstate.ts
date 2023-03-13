import { SaveServerStateBaseCommand } from "../../baseCommands/owner/SaveServerState";
import { Owner } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class SaveServerStateCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;

        this.baseCommand = new SaveServerStateBaseCommand();
    }

    // public onRun(cmdArgs: CommandArguments) {
    //     BotUser.loadLocalisation();
    //     cmdArgs.message.reply(Localisation.getTranslation("reloadlocalisation.reload"));
    // }
}

export = SaveServerStateCommand;
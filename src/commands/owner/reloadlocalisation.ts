import { ReloadLocalisationBaseCommand } from "../../baseCommands/owner/ReloadLocalisation";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class ReloadLocalisationCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;
        this.aliases = ["reloadlocal", "relocal"];

        this.baseCommand = new ReloadLocalisationBaseCommand();
    }

    // public onRun(cmdArgs: CommandArguments) {
    //     BotUser.loadLocalisation();
    //     cmdArgs.message.reply(Localisation.getTranslation("reloadlocalisation.reload"));
    // }
}

export = ReloadLocalisationCommand;
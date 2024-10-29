import { BotUser } from "../../BotClient";
import { Localisation, LocalisationType } from "../../localisation";
import { BaseCommand } from "../../structs/BaseCommand";
import { CommandArgumentsType } from "../../structs/CommandTypes";
import { LocalisationKeys } from "../../structs/LocalKeys";
import { loadFiles } from "../../utils/Utils";

export class ReloadLocalisationBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.perms = "BotOwner";
    }

    async onRun(cmdArgs: CommandArgumentsType) {
        await cmdArgs.reply({key: LocalisationKeys.reply_checking});
        BotUser.loadLocalisation();
        cmdArgs.reply({ key: LocalisationKeys.reply_done });
    }
}
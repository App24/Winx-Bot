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
        await BotUser.shard.broadcastEval((_) => {
            Localisation.clearLocalisation();
            const files = loadFiles("lang", ".json");
            if (!files) return;
            for (const file of files) {
                Localisation.loadLocalisation(file);
            }
        });
        cmdArgs.reply({ key: LocalisationKeys.reply_done });
    }
}
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { BaseCommand } from "../../structs/BaseCommand";
import { CommandArgumentsType } from "../../structs/CommandTypes";
import { LocalisationKeys } from "../../structs/LocalKeys";

export class TestLocalisationBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.perms = "BotOwner";
    }

    async onRun(cmdArgs: CommandArgumentsType) {
        const missingLocalisation:string[]=[];

        BotUser.commands.forEach((c) => {
            if(!Localisation.hasLocalisation(<any>c.baseCommand.description)){
                missingLocalisation.push(c.baseCommand.description);
            }
        });

        var keys = Object.values(LocalisationKeys);

        keys.forEach(v => {
            if(!Localisation.hasLocalisation(v)){
                missingLocalisation.push(v);
            }
        });

        console.log(missingLocalisation);
        cmdArgs.reply({key: LocalisationKeys.reply_done});
    }
}
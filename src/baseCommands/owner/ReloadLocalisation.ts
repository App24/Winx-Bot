import { BotUser } from "../../BotClient";
import { CommandAccess } from "../../structs/CommandAccess";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ReloadLocalisationBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        BotUser.loadLocalisation();
        cmdArgs.reply("reloadlocalisation.reload");
    }
}
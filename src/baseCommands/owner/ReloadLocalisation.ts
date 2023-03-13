import { BotUser } from "../../BotClient";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ReloadLocalisationBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        BotUser.loadLocalisation();
        cmdArgs.reply("reloadlocalisation.reload");
    }
}
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CardWebsiteBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        cmdArgs.reply("https://app24.github.io/cardeditor/");
    }
}
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SuggestionsBaseCommand extends BaseCommand{
    public async onRun(cmdArgs: BaseCommandType) {
        cmdArgs.reply("Needs to redo");
    }
}
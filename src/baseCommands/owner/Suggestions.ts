import { CommandAccess } from "../../structs/CommandAccess";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SuggestionsBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        cmdArgs.reply("Needs to redo");
    }
}
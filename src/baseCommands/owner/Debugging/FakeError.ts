import { BaseCommand, BaseCommandType } from "../../BaseCommand";
import { reportBotError } from "../../../utils/Utils";
import { CommandAccess } from "../../../structs/CommandAccess";

export class FakeErrorBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        reportBotError("Test", cmdArgs.body);
    }
}
import { BaseCommand, BaseCommandType } from "../../BaseCommand";
import { reportBotError } from "../../../utils/Utils";

export class FakeErrorBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        reportBotError("Test", cmdArgs.body);
    }
}
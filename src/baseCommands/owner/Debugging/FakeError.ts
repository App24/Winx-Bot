import { BaseCommand, BaseCommandType } from "../../BaseCommand";
import { reportError } from "../../../utils/Utils";

export class FakeErrorBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        reportError("Test", cmdArgs.body);
    }
}
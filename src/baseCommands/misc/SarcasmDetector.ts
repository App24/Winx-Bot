import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SarcasmDetectorBaseCommand extends BaseCommand {
    public onRun(cmdArgs: BaseCommandType) {
        if (Math.random() > 0.5) {
            cmdArgs.localisedReply("🟢 Sarcasm!");
        } else {
            cmdArgs.localisedReply("🔴 Not Sarcasm!");
        }
    }
}
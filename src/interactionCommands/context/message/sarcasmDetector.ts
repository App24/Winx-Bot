import { SlashCommand, SlashCommandArguments } from "../../../structs/SlashCommand";

class SarcasmDetectorSlashCommand extends SlashCommand {
    public constructor() {
        super({ type: "MESSAGE", name: "Sarcasm Detector" });
    }

    public async onRun(cmdArgs: SlashCommandArguments) {
        if (Math.random() > 0.5) {
            cmdArgs.interaction.followUp("🟢 Sarcasm!");
        } else {
            cmdArgs.interaction.followUp("🔴 Not Sarcasm!");
        }
    }
}

export = SarcasmDetectorSlashCommand;
import { ApplicationCommandType } from "discord.js";
import { SarcasmDetectorBaseCommand } from "../../../baseCommands/misc/SarcasmDetector";
import { SlashCommand } from "../../../structs/SlashCommand";

class SarcasmDetectorSlashCommand extends SlashCommand {
    public constructor() {
        super({ type: ApplicationCommandType.Message, name: "Sarcasm Detector" });
        this.baseCommand = new SarcasmDetectorBaseCommand();
    }
}

export = SarcasmDetectorSlashCommand;
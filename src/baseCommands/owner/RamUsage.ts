import { memoryUsage } from "process";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAccess } from "../../structs/CommandAccess";

export class RamUsageBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const bytes = memoryUsage.rss();
        const exts = ["B", "KB", "MB", "GB", "TB"];
        let ext = 0;
        let size = bytes;
        while (size >= 1024 && ext < exts.length - 1) {
            size /= 1024;
            ext++;
        }

        cmdArgs.reply("ramusage.output", size.toFixed(2), exts[ext]);
    }
}
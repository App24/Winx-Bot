import { memoryUsage } from "process";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class RamUsageCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const bytes = memoryUsage.rss();
        const exts = ["B", "KB", "MB", "GB", "TB"];
        let ext = 0;
        let size = bytes;
        while (size >= 1024 && ext < exts.length - 1) {
            size /= 1024;
            ext++;
        }

        cmdArgs.message.reply(Localisation.getTranslation("ramusage.output", size.toFixed(2), exts[ext]));
    }
}

export = RamUsageCommand;
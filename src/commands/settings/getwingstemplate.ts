import { Settings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { drawTemplateCard } from "../../utils/CardUtils";
import { canvasToMessageAttachment } from "../../utils/Utils";

class GetWingsTemplateCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;
    }

    public async onRun(cmdArgs: CommandArguments) {
        cmdArgs.message.reply({ files: [canvasToMessageAttachment(await drawTemplateCard(cmdArgs.member))] });
    }
}

export = GetWingsTemplateCommand;
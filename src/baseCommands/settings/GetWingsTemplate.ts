import { drawTemplateCard } from "../../utils/CardUtils";
import { canvasToMessageAttachment } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class GetWingsTemplateBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        cmdArgs.reply({ files: [canvasToMessageAttachment(await drawTemplateCard(cmdArgs.member))] });
    }
}
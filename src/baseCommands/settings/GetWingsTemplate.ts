import { drawTemplateCard } from "../../utils/CardUtils";
import { canvasToMessageAttachment } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class GeTWingsTemplateBaseCommand extends BaseCommand{
    public async onRun(cmdArgs: BaseCommandType) {
        cmdArgs.reply({ files: [canvasToMessageAttachment(await drawTemplateCard(cmdArgs.member))] });
    }
}
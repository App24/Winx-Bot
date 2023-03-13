import { Attachment } from "discord.js";
import { BotUser } from "../../BotClient";
import { CommandArguments } from "../../structs/Command";
import { getImageReply } from "../../utils/ReplyUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SetPfpBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        let image: Attachment;
        if (cmdArgs instanceof CommandArguments) {
            image = cmdArgs.message.attachments.first();
        } else {
            const imageData = await getImageReply({ author: cmdArgs.author, sendTarget: cmdArgs.interaction });
            image = imageData.value;
        }
        if (!image) return cmdArgs.reply("Please upload an image as well!");

        if (!image.name.toLowerCase().endsWith(".png")) return cmdArgs.reply("error.invalid.image");

        BotUser.user.setAvatar(image.url);

        cmdArgs.reply("Updated pfp!");
    }
}
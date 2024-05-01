import { DMChannel } from "discord.js";
import { getUserById } from "../../utils/GetterUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ContactCreatorBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const messageContent = cmdArgs.args.join(" ");
        const owner = await getUserById(process.env.OWNER_ID);
        const channel: DMChannel = await owner.createDM().catch(() => undefined);
        if (!channel) {
            return cmdArgs.localisedReply("Couldn't send DM");
        }
        channel.send(`${cmdArgs.author}: ${messageContent}`);
        cmdArgs.reply("generic.sent");
    }
}
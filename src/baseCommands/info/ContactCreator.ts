import { getUserById } from "../../utils/GetterUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ContactCreatorBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const messageContent = cmdArgs.args[0];
        const owner = await getUserById(process.env.OWNER_ID);
        (await owner.createDM()).send(`${cmdArgs.author}: ${messageContent}`);
        cmdArgs.reply("generic.sent");
    }
}
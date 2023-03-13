import { getUserFromMention } from "../../utils/GetterUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class MessageUserBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const user = await getUserFromMention(cmdArgs.args.shift());
        if (!user) return cmdArgs.reply("error.invalid.user");
        const msg = cmdArgs.args.join(" ");
        user.createDM().then(channel => {
            channel.send(msg);
            cmdArgs.reply("generic.sent");
        }).catch(() => {
            cmdArgs.reply("error.unable.dm");
        });
    }
}
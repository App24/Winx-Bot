import { getUserFromMention } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandUsage, CommandArguments } from "../../structs/Command";

class MessageUserCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.usage = [new CommandUsage(true, "argument.user"), new CommandUsage(true, "argument.message")];
        this.minArgs = 2;
        this.category = Owner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const user = await getUserFromMention(cmdArgs.args.shift());
        if (!user) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.user"));
        const msg = cmdArgs.args.join(" ");
        user.createDM().then(channel => {
            channel.send(msg);
            cmdArgs.message.reply(Localisation.getTranslation("generic.sent"));
        }).catch(() => {
            cmdArgs.message.reply(Localisation.getTranslation("error.unable.dm"));
        });
    }
}

export = MessageUserCommand;
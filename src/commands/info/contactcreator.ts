import { Info } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { ContactCreatorBaseCommand } from "../../baseCommands/info/ContactCreator";

class ContactCreatorCommand extends Command {
    public constructor() {
        super();
        this.category = Info;
        this.usage = [new CommandUsage(true, "argument.message")];

        this.baseCommand = new ContactCreatorBaseCommand();
    }

    /*public async onRun(cmdArgs: CommandArguments) {
        const messageContent = cmdArgs.args.join(" ");
        const owner = await getUserById(process.env.OWNER_ID);
        (await owner.createDM()).send(`${cmdArgs.author}: ${messageContent}`);
        cmdArgs.message.reply(Localisation.getTranslation("generic.sent"));
    }*/
}

export = ContactCreatorCommand;
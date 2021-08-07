import { OWNER_ID } from "../../Constants";
import { getUserById } from "../../GetterUtils";
import { Localisation } from "../../localisation";
import { Info } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";

class ContactCreatorCommand extends Command{
    public constructor(){
        super();
        this.minArgs=1;
        this.category=Info;
        this.usage=[new CommandUsage(true, "argument.message")];
    }

    public async onRun(cmdArgs : CommandArguments){
        const messageContent=cmdArgs.args.join(" ");
        const owner=await getUserById(OWNER_ID);
        (await owner.createDM()).send(`${cmdArgs.author}: ${messageContent}`);
        cmdArgs.message.reply(Localisation.getTranslation("generic.sent"));
    }
}

export=ContactCreatorCommand;
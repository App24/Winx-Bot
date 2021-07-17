import { Message } from "discord.js";
import { OWNER_ID } from "../../Constants";
import { getUserByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Info } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";

class ContactCreatorCommand extends Command{
    public constructor(){
        super();
        this.minArgs=1;
        this.category=Info;
        this.usage=[new CommandUsage(true, "argument.message")];
    }

    public async onRun(message : Message, args : string[]){
        const messageContent=args.join(" ");
        const owner=await getUserByID(OWNER_ID);
        (await owner.createDM()).send(`${message.author}: ${messageContent}`);
        message.reply(Localisation.getTranslation("generic.sent"));
    }
}

export=ContactCreatorCommand;
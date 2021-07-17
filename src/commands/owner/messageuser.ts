import { Message } from "discord.js";
import { getUserFromMention } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandUsage } from "../../structs/Command";

class MessageUserCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.usage=[new CommandUsage(true, "argument.user"), new CommandUsage(true, "argument.message")];
        this.minArgs=2;
        this.category=Owner;
    }

    public async onRun(message : Message, args : string[]){
        const user=await getUserFromMention(args.shift());
        if(!user) return message.reply(Localisation.getTranslation("error.invalid.user"));
        const msg=args.join(" ");
        user.createDM().then(channel=>{
            channel.send(msg);
            message.channel.send(Localisation.getTranslation("generic.sent"));
        }).catch(()=>{
            message.reply(Localisation.getTranslation("error.unable.dm"));
        });
    }
}

export=MessageUserCommand;
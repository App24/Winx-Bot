import { Message } from "discord.js";
import { getUserFromMention } from "../../GetterUtilts";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess } from "../../structs/Command";

class MessageUserCommand extends Command{
    public constructor(){
        super("Message user");
        this.access=CommandAccess.BotOwner;
        this.usage="<user> <message>";
        this.minArgs=2;
        this.category=Owner;
    }

    public async onRun(message : Message, args : string[]){
        const user=await getUserFromMention(args.shift());
        if(!user) return message.reply("That is not a valid user!");
        const msg=args.join(" ");
        user.createDM().then(channel=>{
            channel.send(msg);
            message.channel.send("Sent!");
        }).catch(()=>{
            message.reply("Cannot DM user!");
        });
    }
}

export=MessageUserCommand;
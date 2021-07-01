import Discord from 'discord.js';
import { Owner } from '../../Category';
import Command from '../../Command';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

class MessageUser extends Command{
    constructor(){
        super();
        this.creatorOnly=true;
        this.minArgsLength=2;
        this.usage="<user> <message>";
        this.guildOnly=false;
        this.category=Owner;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const user=await Utils.getUserFromMention(args[0], bot);
        if(!user) return message.reply("That is not a user!");
        args.shift();
        const mess=args.join(" ");
        await user.createDM().then((channel)=>{
            channel.send(mess);
            message.reply("Sent!");
        }).catch(_=>{
            message.reply("Cannot DM user!");
        })
    }

}

module.exports=MessageUser;
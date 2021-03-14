import Discord from 'discord.js';
import Command from '../../Command';
import * as Utils from '../../Utils';

class Patreon extends Command{
    constructor(){
        super("patreon");
        this.modOnly=true;
        this.hidden=true;
        this.args=true;
        this.minArgsLength=2;
        this.usage="<add/remove> <user>";
        this.category=Command.PatreonCategory;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const operation=args[0].toLowerCase();
        const Paid=bot.getDatabase("paid");
        const paid=await Utils.getServerDatabase(Paid, message.guild.id);
        const user=await Utils.getUserFromMention(args[1], bot);
        if(!user) return message.reply(`${args[1]} is not a valid user!`);
        const member=await Utils.getMemberByID(user.id, message.guild);
        if(!member) return message.reply(`${user} is not a member of the server!`);
        const userPaid=paid.find(other=>{return other===user.id;});
        if(operation==="add"){
            if(userPaid){
                return message.reply(`${user} is already a patreon!`);
            }
            paid.push(user.id);
            message.channel.send(`Successfully added ${user} as a patreon!`);
        }else if(operation==="remove"){
            if(!userPaid){
                return message.reply(`${user} is not a patreon!`);
            }
            const index=paid.indexOf(user.id);
            if(index>-1) paid.splice(index,1);
            message.channel.send(`Successfully removed ${user} as a patreon!`);
        }
        await Paid.set(message.guild.id, paid);
    }

}

module.exports=Patreon;
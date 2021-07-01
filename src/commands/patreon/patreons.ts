import Discord from 'discord.js';
import { Patreon } from '../../Category';
import Command from '../../Command';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

class Patreons extends Command{
    constructor(){
        super();
        this.hidden=true;
        this.permissions=["MANAGE_GUILD"]
        this.category=Patreon;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const Paid=bot.getDatabase(DatabaseType.Paid);
        const patreons=(await Paid.valuesFrom(message.guild.id))[0];
        if(!patreons||!patreons.length) return message.channel.send("No patreons in this server!");
        const embed=new Discord.MessageEmbed();
        const data=[];
        await Utils.asyncForEach(patreons, async(patreon)=>{
            const user=await Utils.getUserByID(patreon, bot);
            if(!user) return;
            data.push(user);
        });
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        if(botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);
        embed.setDescription(data);
        embed.setTitle("Patreons");
        message.channel.send(embed);
    }

}

module.exports=Patreons;
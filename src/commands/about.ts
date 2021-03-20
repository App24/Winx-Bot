import Discord from 'discord.js';
import Command from '../Command';
import * as Utils from '../Utils';
import {VERSION} from '../Constants';

class About extends Command{
    constructor(){
        super();
        this.description="About the bot";
        this.category=Command.InfoCategory;
        this.guildOnly=false;
    }

    public async onRun(bot : import("../BotClient"), message : Discord.Message, args: string[]){
        const embed=new Discord.MessageEmbed();
        const data=[];
        const creators=process.env.CREATORS.replace(" ", "").split(",");
        await Utils.asyncForEach(creators, async(creator)=>{
            const user=await Utils.getUserByID(creator, bot);
            if(user) data.push(user);
        });
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        embed.setTimestamp();
        embed.setAuthor((botMember&&botMember.nickname)||bot.user.username, bot.user.avatarURL());
        embed.addField("About", "This bot was created by and for Winx fans, it allows for users to level up and earn new transformations, it is entirely customisable from transformation names to when you get each!");
        embed.addField("Creators", data.join(", "));
        embed.addField("Version", VERSION);
        if(botMember&&botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);
        message.channel.send(embed);
    }
}

module.exports=About;
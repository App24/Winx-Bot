import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { CREATORS_ID, VERSION } from "../../Constants";
import { getUserByID } from "../../GetterUtilts";
import { Info } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { asyncForEach, getBotMember, getBotRoleColor } from "../../Utils";

class AboutCommand extends Command{
    public constructor(){
        super("About the bot");
        this.category=Info;
    }

    public async onRun(message : Message, args : string[]){
        const embed=new MessageEmbed();
        embed.setTitle("About");
        const data=[];
        await asyncForEach(CREATORS_ID, async(creator : string)=>{
            const user=await getUserByID(creator);
            if(user) data.push(user);
        });
        const botMember=await getBotMember(message.guild);
        embed.setAuthor((botMember&&botMember.nickname)||BotUser.user.username, BotUser.user.avatarURL());
        embed.addField("About", "This bot was created by and for Winx fans, it allows for users to level up and earn new transformations, it is entirely customisable from transformation names to when you get each!");
        embed.addField("Creators", data.join(", "));
        embed.addField("Version", VERSION);
        embed.setColor((await getBotRoleColor(message.guild)));
        message.channel.send(embed);
    }
}

export = AboutCommand;
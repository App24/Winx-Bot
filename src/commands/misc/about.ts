import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { CREATORS_ID, VERSION } from "../../Constants";
import { getUserByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Info } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { asyncForEach, getBotMember, getBotRoleColor } from "../../Utils";

class AboutCommand extends Command{
    public constructor(){
        super();
        this.category=Info;
    }

    public async onRun(message : Message, args : string[]){
        const embed=new MessageEmbed();
        const data=[];
        await asyncForEach(CREATORS_ID, async(creator : string)=>{
            const user=await getUserByID(creator);
            if(user) data.push(user);
        });
        const botMember=await getBotMember(message.guild);
        embed.setAuthor((botMember&&botMember.nickname)||BotUser.user.username, BotUser.user.avatarURL());
        embed.addField("About", Localisation.getTranslation("about.description.output"));
        embed.addField("Creators", data.join(", "));
        embed.addField("Version", VERSION);
        embed.setColor((await getBotRoleColor(message.guild)));
        message.channel.send(embed);
    }
}

export = AboutCommand;
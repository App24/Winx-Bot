import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { CREATORS_ID, VERSION } from "../../Constants";
import { getUserByID } from "../../GetterUtils";
import { Localisation } from "../../localisation";
import { Info } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { asyncForEach, getBotMember, getBotRoleColor } from "../../Utils";

class AboutCommand extends Command{
    public constructor(){
        super();
        this.category=Info;
    }

    public async onRun(cmdArgs : CommandArguments){
        const embed=new MessageEmbed();
        const data=[];
        await asyncForEach(CREATORS_ID, async(creator : string)=>{
            const user=await getUserByID(creator);
            if(user) data.push(user);
        });
        const botMember=await getBotMember(cmdArgs.guild);
        embed.setAuthor((botMember&&botMember.nickname)||BotUser.user.username, BotUser.user.avatarURL());
        embed.addField(Localisation.getTranslation("about.title.about"), Localisation.getTranslation("about.description.output"));
        embed.addField(Localisation.getTranslation("about.title.creators"), data.join(", "));
        embed.addField(Localisation.getTranslation("about.title.version"), VERSION);
        embed.addField(Localisation.getTranslation("about.title.github"), "https://github.com/App24/Winx-Bot");
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        cmdArgs.channel.send(embed);
    }
}

export = AboutCommand;
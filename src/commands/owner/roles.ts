import { MessageEmbed } from "discord.js";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandArguments } from "../../structs/Command";
import { getBotRoleColor } from "../../utils/GetterUtils";

class RolesCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.available=CommandAvailable.Guild;
        this.category=Owner;
        this.deprecated=true;
    }

    public async onRun(cmdArgs : CommandArguments){
        const data=[];
        cmdArgs.guild.roles.cache.forEach(role=>{
            data.push(`${role}: ${role.id}`);
        });

        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data.join("\n"));
        cmdArgs.message.reply({embeds: [embed]});
    }
}

export=RolesCommand;
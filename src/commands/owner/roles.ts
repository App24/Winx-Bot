import { Message, MessageEmbed } from "discord.js";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { getBotRoleColor } from "../../Utils";

class RolesCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.availability=CommandAvailability.Guild;
        this.category=Owner;
        this.deprecated=true;
    }

    public async onRun(message : Message, args : string[]){
        const data=[];
        message.guild.roles.cache.forEach(role=>{
            data.push(`${role}: ${role.id}`);
        });

        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        embed.setDescription(data);
        message.channel.send(embed);
    }
}

export=RolesCommand;
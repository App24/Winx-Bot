import Discord from 'discord.js';
import Command from '../../Command';
import * as Utils from '../../Utils';

class Roles extends Command{
    constructor(){
        super();
        this.creatorOnly=true;
        this.deprecated=true;
        this.category=Command.OwnerCategory;
    }

    public onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const data=[];
        message.guild.roles.cache.forEach(role => {
            data.push(`${role}: ${role.id}`);
        });

        message.channel.send(data);
    }

}

module.exports=Roles;
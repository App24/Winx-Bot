import Discord from 'discord.js';
import { Categories, Category, Info } from '../Category';
import Command from '../Command';
import * as Utils from '../Utils';

class Help extends Command{
    constructor(){
        super();
        this.usage="[category]";
        this.aliases=["commands"];
        this.description="Show commands";
        this.creatorOnly=true;
        this.category=Info;
        this.maxArgsLength=1;
    }

    public async onRun(bot: import("../BotClient"), message: Discord.Message, args: string[]) {
        const userMember=await Utils.getMemberByID(message.author.id, message.guild);

        if(!args.length){
            const data=[];
            Categories.forEach(category=>{
                if(!category.hidden)
                data.push(`${category.emoji}: **${category.name}**`);
            });

            data.push("You can use `w!help [category]` to get the commands of that category!");

            const embed=new Discord.MessageEmbed()
            .setDescription(data);
            const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
            if(botMember.roles&&botMember.roles.color)
                embed.setColor(botMember.roles.color.color);
            return message.channel.send(embed);
        }

        let category : Category;
        Categories.forEach(_category=>{
            if(_category.name.toLowerCase()===args[0].toLowerCase()){
                category=_category;
            }
        });
        if(!category){
            return message.reply(`${args[0]} is not a valid category!`);
        }

        const data=[];
        const embed=new Discord.MessageEmbed();
        embed.setTitle(`${category.emoji}: **${category.name}**`);
        bot.Commands.forEach((command, name)=>{
            if(command.category.categoryEnum===category.categoryEnum){
                let hasPerms=true;
                if(command.permissions){
                    // hasPerms=false;
                    hasPerms = userMember.hasPermission(<Discord.PermissionResolvable>command.permissions);
                }
                if(command.creatorOnly){
                    hasPerms=false;
                }
                if(command.guildOwnerOnly) hasPerms=false;
                if(hasPerms){
                    data.push(`${name}`);
                    let description=`${command.description||"test"}`;
                    if(command.paid) description+="\n__Premium Only__";
                    if(command.usage) description+=`\nUsage: ${command.usage}`;
                    if(command.aliases) description+=`\nAliases: ${command.aliases}`;
                    embed.addField(`${name}${command.enabled?"":" - __Disabled__"}`, description);
                }
            }
        });
        if(!data.length) return message.reply(`There are no commands for that category!`);
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        if(botMember.roles&&botMember.roles.color)
            embed.setColor(botMember.roles.color.color);
        return message.channel.send(embed);
    }

}

module.exports=Help;
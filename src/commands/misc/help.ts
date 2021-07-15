import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { OWNER_ID, PREFIX } from "../../Constants";
import { Info, Categories, Category } from "../../structs/Category";
import { Command, CommandAvailability, CommandAccess } from "../../structs/Command";
import { isDM, getBotRoleColor } from "../../Utils";


class HelpCommand extends Command{
    public constructor(){
        super("Shows commands");
        this.maxArgs=1;
        this.usage="[category]";
        this.category=Info;
    }

    public async onRun(message: Message, args: string[]) {
        const available=message.channel.type==="dm"?CommandAvailability.DM:CommandAvailability.Guild;
        if(!args.length){
            const embed=new MessageEmbed();
            embed.setTitle("Categories");
            let categories=[];
            Categories.forEach((category=>{
                if(category.availability===CommandAvailability.Both||(category.availability===available)){
                    if(category.access){
                        switch(category.access){
                            case CommandAccess.BotOwner:{
                                if(message.author.id!==OWNER_ID)
                                    return;
                            }break;
                            case CommandAccess.Moderators:{
                                if(isDM(message.channel)||!message.member.hasPermission("MANAGE_GUILD"))
                                    return;
                            }break;
                            case CommandAccess.GuildOwner:{
                                if(isDM(message.channel)||message.author.id!==message.guild.ownerID)
                                    return;
                            }break;
                        }
                    }
                    categories.push(`${category.emoji}: ${category.name}`);
                }
            }));
            embed.setDescription(categories);
            embed.setFooter(`You can do ${PREFIX}help ${this.usage} to get the commands in a certain category!`);
            embed.setColor((await getBotRoleColor(message.guild)));
            return message.channel.send(embed);
        }

        let category : Category=undefined;
        for(var _category of Categories){
            if(_category.name.toLowerCase()===args[0].toLowerCase()){
                category=_category;
                break;
            }
        }
        if(!category) return message.reply("That is not a valid category");

        if(category.availability!==CommandAvailability.Both&&(category.availability!==available)) return message.reply("That category is not available here!");

        const embed=new MessageEmbed();
        embed.setTitle(`${category.emoji}: ${category.name}`);
        BotUser.Commands.forEach((command, name)=>{
            if(command.category===category){
                if(command.availability===CommandAvailability.Both||(command.availability===available)){
                    if((command.guildIds&&command.guildIds.includes(message.guild.id))||(!command.guildIds||!command.guildIds.length)){

                        switch(command.access){
                            case CommandAccess.Moderators:{
                                if(isDM(message.channel)||!message.member.hasPermission("MANAGE_GUILD")){
                                    return;
                                }
                            }break;
                            case CommandAccess.GuildOwner:{
                                if(isDM(message.channel)||message.author.id!==message.guild.ownerID){
                                    return;
                                }
                            }break;
                            case CommandAccess.BotOwner:{
                                if(message.author.id!==OWNER_ID){
                                    return;
                                }
                            }break;
                        }

                        let title=`${name}`;
                        if(!command.enabled) title+=` - __Disabled__`;
                        let description=`${command.description}`;
                        if(command.aliases) description+=`\nAliases: ${command.aliases.join(", ")}`;
                        if(command.usage) description+=`\nUsage: ${command.usage}`;
                        if(command.access===CommandAccess.Patreon) description+=`\n__Patreon Only__`;
                        embed.addField(title, description);
                    }
                }
            }
        });
        if(!embed.fields.length) return message.reply("That category has no commands!");
        embed.setColor((await getBotRoleColor(message.guild)));
        return message.channel.send(embed);
    }

}

export=HelpCommand;
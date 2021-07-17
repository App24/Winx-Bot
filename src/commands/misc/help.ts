import { Channel, Guild, GuildMember, Message, MessageEmbed, User } from "discord.js";
import { BotUser } from "../../BotClient";
import { OWNER_ID, PREFIX } from "../../Constants";
import { Localisation } from "../../localisation";
import { Info, Categories, Category } from "../../structs/Category";
import { Command, CommandAvailability, CommandAccess, CommandUsage } from "../../structs/Command";
import { isDM, getBotRoleColor } from "../../Utils";


class HelpCommand extends Command{
    public constructor(){
        super();
        this.maxArgs=1;
        this.usage=[new CommandUsage(false, "argument.category")];
        this.category=Info;
    }

    public async onRun(message: Message, args: string[]) {
        const available=message.channel.type==="dm"?CommandAvailability.DM:CommandAvailability.Guild;
        if(!args.length){
            const embed=new MessageEmbed();
            embed.setTitle(Localisation.getTranslation("help.title"));
            let categories=[];
            let categoryEmojis:{emoji:string, category:Category}[]=[];
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
                    categoryEmojis.push({"emoji": category.emoji, "category": category});
                    categories.push(Localisation.getTranslation("help.category", category.emoji, Localisation.getTranslation(category.name)));
                }
            }));
            embed.setDescription(categories);
            embed.setFooter(Localisation.getTranslation("help.footer", PREFIX));
            embed.setColor((await getBotRoleColor(message.guild)));
            return message.channel.send(embed).then(msg=>{
                categoryEmojis.forEach(emoji=>{
                    msg.react(emoji.emoji);
                });

                const collector=msg.createReactionCollector((reaction, _user)=>(categoryEmojis.findIndex(emoji=>emoji.emoji===reaction.emoji.name) >=0 && _user.id===message.author.id), {max: 1, time: 1000*60*10});

                collector.once("end", ()=>{
                    msg.reactions.removeAll();
                });

                collector.on("dispose", ()=>{
                    msg.reactions.removeAll();
                });

                collector.on("collect", async(reaction)=>{
                    const category=categoryEmojis.find(emoji=>emoji.emoji===reaction.emoji.name).category;
                    if(category){
                        const embed=await getCommands(category, available, message.channel, message.guild, message.member, message.author);
                        if(!embed.fields.length) return message.reply(Localisation.getTranslation("error.invalid.category.commands"));
                        return message.channel.send(embed);
                    }
                });
            });
        }

        let category : Category=undefined;
        for(var _category of Categories){
            if(_category.getNames.map(value=>value.toLowerCase()).includes(args[0].toLowerCase())){
                category=_category;
                break;
            }
        }
        if(!category) return message.reply(Localisation.getTranslation("error.invalid.category"));

        if(category.availability!==CommandAvailability.Both&&(category.availability!==available)) return message.reply("That category is not available here!");

        const embed=await getCommands(category, available, message.channel, message.guild, message.member, message.author);
        if(!embed.fields.length) return message.reply(Localisation.getTranslation("error.invalid.category.commands"));
        return message.channel.send(embed);
    }

}

async function getCommands(category : Category, available : CommandAvailability, channel : Channel, guild : Guild, member : GuildMember, author : User){
    const embed=new MessageEmbed();
    embed.setTitle(`${category.emoji}: ${Localisation.getTranslation(category.name)}`);
    BotUser.Commands.forEach((command, name)=>{
        if(command.category===category){
            if(command.availability===CommandAvailability.Both||(command.availability===available)){
                if((command.guildIds&&command.guildIds.includes(guild.id))||(!command.guildIds||!command.guildIds.length)){

                    switch(command.access){
                        case CommandAccess.Moderators:{
                            if(isDM(channel)||!member.hasPermission("MANAGE_GUILD")){
                                return;
                            }
                        }break;
                        case CommandAccess.GuildOwner:{
                            if(isDM(channel)||author.id!==guild.ownerID){
                                return;
                            }
                        }break;
                        case CommandAccess.BotOwner:{
                            if(author.id!==OWNER_ID){
                                return;
                            }
                        }break;
                    }

                    let title=name;
                    if(!command.enabled) title+=` - ${Localisation.getTranslation("help.command.disabled")}`;
                    let description=Localisation.getTranslation(command.description);
                    if(command.aliases) description+=`\n${Localisation.getTranslation("help.command.aliases", command.aliases.join(", "))}`;
                    if(command.usage) description+=`\n${Localisation.getTranslation("help.command.usage", command.getUsage())}`;
                    if(command.access===CommandAccess.Patreon) description+=`\n${Localisation.getTranslation("help.command.patreon")}`;
                    embed.addField(title, description);
                }
            }
        }
    });
    embed.setColor((await getBotRoleColor(guild)));
    return embed;
}

export=HelpCommand;
import { Channel, Guild, GuildMember, Message, MessageEmbed, User } from "discord.js";
import { BotUser } from "../../BotClient";
import { OWNER_ID, PREFIX } from "../../Constants";
import { Localisation } from "../../localisation";
import { Info, Categories, Category, CustomCommands } from "../../structs/Category";
import { Command, CommandAvailability, CommandAccess, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { isDM, getBotRoleColor, isPatreon, asyncForEach, getServerDatabase } from "../../Utils";


class HelpCommand extends Command{
    public constructor(){
        super();
        this.usage=[new CommandUsage(false, "argument.category")];
        this.category=Info;
    }

    public async onRun(cmdArgs : CommandArguments) {
        const available=cmdArgs.channel.type==="dm"?CommandAvailability.DM:CommandAvailability.Guild;
        if(!cmdArgs.args.length){
            const embed=new MessageEmbed();
            embed.setTitle(Localisation.getTranslation("help.title"));
            let categories=[];
            let categoryEmojis:{emoji:string, category:Category}[]=[];
            await asyncForEach(Categories, async(category:Category)=>{
                if(category.availability===CommandAvailability.Both||(category.availability===available)){
                    if(category.access){
                        switch(category.access){
                            case CommandAccess.Patreon:{
                                if(isDM(cmdArgs.channel)||!(await isPatreon(cmdArgs.message.author.id, cmdArgs.guild.id)))
                                    return;
                            }break;
                            case CommandAccess.BotOwner:{
                                if(cmdArgs.message.author.id!==OWNER_ID)
                                    return;
                            }break;
                            case CommandAccess.Moderators:{
                                if(isDM(cmdArgs.channel)||!cmdArgs.message.member.hasPermission("MANAGE_GUILD"))
                                    return;
                            }break;
                            case CommandAccess.GuildOwner:{
                                if(isDM(cmdArgs.channel)||cmdArgs.message.author.id!==cmdArgs.guild.ownerID)
                                    return;
                            }break;
                            case CommandAccess.None:{
                                switch(category){
                                    case CustomCommands:{
                                        const CustomCommands=BotUser.getDatabase(DatabaseType.CustomCommands);
                                        const customCommands=await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guild.id);
                                        if(!customCommands.length)
                                            return;
                                    }break;
                                }
                            }break;
                        }
                    }
                    categoryEmojis.push({"emoji": category.emoji, "category": category});
                    categories.push(Localisation.getTranslation("help.category", category.emoji, Localisation.getTranslation(category.name)));
                }
            });
            embed.setDescription(categories);
            embed.setFooter(Localisation.getTranslation("help.footer", PREFIX));
            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
            return cmdArgs.channel.send(embed).then(msg=>{
                categoryEmojis.forEach(emoji=>{
                    msg.react(emoji.emoji);
                });

                const collector=msg.createReactionCollector((reaction, _user)=>(categoryEmojis.findIndex(emoji=>emoji.emoji===reaction.emoji.name) >=0 && _user.id===cmdArgs.message.author.id), {max: 1, time: 1000*60*5});

                collector.once("end", ()=>{
                    msg.reactions.removeAll();
                });

                collector.on("dispose", ()=>{
                    msg.reactions.removeAll();
                });

                collector.on("collect", async(reaction)=>{
                    const category=categoryEmojis.find(emoji=>emoji.emoji===reaction.emoji.name).category;
                    if(category){
                        const embed=await getCommands(category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.message.member, cmdArgs.message.author);
                        if(!embed.fields.length) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category.commands"));
                        return cmdArgs.channel.send(embed);
                    }
                });
            });
        }

        let category : Category=undefined;
        for(var _category of Categories){
            if(_category.getNames.map(value=>value.toLowerCase()).includes(cmdArgs.args.join(" ").toLowerCase())){
                category=_category;
                break;
            }
        }
        if(!category) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category"));

        if(category.availability!==CommandAvailability.Both&&(category.availability!==available)) return cmdArgs.message.reply("That category is not available here!");

        const embed=await getCommands(category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.message.member, cmdArgs.message.author);
        if(!embed.fields.length) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category.commands"));
        return cmdArgs.channel.send(embed);
    }

}

async function getCommands(category : Category, available : CommandAvailability, channel : Channel, guild : Guild, member : GuildMember, author : User){
    const embed=new MessageEmbed();
    embed.setTitle(`${category.emoji}: ${Localisation.getTranslation(category.name)}`);
    if(category===CustomCommands){
        const CustomCommands=BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands=await getServerDatabase<CustomCommand[]>(CustomCommands, guild.id);
        await asyncForEach(customCommands, async(customCommand:CustomCommand)=>{
            switch(customCommand.access){
                case CommandAccess.Patreon:{
                    if(isDM(channel)||!(await isPatreon(author.id, guild.id)))
                        return;
                }break;
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
            embed.addField(customCommand.name, customCommand.description);
        });
    }else{
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
    }
    embed.setColor((await getBotRoleColor(guild)));
    return embed;
}

export=HelpCommand;
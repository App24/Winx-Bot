import Discord from 'discord.js';
import Command from '../Command';
import * as Utils from '../Utils';

class Help extends Command{
    constructor(){
        super();
        this.usage="[command/category]";
        this.aliases=["commands"];
        this.description="Show commands";
        this.category=Command.InfoCategory;
        this.maxArgsLength=1;
    }

    public async onRun(bot: import("../BotClient"), message: Discord.Message, args: string[]) {
        const data=[];
        const commands=bot.Commands;
        const increments=5;
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);

        const userMember=await Utils.getMemberByID(message.author.id, message.guild);

        if(!args.length){
            const list={};
            let i=0;
            commands.forEach((command, name) => {
                if((!command.creatorOnly&&!command.guildOwnerOnly)&&!command.permissions){
                    if(!command.hidden){
                        let category=command.category;
                        if(!category) category="Other";
                        category=category.toUpperCase();
                        let text="​";
                        if(command.paid) text+="\n__Premium Only__";
                        if(command.usage) text+=`\nUsage: ${command.usage}`;
                        if(command.aliases) text+=`\nAliases: ${command.aliases}`;
                        if(!(category in list)){
                            list[category]=[i];
                            list[category].push(`**${name}:** ${command.description||""}${text}`);
                            i++;
                        }else{
                            list[category].push(`**${name}:** ${command.description||""}${text}`);
                        }
                    }
                }
            });

            data.push(`\nYou can you \`${process.env.PREFIX}help ${this.usage}\` to get info on a specific command!`);


            const generateEmbed=start=>{
                const currentList={};
                for(var key in list){
                    if(list[key][0]>=start+increments) break;
                    if(list[key][0]>=start){
                        const tempList=list[key];
                        currentList[key]=tempList.slice(1, tempList.length);
                    }
                }

                const embed = new Discord.MessageEmbed()
                .setTitle(`Showing categories ${start+1}-${start + Object.keys(currentList).length} out of ${Object.keys(list).length}`);
                for(var key in currentList){
                    embed.addField(key, currentList[key].join("\n"));
                }
                embed.addField("\u200B",data);
                
                embed.setThumbnail(bot.user.avatarURL());
                embed.setTimestamp();
                embed.setFooter(botMember.nickname||bot.user.username);
                if(botMember.roles&&botMember.roles.color)
                    embed.setColor(botMember.roles.color.color);
                return embed;
            };

            return message.channel.send(generateEmbed(0)).then(msg => {
                // exit if there is only one page of guilds (no need for all of this)
                if (Object.keys(list).length <= increments) return;
                // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
                msg.react('➡️');

                const authorId=message.author.id;
                const collector = msg.createReactionCollector(
                // only collect left and right arrow reactions from the message author
                (reaction, user) => (['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === authorId),
                // time out after 2 minutes
                {time: 120000}
                );

                collector.on('end', ()=>{
                    msg.reactions.removeAll();
                });
            
                let currentIndex = 0;
                collector.on('collect', reaction => {
                    // remove the existing reactions
                    msg.reactions.removeAll().then(async () => {
                        // increase/decrease index
                        reaction.emoji.name === '⬅️' ? currentIndex -= increments : currentIndex += increments;
                        // edit message with new embed
                        msg.edit(generateEmbed(currentIndex));
                        // react with left arrow if it isn't the start (await is used so that the right arrow always goes after the left)
                        if (currentIndex !== 0) await msg.react('⬅️');
                        // react with right arrow if it isn't the end
                        if (currentIndex + increments < Object.keys(list).length) msg.react('➡️');
                    });
                });
            });
        }

        if(args[0].toLowerCase()==="-a"){
            const list={};
            let i=0;
            commands.forEach((command, name) => {
                let hasPerms=true;
                if(command.permissions){
                    hasPerms =userMember.hasPermission(<Discord.PermissionResolvable>command.permissions);
                }
                if((!command.creatorOnly&&(!command.guildOwnerOnly||(message.author.id===message.guild.ownerID)))&&hasPerms){
                    if(!command.hidden){
                        let category=command.category;
                        if(!category) category="Other";
                        category=category.toUpperCase();
                        let text="​";
                        if(command.paid) text+="\n__Premium Only__";
                        if(command.usage) text+=`\nUsage: ${command.usage}`;
                        if(command.aliases) text+=`\nAliases: ${command.aliases}`;
                        if(!(category in list)){
                            list[category]=[i];
                            list[category].push(`**${name}:** ${command.description||""}${text}`);
                            i++;
                        }else{
                            list[category].push(`**${name}:** ${command.description||""}${text}`);
                        }
                    }
                }
            });

            data.push(`\nYou can you \`${process.env.PREFIX}help ${this.usage}\` to get info on a specific command!`);


            const generateEmbed=start=>{
                const currentList={};
                for(var key in list){
                    if(list[key][0]>=start+increments) break;
                    if(list[key][0]>=start){
                        const tempList=list[key];
                        currentList[key]=tempList.slice(1, tempList.length);
                    }
                }

                const embed = new Discord.MessageEmbed()
                .setTitle(`Showing categories ${start+1}-${start + Object.keys(currentList).length} out of ${Object.keys(list).length}`);
                for(var key in currentList){
                    embed.addField(key, currentList[key].join("\n"));
                }
                embed.addField("\u200B",data);
                
                embed.setThumbnail(bot.user.avatarURL());
                embed.setTimestamp();
                embed.setFooter(botMember.nickname||bot.user.username);
                if(botMember.roles&&botMember.roles.color)
                    embed.setColor(botMember.roles.color.color);
                return embed;
            };

            return message.channel.send(generateEmbed(0)).then(msg => {
                // exit if there is only one page of guilds (no need for all of this)
                if (Object.keys(list).length <= increments) return;
                // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
                msg.react('➡️');

                const authorId=message.author.id;
                const collector = msg.createReactionCollector(
                // only collect left and right arrow reactions from the message author
                (reaction, user) => (['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === authorId),
                // time out after 2 minutes
                {time: 120000}
                );

                collector.on('end', ()=>{
                    msg.reactions.removeAll();
                });
            
                let currentIndex = 0;
                collector.on('collect', reaction => {
                    // remove the existing reactions
                    msg.reactions.removeAll().then(async () => {
                        // increase/decrease index
                        reaction.emoji.name === '⬅️' ? currentIndex -= increments : currentIndex += increments;
                        // edit message with new embed
                        msg.edit(generateEmbed(currentIndex));
                        // react with left arrow if it isn't the start (await is used so that the right arrow always goes after the left)
                        if (currentIndex !== 0) await msg.react('⬅️');
                        // react with right arrow if it isn't the end
                        if (currentIndex + increments < Object.keys(list).length) msg.react('➡️');
                    });
                });
            });
        }

        const name=args.join(" ").toLowerCase();
        const command=commands.get(name)||commands.find(c=>c.aliases&&c.aliases.includes(name));

        if(!command){
            const cat=commands.filter(c=>{
                let hasPerms=true;
                if(c.permissions){
                    hasPerms =userMember.hasPermission(<Discord.PermissionResolvable>c.permissions);
                }
                return (c.category&&c.category.toLowerCase()==name)&&!c.hidden&&hasPerms;
            });
            if(!cat||cat.size<1) return message.reply("That is not a valid command/category!");

            const generateEmbed = start =>{
                const currentList=new Discord.Collection<string, Command>();
                const catData=[];
                for (let i = start; i < cat.size; i++) {
                    if(i>=start+increments) break;
                    const name=cat.keyArray()[i];
                    const element = cat.array()[i];
                    currentList.set(name, element);
                }

                const embed = new Discord.MessageEmbed()
                .setTitle(`Showing commands ${start+1}-${start + currentList.size} out of ${cat.size}\n**${cat.values().next().value.category}**`);
                // catData.push(`**${cat.values().next().value.category}**`);
                currentList.forEach((c, name) => {
                    addToData(catData, c, name, false);
                });
                embed.setDescription(catData);
                
                embed.setThumbnail(bot.user.avatarURL());
                embed.setTimestamp();
                embed.setFooter(botMember.nickname||bot.user.username);
                if(botMember.roles&&botMember.roles.color)
                    embed.setColor(botMember.roles.color.color);
                return embed;
            };

            return message.channel.send(generateEmbed(0)).then(msg => {
                // exit if there is only one page of guilds (no need for all of this)
                if (cat.size <= increments) return;
                // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
                msg.react('➡️');
                const authorId=message.author.id;
                const collector = msg.createReactionCollector(
                // only collect left and right arrow reactions from the message author
                (reaction, user) => (['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === authorId),
                // time out after 2 minutes
                {time: 120000}
                );

                collector.on('end', ()=>{
                    msg.reactions.removeAll();
                });
            
                let currentIndex = 0;
                collector.on('collect', reaction => {
                    // remove the existing reactions
                    msg.reactions.removeAll().then(async () => {
                        // increase/decrease index
                        reaction.emoji.name === '⬅️' ? currentIndex -= increments : currentIndex += increments;
                        // edit message with new embed
                        msg.edit(generateEmbed(currentIndex));
                        // react with left arrow if it isn't the start (await is used so that the right arrow always goes after the left)
                        if (currentIndex !== 0) await msg.react('⬅️');
                        // react with right arrow if it isn't the end
                        if (currentIndex + increments < cat.size) msg.react('➡️');
                    });
                });
            });
        }

        addToData(data, command, name, true);

        const embed=new Discord.MessageEmbed()
            .setDescription(data);
        embed.setThumbnail(bot.user.avatarURL());
        embed.setTimestamp();
        embed.setFooter(botMember.nickname||bot.user.username);
        if(botMember.roles&&botMember.roles.color)
            embed.setColor(botMember.roles.color.color);

        message.channel.send(embed);
    }

}

function addToData(data, command : Command, name : string, showCat : boolean){
    data.push(`**${name}**: ${command.description||""}`);
    if (command.usage) data.push(`${process.env.PREFIX}${name} ${command.usage}`);
    if (command.aliases) data.push(`Aliases: ${command.aliases.join(', ')}`);
    if(showCat) data.push(`Category: ${command.category||"Other"}`);
    if(command.permissions) data.push(`__Mod Only__`);
}

module.exports=Help;
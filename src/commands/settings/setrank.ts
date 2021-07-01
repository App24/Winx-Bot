import Discord from 'discord.js';
import { Settings } from '../../Category';
import Command from '../../Command';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

class SetRank extends Command{
    constructor(){
        super();
        this.permissions=["MANAGE_GUILD"]
        this.category=Settings;
        this.minArgsLength=1;
        this.description="Set a rank";
        this.minArgsLength=2;
        this.usage="<level above 0> <role/clear/add/remove/list> [gifs]";
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const level=parseInt(args[0]);
        if(isNaN(level)||level<0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
        const Ranks=bot.getDatabase(DatabaseType.Ranks);
        let ranks=await Ranks.get(message.guild.id);
        if(args[1].toLowerCase()==="clear"){
            if(!ranks){
                return message.channel.send("This guild does not contain any ranks!");
            }
            let rankLevel=await ranks.find(u=>u["level"]===level);
            if(!rankLevel){
                return message.channel.send(`There is no rank assigned to level ${level}`);
            }
            const index=ranks.indexOf(rankLevel);
            if(index>-1) ranks.splice(index,1);
            await Ranks.set(message.guild.id, ranks);
            return message.channel.send(`Cleared rank for level ${level}`);
        }else if(args[1].toLowerCase()==="list"){
            if(!ranks){
                return message.channel.send("This guild does not contain any ranks!");
            }
            let rankLevel=await ranks.find(u=>u["level"]===level);
            if(!rankLevel){
                return message.channel.send(`There is no rank assigned to level ${level}`);
            }
            if(!rankLevel["gifs"]||!rankLevel["gifs"].length){
                return message.channel.send("There are no gifs assigned to this rank!");
            }
            const embed=new Discord.MessageEmbed()
            .setDescription(rankLevel["gifs"].join("\n"));
            const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
            if(botMember.roles&&botMember.roles.color)
                embed.setColor(botMember.roles.color.color);
            return message.channel.send(embed);
        }else if(args[1].toLowerCase()==="add"){
            if(!ranks){
                return message.channel.send("This guild does not contain any ranks!");
            }
            if(args.length<2) return message.reply("You must provide at least 1 link!");
            let rankLevel=await ranks.find(u=>u["level"]===level);
            if(!rankLevel){
                return message.channel.send(`There is no rank assigned to level ${level}`);
            }
            let gifs=rankLevel["gifs"];
            if(!gifs){
                gifs=[];
            }
            args.shift();
            args.shift();
            args.forEach(element => {
                gifs.push(element);
            });
            const index=ranks.indexOf(rankLevel);
            rankLevel["gifs"]=gifs;
            ranks[index]=rankLevel;
            await Ranks.set(message.guild.id, ranks);
            return message.channel.send("Added!");
        }else if(args[1].toLowerCase()==="remove"){
            if(!ranks){
                return message.channel.send("This guild does not contain any ranks!");
            }
            if(args.length<2) return message.reply("You must provide 1 link!");
            let rankLevel=await ranks.find(u=>u["level"]===level);
            if(!rankLevel){
                return message.channel.send(`There is no rank assigned to level ${level}`);
            }
            let gifs=rankLevel["gifs"];
            if(!gifs||!gifs.length){
                return message.reply("There are no gifs assigned to this rank!");
            }
            const gif_index=gifs.indexOf(args[2]);
            if(gif_index>-1) gifs.splice(gif_index,1);
            else return message.reply("There is no gif saved with that url!");
            const index=ranks.indexOf(rankLevel);
            rankLevel["gifs"]=gifs;
            ranks[index]=rankLevel;
            await Ranks.set(message.guild.id, ranks);
            return message.channel.send("Removed!");
        }
        const role=await Utils.getRoleFromMention(args[1], message.guild);
        if(!role) return message.reply('You must provide a valid role!');
        if(!ranks){
            await Ranks.set(message.guild.id, []);
            ranks=await Ranks.get(message.guild.id);
        }
        let rankLevel=await ranks.find(u=>u["level"]===level);
        if(!rankLevel){
            ranks.push({"level": level, "role": role.id});
            await Ranks.set(message.guild.id, ranks);
        }else{
            const index=ranks.indexOf(rankLevel);
            rankLevel["role"]=role.id;
            ranks[index]=rankLevel;
            await Ranks.set(message.guild.id, ranks);
        }
        return message.channel.send(`\`${role.name}\` has been set as rank for level ${level}`);
    }
}

module.exports=SetRank;
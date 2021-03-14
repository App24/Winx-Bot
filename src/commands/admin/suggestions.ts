import Discord from 'discord.js';
import Command from '../../Command';
import * as Utils from '../../Utils';

class SuggestionsC extends Command{
    constructor(){
        super("suggestions");
        this.ownerOnly=true;
        this.args=true;
        this.guildOnly=false;
        this.usage="<list/finish/reject/id> [non/finish/rejected/id]";
        this.category=Command.OwnerCategory;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const Suggestions=bot.getDatabase("suggestions");
        const requests=await Suggestions.entries();
        if(!requests||!requests.length) return message.channel.send("There are no suggestions!");
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        if(args[0].toLowerCase()==="list"){
            if(args.length<2) return message.reply("You must provide 2 arguments");
            const type=args[1].toLowerCase();
            if(type!=="non"&&type!=="finished"&&type!=="rejected") return message.reply(`${args[1]} is not a valid status!`);
            const data=[];
            requests.forEach(request => {
                if(request[1]["state"]===type) data.push(request);
            });
            if(data.length<=0) return message.reply("No requests with that state!");
    
            await Utils.asyncForEach(data, async(element)=>{
                const embed=await this.getRequestEmbed(element, type, bot, botMember);
                message.channel.send(embed);
            });
        }else if(args[0].toLowerCase()==="finish"){
            if(args.length<2) return message.reply("You must provide 2 arguments");
            const request=await Suggestions.get(args[1]);
            if(!request) return message.reply("No request by that ID!");
            if(request["state"]==="finished") return message.reply("That request is already finished!");
            const data=[args[1], request];
            const embed=await this.getRequestEmbed(data, request["state"], bot, botMember);
            embed.setDescription(embed.description+"\n\nYou sure you want to finish this?");
            message.channel.send(embed).then(async(msg)=>{
                msg.react('✅');
                msg.react('❌');
                const collector=msg.createReactionCollector((reaction, user)=>(['✅', "❌"].includes(reaction.emoji.name) && user.id===process.env.OWNER_ID), {max: 1});
    
                await collector.on("collect", async(reaction)=>{
                    if(reaction.emoji.name==="✅"){
                        const embed2=msg.embeds[0];
                        embed2.setDescription(embed2.description+"\nFinished");
                        msg.edit(embed2);
                        request["state"]="finished";
                        await Suggestions.set(args[1], request);
                    }
                });
            });
        }else if(args[0].toLowerCase()==="reject"){
            if(args.length<2) return message.reply("You must provide 2 arguments");
            const request=await Suggestions.get(args[1]);
            if(!request) return message.reply("No request by that ID!");
            if(request["state"]==="rejected") return message.reply("That request is already rejected!");
            const data=[args[1], request];
            const embed=await this.getRequestEmbed(data, request["state"], bot, botMember);
            embed.setDescription(embed.description+"\n\nYou sure you want to reject this?");
            message.channel.send(embed).then(async(msg)=>{
                msg.react('✅');
                msg.react('❌');
                const collector=msg.createReactionCollector((reaction, user)=>(['✅', "❌"].includes(reaction.emoji.name) && user.id===process.env.OWNER_ID), {max: 1});
    
                await collector.on("collect", async(reaction)=>{
                    if(reaction.emoji.name==="✅"){
                        const embed2=msg.embeds[0];
                        embed2.setDescription(embed2.description+"\nRejected");
                        msg.edit(embed2);
                        request["state"]="rejected";
                        await Suggestions.set(args[1], request);
                    }
                });
            });
        }else{
            const request=await Suggestions.get(args[0]);
            if(!request) return message.reply("No request by that ID!");
            const data=[args[0], request];
            const embed=await this.getRequestEmbed(data, request["state"], bot, botMember);
            message.channel.send(embed);
        }
    }

    async getRequestEmbed(request, type, bot, botMember){
        let state;
        switch (type) {
            case "non":
                state="❔ Not Started";
                break;
            case "finished":
                state="✅ Finished";
                break;
            case "rejected":
                state="❌ Rejected";
                break;
        }
        const user=await Utils.getUserByID(request[1]["requestor"], bot);
        const embed=new Discord.MessageEmbed()
        .setTitle(state)
        .setDescription(`**Request by ${user||"Account Deleted"}**\n${request[1]["request"]}`)
        .setFooter(request[0]);
        if(botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);
        return embed;
    }

}
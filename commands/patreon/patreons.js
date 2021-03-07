const Command=require("../../Command");
const Utils=require("../../Utils");
const Discord=require("discord.js");

class Patreons extends Command{
    constructor(){
        super("patreons");
        this.hidden=true;
        this.modOnly=true;
        this.category=Command.PatreonCategory;
    }

    async onRun(bot, message, args){
        const Paid=bot.tables["paid"];
        const patreons=(await Paid.valuesFrom(message.guild.id))[0];
        if(!patreons||!patreons.length) return message.channel.send("No patreons in this server!");
        const embed=new Discord.MessageEmbed();
        const data=[];
        await Utils.asyncForEach(patreons, async(patreon)=>{
            const user=await Utils.getUserByID(patreon, bot);
            if(!user) return;
            data.push(user);
        });
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        if(botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);
        embed.setDescription(data);
        embed.setTitle("Patreons");
        message.channel.send(embed);
    }
}

module.exports=Patreons;
const Command = require("../Command");
const Discord=require("discord.js");
const Utils=require("../Utils");

class About extends Command{
    constructor(){
        super("about");
        this.description="About the bot";
        this.category=Command.InfoCategory;
    }

    async onRun(bot, message, args){
        const embed=new Discord.MessageEmbed();
        const data=[];
        const creators=process.env.CREATORS.replace(" ", "").split(",");
        await Utils.asyncForEach(creators, async(creator)=>{
            const user=await Utils.getUserByID(creator, bot);
            if(user) data.push(user);
        });
        embed.setTimestamp();
        embed.setAuthor((await Utils.getMemberByID(bot.user.id, message.guild)).nickname||bot.user.username, bot.user.avatarURL());
        embed.addField("About", "This bot was created by and for Winx fans, it allows for users to level up and earn new transformations, it is entirely customisable from transformation names to when you get each!");
        embed.addField("Creators", data.join(", "));
        embed.addField("Version", process.env.VERSION);
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        if(botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);
        message.channel.send(embed);
    }
}

module.exports=About;
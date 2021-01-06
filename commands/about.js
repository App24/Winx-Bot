const Command = require("../Command");
const Discord=require("discord.js");
const Utils=require("../Utils");

const version="3.0.0";

const command=new Command("about");
command.description="About the bot";
command.run=async(bot, message, args)=>{
    const embed=new Discord.MessageEmbed();
    embed.setTimestamp();
    embed.setAuthor((await Utils.getMemberById(bot.user.id, message.guild)).nickname||bot.user.username, bot.user.avatarURL());
    embed.addField("About", "This bot was created by and for winx fans, it allows for users to level up and earn new transformations, it is entirely customisable from transformation names to when you get each!");
    embed.addField("Creators", "App24, Nobu");
    embed.addField("Version", version);
    message.channel.send(embed);
};

module.exports=command;
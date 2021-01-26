const Discord=require("discord.js");
const Command = require("../Command");
const Utils=require("../Utils");

const command=new Command("help");
// command.description="Show Help";
command.usage="[command]";
command.aliases=["commands"];
command.run=async(bot, message, args)=>{
    const {commands}=bot;

    if(!args.length){
        const embed=new Discord.MessageEmbed();
        commands.forEach(command => {
            if(!command.hidden){
                let text="​";
                if(command.description) text+=command.description;
                if(command.usage&&text!="​") text+="\n";
                if(command.usage) text+=`Usage: ${command.usage}`;
                embed.addField(Utils.capitalize(command.name), text, true);
            }
        });
        embed.setTimestamp();
        embed.setColor("#ff0000");
        embed.setFooter((await Utils.getMemberById(bot.user.id, message.guild)).nickname||bot.user.username);
        embed.setThumbnail(bot.user.avatarURL());
        return message.channel.send(embed);
    }

    
    const command=commands.get(args[0])||commands.find(cmd=>cmd.aliases&&cmd.aliases.includes(args[0]));

    if(!command) return message.channel.send(`\`${args[0]}\` is not a command!`);

    const embed=new Discord.MessageEmbed();
    embed.setTitle(Utils.capitalize(command.name));
    const data=[];
    if(command.description) data.push(command.description);
    if(command.usage) data.push(`Usage: ${command.usage}`);
    embed.setDescription(data);

    message.channel.send(embed);


};

module.exports=command;
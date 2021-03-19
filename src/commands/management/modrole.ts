import Discord from "discord.js";
import Command from "../../Command";
import * as Utils from '../../Utils';

class ModRole extends Command{
    constructor(){
        super();
        this.permissions=["MANAGE_GUILD"];
        this.args=true;
        this.usage="<add/remove/list> [role]";
        this.category=Command.SettingsCategory;
        this.description="Set Mod Roles!";
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const operation=args[0].toLowerCase();
        const ModRoles=bot.getDatabase("modRoles");
        const modRoles=await Utils.getServerDatabase(ModRoles, message.guild.id);
        switch(operation){
            case "add":{
                if(args.length<2){
                    return this.printTLArgsError(message, 2);
                }
                const role=await Utils.getRoleFromMention(args[1], message.guild);
                if(!role) return message.reply(`${args[1]} is not a valid role!`);
                const alreadyRole=modRoles.find(other=>other===role.id);
                if(alreadyRole) return message.reply(`${role} is already a mod role!`);
                modRoles.push(role.id);
                await ModRoles.set(message.guild.id, modRoles);
                message.channel.send(`Successfully added ${role} as a mod role!`);
                break;
            }
            case "remove":{
                if(args.length<2){
                    return this.printTLArgsError(message, 2);
                }
                const role=await Utils.getRoleFromMention(args[1], message.guild);
                if(!role) return message.reply(`${args[1]} is not a valid role!`);
                const alreadyRole=modRoles.find(other=>other===role.id);
                if(!alreadyRole) return message.reply(`${role} is already a mod role!`);
                const index=modRoles.indexOf(role.id);
                if(index > -1) modRoles.splice(index, 1);
                await ModRoles.set(message.guild.id, modRoles);
                message.channel.send(`Successfully removed ${role} as a mod role!`);
                break;
            }
            case "list":{
                if(!modRoles.length) return message.reply("There are no mod roles in this server!");
                const data=[];
                const embed=new Discord.MessageEmbed();
                await Utils.asyncForEach(modRoles, async(modRole)=>{
                    const role=await Utils.getRoleByID(modRole, message.guild);
                    if(!role) return;
                    data.push(role);
                });
                embed.setTitle("Mod Roles");
                embed.setDescription(data);
                const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
                if(botMember.roles&&botMember.roles.color)
                embed.setColor(botMember.roles.color.color);
                message.channel.send(embed);
                break;
            }
        }
    }

}

module.exports=ModRole;
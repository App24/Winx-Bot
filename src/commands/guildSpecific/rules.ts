import Discord from "discord.js";
import Command from "../../Command";

class Rules extends Command{
    public constructor(){
        super();
        this.permissions=["MANAGE_GUILD"];
        this.category=Command.SettingsCategory;
        this.guildIds=["715614355785252914"];
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        let embed=new Discord.MessageEmbed();
        embed.setColor("#ab1459");
        embed.setImage("https://cdn.discordapp.com/attachments/772388476078260225/805739403041046588/winx_rules.gif");
        await message.channel.send(embed);

        embed=new Discord.MessageEmbed();
        embed.setColor("#ab1459");
        embed.setTitle("Welcome!");
        embed.setDescription("We hope you enjoy your time in our server all about our favorite show, Winx Club. With that said, there are the few rules we have in place so that everyone has a nice time here.");
        embed.addFields(
            { name: ':white_small_square:rule#1', value: 'Be nice to each other! We are here to have nice civil conversations, not to cause drama and fight with each other.'},
            { name: ':white_small_square:rule#2', value: 'Please spoiler tag any topics that might be heavy or triggering to others. This is also applies to spoilers about the show.'},
            { name: ':white_small_square:rule#3', value: 'No discrimination allowed (racism, homophobia, transphobia, etc...).'},
            { name: ':white_small_square:rule#4', value: 'Spam and excessive repeated messages are not allowed.'},
            { name: ':white_small_square:rule#5', value: 'Swearing is fine, but keep nsfw conversions/media to yourself, as this server is PG-13.'},
            { name: ':white_small_square:rule#6', value: 'No self-promo of discord servers, any services/product that is paid and not art, giveaways. To clarify, posting art and art commissions is allowed, and so are youtube channels. If you still want to post any of the prohibited stuff, message a mod and they will give you a link to apply for it, it will then be discussed between mods.'},
            { name: ':white_small_square:rule#7', value: 'No politics. This is a strict rule. Any discussion of politics will get deleted and you will get a warn.'},
            { name: ':white_small_square:rule#8', value: 'If you post art that is not yours,or use a base for your art, please credit the creator, and dont claim somebodys art is yours, that can lead to a warning.'},
        );
        await message.channel.send(embed);

        embed=new Discord.MessageEmbed();
        embed.setColor("#ab1459");
        embed.setImage("https://cdn.discordapp.com/attachments/772388476078260225/805741831769423893/winc_info.gif");
        await message.channel.send(embed);

        embed=new Discord.MessageEmbed();
        embed.setColor("#ab1459");
        embed.setTitle('Other Info');
        embed.addFields(
            { name: 'Staff Roles', value: ' <@&715620630149595202> <@&818932793731842099> <@&733744082186403860> <@&738798218523181135> '},
            { name: 'Support Channel', value: ' <#733803298594881647> feel free to ask us anything and/or suggest anything concerning the server/community '},
            { name: 'Ranks', value: 'Gained through talking. managed by <@737665096637087866> you gain a transformation rank every 5 levels.'},
        );
        await message.channel.send(embed);

        embed=new Discord.MessageEmbed();
        embed.setColor("#ab1459");
        embed.setImage("https://cdn.discordapp.com/attachments/772388476078260225/805746268226846740/wonx.gif");
        await message.channel.send(embed);

        embed=new Discord.MessageEmbed();
        embed.setColor("#ab1459");
        embed.setTitle('Links');
        embed.addFields(
            { name: '<:discord:805615932797616149>  -  (disabled for now)', value: ' for inviting people here. '},
            { name: '<:paypal:805611737347784725>  -  https://paypal.me/WinxServer', value: ' for payments and donations. '},
            { name: '<:minecraft:805768235907285034>  -  winxclubowo.aternos.me', value: 'our very own minecraft server. '},
            { name: ':e_mail:  -  WinxServer55@gmail.com', value: ' for business inquiries only. '},
        );
        await message.channel.send(embed);

        embed=new Discord.MessageEmbed();
        embed.setColor("#ab1459");
        embed.setImage("https://cdn.discordapp.com/attachments/772388476078260225/805749790129782794/aisha_supremacyy.gif");
        await message.channel.send(embed);

        message.delete();
    }
};

module.exports=Rules

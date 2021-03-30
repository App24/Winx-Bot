import Discord from 'discord.js';
import BotClient from './BotClient';
import { ERROR_HEX } from './Constants';
import { reply, secondsToTime } from './Utils';

const intents=new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client=new BotClient({
    clientOptions: {ws: {intents: intents}},
    logLoading: 'simplified',
    loadCommands: true,
    loadEvents: true,
    loadSlashes: true
});

const cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

(<any>client).ws.on("INTERACTION_CREATE", async(interaction)=>{
    const {name, options}=interaction.data;
    const commandName=name.toLowerCase();
    const newOptions=[];
    if(options)
    for(const option of options){
        newOptions.push(option.value);
    }

    const command=client.Slashes.get(commandName);

    if(!cooldowns.has(commandName)){
        cooldowns.set(commandName, new Discord.Collection());
    }

    const now=Date.now();
    const timestamps=cooldowns.get(commandName);
    const cooldownAmount=(command.data.cooldown||3)*1000;

    const userId=(interaction.member&&interaction.member.user.id)||interaction.user.id;

    if(timestamps.has(userId)){
        const expirationTime=timestamps.get(userId)+cooldownAmount;

        if(now < expirationTime){
            const timeLeft=(expirationTime-now)/1000;
            // return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandName}\` command.`);
            return reply(client, interaction, `please wait ${secondsToTime(timeLeft)} before reusing the \`${commandName}\` command.`);
        }
    }

    timestamps.set(userId, now);
    setTimeout(()=>timestamps.delete(userId), cooldownAmount);

    if(!command)
        return (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
            data:{
                type: 4,
                data:{
                    content: "Not Yet Implemented! (Yell at Discord to release slash commands in discordjs :sob:)"
                }
            }
        });
    
    if(command.data.guildOnly&&!interaction.guild_id){
        const embed=new Discord.MessageEmbed();
        embed.setDescription("Server Only Slash Command!");
        embed.setColor(ERROR_HEX);
        return reply(client, interaction, embed);
    }

    await command.onRun(client, interaction, newOptions);
});

client.login(process.env.TOKEN);
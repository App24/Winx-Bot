import Discord from 'discord.js';
import BotClient from './BotClient';
import { ERROR_HEX } from './Constants';
import { getUserByID, isPatreon, reply, secondsToTime } from './Utils';

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

function getOptions(options, newOptions : any[]){
    for(const option of options){
        if(option.type===2||option.type===1){
            newOptions.push(option.name);
            if(option.options){
                getOptions(option.options, newOptions);
            }
        }
        else{
            newOptions.push(option.value);
        }
    }
}

(<any>client).ws.on("INTERACTION_CREATE", async(interaction)=>{
    const {name, options}=interaction.data;
    const commandName=name.toLowerCase();
    const newOptions=[];
    if(options)
        getOptions(options, newOptions);

    const command=client.Slashes.get(commandName);

    await (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
        data:{
            type: 5
        }
    });

    if(!command)
        return reply(client, interaction, `Not Yet Implemented! (Yell at Discord to release slash commands in discordjs :sob:)`);

    if(command.data.paid){
        if(!interaction.guild_id){
            const embed=new Discord.MessageEmbed();
            embed.setDescription("Server Only Slash Command!");
            embed.setColor(ERROR_HEX);
            return reply(client, interaction, embed);
        }
        const user=await getUserByID(interaction.member.user.id, client);
        const userPaid=await isPatreon(user, client.guilds.resolve(interaction.guild_id), client);
        if(!userPaid){
            return reply(client, interaction, "This command is a premium feature only. Contact a mod to find out how to gain access to it.");
        }
    }

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
            return reply(client, interaction, `please wait ${secondsToTime(timeLeft)} before reusing the \`${commandName}\` command.`);
        }
    }

    timestamps.set(userId, now);
    setTimeout(()=>timestamps.delete(userId), cooldownAmount);
    
    if(command.data.guildOnly&&!interaction.guild_id){
        const embed=new Discord.MessageEmbed();
        embed.setDescription("Server Only Slash Command!");
        embed.setColor(ERROR_HEX);
        return reply(client, interaction, embed);
    }

    await command.onRun(client, interaction, newOptions);
});

client.login(process.env.TOKEN);
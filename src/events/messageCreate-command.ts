import { parse } from "discord-command-parser";
import { Collection } from "discord.js";
import { BotUser } from "../BotClient";
import { OWNER_ID, PREFIX } from "../Constants";
import { Localisation } from "../localisation";
import { CommandAccess, CommandArguments, CommandAvailable } from "../structs/Command";
import { DatabaseType } from "../structs/DatabaseTypes";
import { CustomCommand } from "../structs/databaseTypes/CustomCommand";
import { formatString, secondsToTime } from "../utils/FormatUtils";
import { getServerDatabase, isDM, isModerator, isPatreon, reportError } from "../utils/Utils";

const cooldowns = new Collection<string, Collection<string, number>>();

export = () => {
    BotUser.on("messageCreate", async (message) => {
        if (!message.content.toLowerCase().startsWith(PREFIX) || message.author.bot) return <any>null;

        const parsed = parse(message, PREFIX, { allowSpaceBeforeCommand: true, ignorePrefixCase: true });
        if (!parsed.success) return;
        const commandName = parsed.command.toLowerCase();
        const args = parsed.arguments;

        const command = BotUser.getCommand(commandName);

        if (!command) {
            if (isDM(message.channel)) return;
            const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
            const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, message.guild.id);
            const customCommand = customCommands.find(c => c.name === commandName);
            if (!customCommand) return;
            switch (customCommand.access) {
                case CommandAccess.Patreon: {
                    if (isDM(message.channel) || !(await isPatreon(message.author.id, message.guild.id))) {
                        return message.reply(Localisation.getTranslation("command.access.patreon"));
                    }
                } break;
                case CommandAccess.Moderators: {
                    if (isDM(message.channel) || !isModerator(message.member)) {
                        return message.reply(Localisation.getTranslation("command.access.moderator"));
                    }
                } break;
                case CommandAccess.GuildOwner: {
                    if (isDM(message.channel) || message.author.id !== message.guild.ownerId) {
                        return message.reply(Localisation.getTranslation("command.access.guildOwner"));
                    }
                } break;
                case CommandAccess.BotOwner: {
                    if (message.author.id !== OWNER_ID) {
                        return message.reply(Localisation.getTranslation("command.access.botOwner"));
                    }
                } break;
            }

            const outputs = customCommand.outputs;
            const randomMsg = outputs[Math.floor(outputs.length * Math.random())];
            let msgToReply = message;
            if (message.reference) {
                msgToReply = await message.fetchReference();
            }
            return msgToReply.reply({ content: formatString(randomMsg, ...args), failIfNotExists: false, allowedMentions: { repliedUser: msgToReply.author !== message.author } });
        }

        if (!command.enabled) return message.reply(Localisation.getTranslation("command.disabled"));

        if (!isDM(message.channel) && command.guildIds && !command.guildIds.includes(message.guild.id)) return;

        if (command.available === CommandAvailable.Guild && isDM(message.channel)) {
            return message.reply(Localisation.getTranslation("command.available.server"));
        } else if (command.available === CommandAvailable.DM && !isDM(message.channel)) {
            return message.reply(Localisation.getTranslation("command.available.dm"));
        }

        switch (command.access) {
            case CommandAccess.Patreon: {
                if (isDM(message.channel) || !(await isPatreon(message.author.id, message.guild.id))) {
                    return message.reply(Localisation.getTranslation("command.access.patreon"));
                }
            } break;
            case CommandAccess.Moderators: {
                if (isDM(message.channel) || !isModerator(message.member)) {
                    return message.reply(Localisation.getTranslation("command.access.moderator"));
                }
            } break;
            case CommandAccess.GuildOwner: {
                if (isDM(message.channel) || message.author.id !== message.guild.ownerId) {
                    return message.reply(Localisation.getTranslation("command.access.guildOwner"));
                }
            } break;
            case CommandAccess.BotOwner: {
                if (message.author.id !== OWNER_ID) {
                    return message.reply(Localisation.getTranslation("command.access.botOwner"));
                }
            } break;
        }

        if (!cooldowns.has(commandName)) {
            cooldowns.set(commandName, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(commandName);
        const cooldownAmount = (command.cooldown === undefined ? 3 : command.cooldown) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(Localisation.getTranslation("command.cooldown", secondsToTime(timeLeft), commandName));
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        if (args.length < command.getMinArgs()) {
            let reply = Localisation.getTranslation("error.arguments.few");

            if (command.usage) {
                reply += `\n${Localisation.getTranslation("command.usage", PREFIX, commandName, command.getUsage())}`;
            }

            return message.reply(reply);
        }

        try {
            const cmdArgs = new CommandArguments(message, args);
            await command.onRun(cmdArgs);
        } catch (error) {
            await reportError(error.stack, message);
        }

    });
}
import { parse } from "discord-command-parser";
import { Collection } from "discord.js";
import { BotUser } from "../BotClient";
import { PREFIX } from "../Constants";
import { Localisation } from "../localisation";
import { CommandArguments } from "../structs/Command";
import { CommandAvailable } from "../structs/CommandAvailable";
import { CommandAccess } from "../structs/CommandAccess";
import { CustomCommand } from "../structs/databaseTypes/CustomCommand";
import { formatString, secondsToTime } from "../utils/FormatUtils";
import { getOneDatabase, isBooster, isDM, isModerator, isPatreon, reportBotError } from "../utils/Utils";

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
            const customCommand = await getOneDatabase(CustomCommand, { guildId: message.guildId, name: commandName });
            if (customCommand.isNull()) return;
            switch (customCommand.document.access) {
                case CommandAccess.Patreon: {
                    if (isDM(message.channel) || !(await isPatreon(message.author.id, message.guild.id))) {
                        return message.reply(Localisation.getTranslation("command.access.patreon"));
                    }
                } break;
                case CommandAccess.Booster: {
                    if (isDM(message.channel) || !isBooster(message.member)) {
                        return message.reply(Localisation.getTranslation("command.access.booster"));
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
                    if (message.author.id !== process.env.OWNER_ID) {
                        return message.reply(Localisation.getTranslation("command.access.botOwner"));
                    }
                } break;
                case CommandAccess.PatreonOrBooster: {
                    if (isDM(message.channel) || (!(await isPatreon(message.author.id, message.guild.id)) && !isBooster(message.member))) {
                        return message.reply(Localisation.getTranslation("command.access.patreon"));
                    }
                } break;
            }

            const outputs = customCommand.document.outputs;
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
            case CommandAccess.Booster: {
                if (isDM(message.channel) || !isBooster(message.member)) {
                    return message.reply(Localisation.getTranslation("command.access.booster"));
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
                if (message.author.id !== process.env.OWNER_ID) {
                    return message.reply(Localisation.getTranslation("command.access.botOwner"));
                }
            } break;
            case CommandAccess.PatreonOrBooster: {
                if (isDM(message.channel) || (!(await isPatreon(message.author.id, message.guild.id)) && !isBooster(message.member))) {
                    return message.reply(Localisation.getTranslation("command.access.patreon"));
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

        if (args.length < command.minArgs) {
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
            await reportBotError(error.stack, message);
        }

    });
}
import { ApplicationCommandOptionType, Collection, GuildMember } from "discord.js";
import { BotUser } from "../BotClient";
import { Localisation } from "../localisation";
import { CommandAvailable } from "../structs/CommandAvailable";
import { CommandAccess } from "../structs/CommandAccess";
import { SlashCommandArguments } from "../structs/SlashCommand";
import { isBooster, isDM, isModerator, isPatron, reportBotError } from "../utils/Utils";
import { secondsToTime } from "../utils/FormatUtils";
import { hasPermission } from "../utils/PermissionUtils";

const cooldowns = new Collection<string, Collection<string, number>>();

export = () => {
    BotUser.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;


        const command = BotUser.getSlashCommand(interaction.commandName);
        if (!command)
            return <any>interaction.reply("No command");

        const reportIssue = async (text: string, ...args) => {
            await interaction.deferReply({ ephemeral: true }).catch(() => undefined);
            await interaction.followUp(Localisation.getLocalisation(text, ...args));
        };


        if (command.available === CommandAvailable.Guild && isDM(interaction.channel)) {
            return reportIssue("command.available.server");
        } else if (command.available === CommandAvailable.DM && !isDM(interaction.channel)) {
            return reportIssue("command.available.dm");
        }

        const response = await hasPermission({ commandAccess: command.access, author: interaction.user, member: <GuildMember>interaction.member, isDM: isDM(interaction.channel), guild: interaction.guild, customCheck: command.baseCommand.customPermissionCheck });

        if (!response.hasPermission) {
            return reportIssue(response.reason);
        }

        if (!cooldowns.has(interaction.commandName)) {
            cooldowns.set(interaction.commandName, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(interaction.commandName);
        const cooldownAmount = (command.cooldown === undefined ? 3 : command.cooldown) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                // return message.reply(Localisation.getTranslation("command.cooldown", secondsToTime(timeLeft), commandName));
                return reportIssue("command.cooldown", secondsToTime(timeLeft), interaction.commandName);
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        await interaction.deferReply({ ephemeral: command.deferEphemeral }).catch(() => undefined);

        const args: string[] = [];

        for (const option of interaction.options.data) {
            if (option.type === ApplicationCommandOptionType.Subcommand) {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value.toString());
                });
            } else if (option.value) args.push(option.value.toString());
        }
        if (interaction.guild)
            interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        try {
            const cmdArgs = new SlashCommandArguments(interaction, args);
            await command.onRun(cmdArgs);
        } catch (error) {
            await reportBotError(error.stack, interaction);
        }
    });
}
import { GuildMember } from "discord.js";
import { BotUser } from "../BotClient";
import { Localisation } from "../localisation";
import { CommandAvailable } from "../structs/CommandAvailable";
import { CommandAccess } from "../structs/CommandAccess";
import { SlashCommandArguments } from "../structs/SlashCommand";
import { isBooster, isDM, isModerator, isPatreon, reportError } from "../utils/Utils";

export = () => {
    BotUser.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;


        const command = BotUser.SlashCommands.get(interaction.commandName);
        if (!command)
            return <any>interaction.reply("No command");

        await interaction.deferReply({ ephemeral: command.deferEphemeral }).catch(() => undefined);

        if (command.available === CommandAvailable.Guild && isDM(interaction.channel)) {
            return interaction.followUp(Localisation.getTranslation("command.available.server"));
        } else if (command.available === CommandAvailable.DM && !isDM(interaction.channel)) {
            return interaction.followUp(Localisation.getTranslation("command.available.dm"));
        }

        switch (command.access) {
            case CommandAccess.Patreon: {
                if (isDM(interaction.channel) || !(await isPatreon(interaction.user.id, interaction.guild.id))) {
                    return interaction.followUp(Localisation.getTranslation("command.access.patreon"));
                }
            } break;
            case CommandAccess.Booster: {
                if (isDM(interaction.channel) || !isBooster(<GuildMember>interaction.member)) {
                    return interaction.followUp(Localisation.getTranslation("command.access.booster"));
                }
            } break;
            case CommandAccess.Moderators: {
                if (isDM(interaction.channel) || !isModerator(<GuildMember>interaction.member)) {
                    return interaction.followUp(Localisation.getTranslation("command.access.moderator"));
                }
            } break;
            case CommandAccess.GuildOwner: {
                if (isDM(interaction.channel) || interaction.user.id !== interaction.guild.ownerId) {
                    return interaction.followUp(Localisation.getTranslation("command.access.guildOwner"));
                }
            } break;
            case CommandAccess.BotOwner: {
                if (interaction.user.id !== process.env.OWNER_ID) {
                    return interaction.followUp(Localisation.getTranslation("command.access.botOwner"));
                }
            } break;
        }

        const args: string[] = [];

        for (const option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value.toString());
                });
            } else if (option.value) args.push(option.value.toString());
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        try {
            const cmdArgs = new SlashCommandArguments(interaction, args);
            await command.onRun(cmdArgs);
        } catch (error) {
            await reportError(error.stack, interaction);
        }
    });
}
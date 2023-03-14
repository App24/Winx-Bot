import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { Owner } from "../../structs/Category";
import { RegisterSlashCommandsBaseCommand } from "../../baseCommands/owner/SlashCommands";

class RegisterSlashCommandsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;

        this.baseCommand = new RegisterSlashCommandsBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     await createMessageSelection({
    //         sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
    //             options:
    //                 [
    //                     {
    //                         label: Localisation.getTranslation("button.register"),
    //                         value: "register",
    //                         onSelect: async ({ interaction }) => {
    //                             await createMessageSelection({
    //                                 sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
    //                                     options: [
    //                                         {
    //                                             label: Localisation.getTranslation("button.global"),
    //                                             value: "global",
    //                                             onSelect: async ({ interaction }) => {
    //                                                 const commands = BotUser.SlashCommands.map((c, n) => {
    //                                                     if (c.guildIds.length) return;
    //                                                     const command: ApplicationCommandData = c.commandData;
    //                                                     if (command.type === ApplicationCommandType.ChatInput)
    //                                                         command.description = command.description.toLowerCase();
    //                                                     if (command.name === "")
    //                                                         command.name = n;
    //                                                     return command;
    //                                                 });
    //                                                 BotUser.application.commands.set(commands).then(() => {
    //                                                     interaction.reply(Localisation.getTranslation("generic.done"));
    //                                                 }).catch(r => {
    //                                                     reportError(r, interaction);
    //                                                 });
    //                                             },
    //                                             default: false,
    //                                             description: null,
    //                                             emoji: null
    //                                         },
    //                                         {
    //                                             label: Localisation.getTranslation("button.guild"),
    //                                             value: "guild",
    //                                             onSelect: async ({ interaction }) => {
    //                                                 const commands = BotUser.SlashCommands.map((c, n) => {
    //                                                     if (!c.guildIds.includes(cmdArgs.guildId)) return;
    //                                                     const command: ApplicationCommandData = c.commandData;
    //                                                     if (command.type === ApplicationCommandType.ChatInput)
    //                                                         command.description = command.description.toLowerCase();
    //                                                     if (command.name === "")
    //                                                         command.name = n;
    //                                                     return command;
    //                                                 });
    //                                                 cmdArgs.guild.commands.set(commands).then(() => {
    //                                                     interaction.reply(Localisation.getTranslation("generic.done"));
    //                                                 }).catch(r => {
    //                                                     reportError(r, interaction);
    //                                                 });
    //                                             },
    //                                             default: false,
    //                                             description: null,
    //                                             emoji: null
    //                                         }
    //                                     ]
    //                                 }
    //                             });
    //                         },
    //                         default: false,
    //                         description: null,
    //                         emoji: null
    //                     },
    //                     {
    //                         label: Localisation.getTranslation("button.reset"),
    //                         value: "reset",
    //                         onSelect: async ({ interaction }) => {
    //                             await createMessageSelection({
    //                                 sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
    //                                     options: [
    //                                         {
    //                                             label: Localisation.getTranslation("button.global"),
    //                                             value: "global",
    //                                             onSelect: async ({ interaction }) => {
    //                                                 interaction.deferReply();
    //                                                 const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    //                                                 rest.get(Routes.applicationCommands(BotUser.user.id))
    //                                                     .then((data: any) => {
    //                                                         const promises = [];
    //                                                         for (const command of data) {
    //                                                             const deleteUrl = `${Routes.applicationCommands(BotUser.user.id)}/${command.id}`;
    //                                                             promises.push(rest.delete(<any>deleteUrl));
    //                                                         }
    //                                                         return Promise.all(promises).then(() => interaction.followUp(Localisation.getTranslation("generic.done")));
    //                                                     });
    //                                             },
    //                                             default: false,
    //                                             description: null,
    //                                             emoji: null
    //                                         },
    //                                         {
    //                                             label: Localisation.getTranslation("button.guild"),
    //                                             value: "guild",
    //                                             onSelect: async ({ interaction }) => {
    //                                                 interaction.deferReply();
    //                                                 const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    //                                                 rest.get(Routes.applicationGuildCommands(BotUser.user.id, cmdArgs.guildId))
    //                                                     .then((data: any) => {
    //                                                         const promises = [];
    //                                                         for (const command of data) {
    //                                                             const deleteUrl = `${Routes.applicationGuildCommands(BotUser.user.id, cmdArgs.guildId)}/${command.id}`;
    //                                                             promises.push(rest.delete(<any>deleteUrl));
    //                                                         }
    //                                                         return Promise.all(promises).then(() => interaction.followUp(Localisation.getTranslation("generic.done")));
    //                                                     });
    //                                             },
    //                                             default: false,
    //                                             description: null,
    //                                             emoji: null
    //                                         }
    //                                     ]
    //                                 }
    //                             });
    //                         },
    //                         default: false,
    //                         description: null,
    //                         emoji: null
    //                     }
    //                 ]
    //         }
    //     });
    // }
}

export = RegisterSlashCommandsCommand;
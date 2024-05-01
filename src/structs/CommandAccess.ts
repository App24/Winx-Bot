export enum CommandAccess {
    Everyone = 0,
    Patron = 1,
    Booster = 2,
    Moderators = 4,
    GuildOwner = 8,
    BotOwner = 16,
    Custom = 32,
    WeeklyTopChatter = 64,
    PatronOrBooster = Patron | Booster,
}

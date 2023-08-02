import { loadImage } from "canvas";
import { User } from "discord.js";
import { existsSync } from "fs";
import { RankLevel, RankLevelData } from "../structs/databaseTypes/RankLevel";
import { ServerUserSettings } from "../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { WinxCharacter } from "../structs/WinxCharacters";
import { getDatabase, getOneDatabase } from "./Utils";
import { Document } from "mongoose";

export async function getRank(level: number, guildId: string) {
    const rank = await getOneDatabase(RankLevel, { guildId, level });
    return rank;
}

export async function getNextRank(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.level - b.level;
    });

    let rankToReturn: Document<unknown, Record<string, unknown>, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    };
    for (const rank of ranks) {
        if (rank.level <= currentLevel) continue;
        rankToReturn = rank;
        break;
    }

    return rankToReturn;
}

export async function getCurrentRank(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.level - b.level;
    });

    let rankToReturn: Document<unknown, Record<string, unknown>, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    };
    for (const rank of ranks) {
        if (rank.level > currentLevel) break;
        if (rank.level <= currentLevel) {
            rankToReturn = rank;
        }
    }

    return rankToReturn;
}

export async function getPreviousRank(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.level - b.level;
    });

    let currentRank: Document<unknown, Record<string, unknown>, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    };
    for (const rank of ranks) {
        if (rank.level > currentLevel) break;
        if (rank.level <= currentLevel) {
            currentRank = rank;
        }
    }

    let rankToReturn: Document<unknown, Record<string, unknown>, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    };
    for (const rank of ranks) {
        if (rank.level >= currentLevel || rank.level === currentRank.level) break;
        if (rank.level < currentLevel) {
            rankToReturn = rank;
        }
    }

    return rankToReturn;
}

export async function getPreviousRanks(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.level - b.level;
    });

    let currentRank: Document<unknown, Record<string, unknown>, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    };
    for (const rank of ranks) {
        if (rank.level > currentLevel) break;
        if (rank.level <= currentLevel) {
            currentRank = rank;
        }
    }

    const ranksToReturn: (Document<unknown, Record<string, unknown>, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        gifs: string[];
        wings: {
            aisha?: string;
            stella?: string;
            bloom?: string;
            tecna?: string;
            musa?: string;
            flora?: string;
        };
        roleId?: string;
        level?: number;
    })[] = [];
    for (const rank of ranks) {
        if (rank.level >= currentLevel || rank.level === currentRank.level) break;
        if (rank.level < currentLevel) {
            ranksToReturn.push(rank);
        }
    }

    return ranksToReturn;
}

export async function getServerUserSettings(userId: string, guildId: string) {
    return await getOneDatabase(ServerUserSettings, { guildId, userId }, () => new ServerUserSettings({ guildId, userId }));
}

export async function getWingsImage(user: User, guildId: string) {
    const serverUserSettings = await getServerUserSettings(user.id, guildId);
    const userLevel = await getOneDatabase(UserLevel, { guildId: guildId, "levelData.userId": user.id }, () => new UserLevel({ guildId: guildId, levelData: { userId: user.id } }));

    let level = userLevel.levelData.level;
    if (serverUserSettings.wingsLevel >= 0) {
        level = serverUserSettings.wingsLevel;
    }

    return getWingsImageByLevel(level, serverUserSettings.winxCharacter, guildId);
}

export async function getWingsImageByLevel(level: number, winxCharacter: WinxCharacter, guildId: string) {
    const rank = await getCurrentRank(level, guildId);

    return getWingsImageByRank(rank ? rank.toObject() : null, winxCharacter);
}

export async function getWingsImageByRank(rank: RankLevelData, winxCharacter: WinxCharacter) {
    if (winxCharacter <= 0)
        return;

    if (!rank || !rank.wings)
        return;

    const characterWingFile = Object.values(rank.wings)[winxCharacter - 1];

    if (characterWingFile !== "" && existsSync(characterWingFile)) {
        return loadImage(characterWingFile);
    }

    return;
}

/*export async function getRankRoles(guild: Guild, maxLevel = Number.MAX_SAFE_INTEGER) {
    const ranks = await getDatabase(RankLevel, { guildId: guild.id });

    ranks.sort((a, b) => {
        return a.level - b.level;
    });

    const toReturn: { rank: typeof RankLevel, role: Role }[] = [];

    await asyncForEach(ranks, async (rank) => {
        if (rank.level <= maxLevel) {
            const role = await getRoleById(rank.roleId, guild);
            if (!role) return;
            toReturn.push({ rank, role });
        }
    });

    return toReturn;
}*/
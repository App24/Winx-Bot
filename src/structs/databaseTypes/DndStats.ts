export class DndStats {
    public userId: string;
    public agility: number;
    public charisma: number;
    public intelligence: number;
    public luck: number;
    public magic: number;
    public strenth: number;

    public constructor(userId: string, agility: number,
        charisma: number,
        intelligence: number,
        luck: number,
        magic: number,
        strenth: number) {
        this.userId = userId;
        this.agility = agility;
        this.charisma = charisma;
        this.intelligence = intelligence;
        this.luck = luck;
        this.magic = magic;
        this.strenth = strenth;
    }
}

export function getStat(stats: DndStats, index: number): number {
    switch (index) {
        case 0: {
            return stats.agility;
        }
        case 1: {
            return stats.charisma;
        }
        case 2: {
            return stats.intelligence;
        }
        case 3: {
            return stats.luck;
        }
        case 4: {
            return stats.magic;
        }
        case 5: {
            return stats.strenth;
        }
    }
}

export function setStat(stats: DndStats, index: number, value: number) {
    switch (index) {
        case 0: {
            stats.agility = value;
        }
            break;
        case 1: {
            stats.charisma = value;
        }
            break;
        case 2: {
            stats.intelligence = value;
        }
            break;
        case 3: {
            stats.luck = value;
        }
            break;
        case 4: {
            stats.magic = value;
        }
            break;
        case 5: {
            stats.strenth = value;
        }
            break;
    }
}
import { UserLevel } from "./UserLevel";

export class RecentLeaderboardData {
    public startDate: number;
    public users: UserLevel[];
    public previousTop: string[];
    public topRoleId: string;

    public constructor() {
        this.startDate = new Date().getTime();
        this.users = [];
        this.previousTop = [];
    }
}
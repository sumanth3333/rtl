import { TodayGoalRow } from "@/types/todayGoal";
import apiClient from "./api/apiClient";


export const goalService = {
    todayGoal(companyName: string) {
        return apiClient.get<TodayGoalRow[]>("/company/todayGoal", {
            params: { companyName },
        });
    },
};

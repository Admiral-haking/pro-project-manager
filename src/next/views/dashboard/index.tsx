import { Box, Stack } from "@mui/material";
import FinancialChart from "./components/financial-chart";
import FinancialCategoryChart from "./components/financial-category-chart";
import FinancialSummary from "./components/financial-summary";
import DashboardProjects from "./components/projects";
import DashboardServers from "./components/servers";
import Reminders from "./components/reminders";
import RecentTransactions from "./components/recent-transactions";

export default function DashboardView() {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "repeat(12, minmax(0, 1fr))" },
                gap: 2,
                gridAutoFlow: "dense",
                alignItems: "start",
            }}
        >
            <Box sx={{ gridColumn: { xs: "span 12", lg: "span 8" } }}>
                <Stack gap={2}>
                    <FinancialChart />
                    <RecentTransactions />
                </Stack>
            </Box>
            <Box
                sx={{
                    gridColumn: { xs: "span 12", lg: "span 4" },
                    display: "grid",
                    gap: 2,
                    alignSelf: "stretch",
                }}
            >
                <FinancialCategoryChart />
                <FinancialSummary />
            </Box>
            <Box sx={{ gridColumn: { xs: "span 12", lg: "span 6", xl: "span 4" } }}>
                <Reminders />
            </Box>
            <Box sx={{ gridColumn: { xs: "span 12", lg: "span 6", xl: "span 4" } }}>
                <DashboardProjects />
            </Box>
            <Box sx={{ gridColumn: { xs: "span 12", lg: "span 6", xl: "span 4" } }}>
                <DashboardServers />
            </Box>
        </Box>
    )
}

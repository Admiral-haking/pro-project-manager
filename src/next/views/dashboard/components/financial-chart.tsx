"use client";
import { alpha, Box, Button, Chip, Divider, Stack, Typography, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";


export default function FinancialChart() {

    const theme = useTheme()
    const [range, setRange] = useState<"week" | "month" | "quarter">("month");
    const [groupBy, setGroupBy] = useState<"category" | "account" | "region">("category");

    const [state, setState] = useState([
        {
            name: "Income",
            data: [30, 40, 45, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 60, 70, 91]
        },
        {
            name: "Tax",
            data: [5, 8, 2, 13, 2, 7, 3, 9, 30, 40, 45, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 60, 70, 91,]
        },
        {
            name: "Expense",
            data: [25, 30, 45, 20, 44, 90, 40, 80, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49, 50, 49, 60, 70, 91, 30, 40, 45, 50, 49,]
        },
        {
            name: "Transfer",
            data: [50, 0, 87, 100, 0, 0, 0, 0, 25, 30, 45, 20, 44, 90, 40, 80, 25, 30, 45, 20, 44, 90, 40, 80, 25, 30, 45, 20, 44, 90, 40, 80, 25, 30, 45, 20, 44, 90, 40, 80]
        }
    ])

    const net = useMemo(() => {
        const income = state.find(s => s.name === "Income")?.data.reduce((a, b) => a + b, 0) ?? 0;
        const expense = state.find(s => s.name === "Expense")?.data.reduce((a, b) => a + b, 0) ?? 0;
        return income - expense;
    }, [state]);

    return (
        <Box
            sx={theme => ({
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.92),
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.25)}`,
                p: 2.5,
            })}
        >
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "-25% -10% auto auto",
                    height: 240,
                    width: 240,
                    background: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.28)}, transparent 65%)`,
                    filter: "blur(10px)",
                    zIndex: 0,
                })}
            />
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "auto auto -30% -10%",
                    height: 260,
                    width: 260,
                    background: `radial-gradient(circle at 70% 70%, ${alpha(theme.palette.secondary.main, 0.22)}, transparent 60%)`,
                    filter: "blur(12px)",
                    zIndex: 0,
                })}
            />
            <Stack gap={1.5} sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                        Financial Report
                    </Typography>
                    <Chip
                        label="Live"
                        size="small"
                        color="success"
                        sx={theme => ({
                            bgcolor: alpha(theme.palette.success.main, 0.2),
                            color: theme.palette.success.main,
                        })}
                    />
                    <Box flex="1 1 auto" />
                    <Stack direction="row" gap={0.5}>
                        {(["week", "month", "quarter"] as const).map(option => (
                            <Button
                                key={option}
                                size="small"
                                variant={range === option ? "contained" : "text"}
                                color={range === option ? "primary" : "inherit"}
                                onClick={() => setRange(option)}
                            >
                                {option}
                            </Button>
                        ))}
                    </Stack>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary" flex="1 1 auto">
                        Income vs expense with transfers & tax overlays—stacked by {groupBy}.
                    </Typography>
                    <Chip
                        label={`Group: ${groupBy}`}
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            const order: typeof groupBy[] = ["category", "account", "region"];
                            const idx = order.indexOf(groupBy);
                            setGroupBy(order[(idx + 1) % order.length]);
                        }}
                        sx={theme => ({
                            borderColor: alpha(theme.palette.text.primary, 0.2),
                            bgcolor: alpha(theme.palette.text.primary, 0.2),
                            color: theme.palette.text.primary,
                        })}
                    />
                </Stack>
                <Stack direction="row" alignItems="center" gap={2} sx={theme => ({
                    p: 1.5,
                    borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.background.default, 0.8),
                    backdropFilter: "blur(6px)",
                })}>
                    <Stack>
                        <Typography variant="caption" color="text.secondary">
                            Net this {range}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color={net >= 0 ? "success.main" : "error.main"}>
                            ${net.toLocaleString()}
                        </Typography>
                    </Stack>
                    <Divider orientation="vertical" flexItem />
                    <Stack>
                        <Typography variant="caption" color="text.secondary">
                            Tax overlay
                        </Typography>
                        <Typography fontWeight="bold">Included</Typography>
                    </Stack>
                    <Divider orientation="vertical" flexItem />
                    <Stack>
                        <Typography variant="caption" color="text.secondary">
                            Transfer volume
                        </Typography>
                        <Typography fontWeight="bold">+18%</Typography>
                    </Stack>
                </Stack>

                <Chart
                    options={{
                        chart: {
                            type: "area",
                            background: "transparent",
                            foreColor: theme.palette.text.secondary,
                            toolbar: { show: false },
                            zoom: { enabled: false },
                        },

                        theme: { mode: "dark" },
                        grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
                        stroke: { width: 3, curve: "smooth" },
                        colors: [
                            theme.palette.primary.main,
                            theme.palette.secondary.main,
                            theme.palette.error.main,
                            theme.palette.warning.main,
                        ],
                        dataLabels: { enabled: false },
                        fill: {
                            type: "gradient",
                            gradient: {
                                shadeIntensity: 0.5,
                                opacityFrom: 0.35,
                                opacityTo: 0.05,
                                stops: [0, 90, 100],
                            },
                        },
                        yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
                        legend: {
                            labels: { colors: theme.palette.text.primary },
                            itemMargin: { horizontal: 12 },
                        },
                        tooltip: {
                            theme: "dark",
                            style: { fontFamily: theme.typography.fontFamily },
                            fillSeriesColor: false,
                        },
                        xaxis: {
                            axisBorder: { color: theme.palette.divider },
                            axisTicks: { color: theme.palette.divider },
                            labels: { style: { colors: theme.palette.text.secondary } },
                            crosshairs: { stroke: { color: alpha(theme.palette.text.primary, 0) } },
                            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
                        },
                    }}
                    series={state}
                    type="area"
                    width="100%"
                    height={350}
                />
            </Stack>
        </Box>
    )

}

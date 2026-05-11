"use client";
import { alpha, Box, Divider, Stack, Typography, useTheme } from "@mui/material";
import { orange, purple } from "@mui/material/colors";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";


export default function FinancialCategoryChart() {

    const theme = useTheme()

    const [state, setState] = useState([18, 10, 60, 256, 90])
    const labels = ["Coffee", "Joyce", "Food", "Shop", "Taxi"];
    const total = state.reduce((a, b) => a + b, 0);
    const palette = useMemo(
        () => [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.error.main,
            theme.palette.warning.main,
            theme.palette.info.main,
            theme.palette.success.main,
            orange[600],
            purple[600],
        ],
        [theme.palette]
    );


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
                    inset: "-20% -10% auto auto",
                    height: 200,
                    width: 200,
                    background: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.info.main, 0.28)}, transparent 65%)`,
                    filter: "blur(8px)",
                    zIndex: 0,
                })}
            />
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "auto auto -30% -10%",
                    height: 220,
                    width: 220,
                    background: `radial-gradient(circle at 70% 70%, ${alpha(theme.palette.secondary.main, 0.22)}, transparent 60%)`,
                    filter: "blur(10px)",
                    zIndex: 0,
                })}
            />

            <Stack gap={1.5} sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                        Spend by Category
                    </Typography>
                    <Box flex="1 1 auto" />
                    <Typography variant="caption" color="text.secondary">
                        Sorted by size • This month
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" gap={1} sx={theme => ({
                    p: 1.25,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.background.default, 0.85),
                    backdropFilter: "blur(6px)",
                })}>
                    <Stack>
                        <Typography variant="caption" color="text.secondary">
                            Total spend
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            ${total.toLocaleString()}
                        </Typography>
                    </Stack>
                    <Divider orientation="vertical" flexItem />
                    <Stack>
                        <Typography variant="caption" color="text.secondary">
                            Trend
                        </Typography>
                        <Typography color="success.main" fontWeight="bold">
                            +6.2%
                        </Typography>
                    </Stack>
                </Stack>

                <Chart
                    options={{
                        chart: {
                            type: "donut",
                            background: "transparent",
                            foreColor: theme.palette.text.secondary,
                            toolbar: { show: false },
                            zoom: { enabled: false },
                        },

                        theme: { mode: "dark" },
                        grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
                        stroke: { width: 3, curve: "smooth" },
                        colors: palette,
                        dataLabels: { enabled: false },
                        legend: { show: false },
                        tooltip: {
                            theme: "dark",
                            style: { fontFamily: theme.typography.fontFamily },
                            fillSeriesColor: false,
                        },
                        labels,
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: "72%",
                                    labels: {
                                        show: true,
                                        total: {
                                            show: true,
                                            label: "Total",
                                            color: theme.palette.text.secondary,
                                            formatter: () => `$${total.toLocaleString()}`,
                                        },
                                        value: {
                                            formatter: (val: string) => `$${Number(val || 0).toLocaleString()}`,
                                        },
                                    },
                                },
                            },
                        },
                    }}
                    series={state}
                    type="donut"
                    width="100%"
                    height={220}
                />

                <Stack gap={0.75}>
                    {state.map((value, idx) => (
                        <Stack
                            key={labels[idx]}
                            direction="row"
                            alignItems="center"
                            gap={1}
                            sx={theme => ({
                                p: 0.9,
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.background.default, 0.7),
                            })}
                        >
                            <Box
                                sx={{
                                    height: 10,
                                    width: 10,
                                    borderRadius: "50%",
                                    bgcolor: palette[idx % palette.length],
                                }}
                            />
                            <Typography flex="1 1 auto" fontWeight="bold">
                                {labels[idx]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {((value / total) * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                ${value.toLocaleString()}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Stack>
        </Box>
    )

}

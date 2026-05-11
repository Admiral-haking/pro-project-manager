import { Box, Stack, Typography } from "@mui/material";

export default function FinancialSummary() {
    return <Box
        sx={{
            bgcolor: 'background.default',
            width: '100%',
            flex: '1 1 auto',
            borderRadius: .5,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 200
        }}
    >
        <Box
            sx={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                transform: 'scale(5) translateX(45%) translateY(-10%)',
                zIndex: 0,
                opacity: .5,
                color: 'primary.main'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M15.668 7a.75.75 0 0 1 .75-.75H22a.75.75 0 0 1 .75.75v5.546a.75.75 0 0 1-1.5 0V7.75h-4.832a.75.75 0 0 1-.75-.75" clipRule="evenodd"></path>
                <path fill="currentColor" d="m20.187 7.75l-6.095 6.053c-.514.51-.847.84-1.125 1.05c-.26.197-.381.219-.462.219c-.08 0-.202-.022-.462-.22c-.277-.21-.61-.539-1.124-1.05l-.274-.272c-.47-.467-.874-.87-1.241-1.148c-.394-.299-.831-.525-1.37-.525s-.976.227-1.37.526c-.367.279-.77.682-1.24 1.149l-3.953 3.937a.75.75 0 1 0 1.058 1.062l3.919-3.902c.514-.511.847-.84 1.124-1.052c.26-.197.382-.22.462-.22s.203.022.463.22c.278.21.61.54 1.125 1.051l.274.273c.47.466.873.868 1.24 1.146c.394.299.83.525 1.369.525c.538 0 .975-.226 1.369-.524c.367-.279.771-.68 1.24-1.147L21.25 8.81V7.75z" opacity={0.5}></path>
            </svg>
        </Box>
        <Stack gap={2} sx={{ p: 2 }}>
            <Typography fontWeight="bold" variant="h4">
                Income {" "} <Typography variant="caption" component="span">
                    | this month
                </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
                amount of money that we collected from your bank account for this month.
            </Typography>
        </Stack>

        <Box
            sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                zIndex: 0,
                p: 2
            }}>

            <Typography variant="h4" fontWeight="bold" color="primary">
                23,254,600
            </Typography>
        </Box>
    </Box>
}
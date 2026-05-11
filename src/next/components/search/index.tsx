import { Box, InputBase, InputProps, Stack } from "@mui/material";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';


type Props = InputProps
export default function SearchBox({ ...props }: Props) {

    return <Box
        sx={{
            position: 'relative',
            maxWidth: 400,
            width: '100%',
        }}
    >
        <Stack
            direction="row"
            alignItems="center"
            gap={2}
            className="noDrag"
            sx={{
                p: 0,
                overflow: 'hidden',
                transition: 'all .2s ease',
                px: 1,
                borderRadius: 3,
                backgroundColor: '#2b2b2b'
            }}
        >
            <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
            <InputBase
                placeholder="Search..."
                sx={{
                    p: .5
                }}
                fullWidth
                {...props}
            />
        </Stack>
    </Box>
}
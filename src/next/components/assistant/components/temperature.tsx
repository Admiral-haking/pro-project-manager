import { useState } from 'react';
import { Button, ButtonGroup, Menu, MenuItem, Typography, Box } from '@mui/material';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';

const temperatureOptions: { title: string; value: number }[] = [
    { title: "deterministic", value: 0 },
    { title: "very precise", value: 0.1 },
    { title: "precise", value: 0.2 },
    { title: "focused", value: 0.3 },
    { title: "balanced", value: 0.5 },
    { title: "creative", value: 0.7 },
    { title: "very creative", value: 0.9 },
    { title: "highly creative", value: 1.1 },
    { title: "exploratory", value: 1.3 },
    { title: "experimental", value: 1.5 },
    { title: "unpredictable", value: 1.7 },
    { title: "random", value: 2 },
];

export default function AssistantTemperature({ value, onChange }: { value: number; onChange: (value: number) => any }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // Find the current temperature option
    const currentOption = temperatureOptions.find((option) => option.value === value) || temperatureOptions[0];

    const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (selectedValue: number) => {
        onChange(selectedValue);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            <ButtonGroup variant="text" size="small" color='inherit'>
                <Button
                    onClick={handleButtonClick}
                    endIcon={open ? <ArrowDropUpRoundedIcon /> : <ArrowDropDownRoundedIcon />}
                    aria-controls={open ? 'temperature-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                >
                    {currentOption.title}
                </Button>
            </ButtonGroup>

            <Menu
                id="temperature-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'temperature-button',
                        dense: true,
                    },
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {temperatureOptions.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => handleMenuItemClick(option.value)}
                        selected={option.value === value}
                        sx={{
                            minWidth: 140,
                            justifyContent: 'space-between',
                            backgroundColor: option.value === value ? 'action.selected' : 'transparent',
                        }}
                    >
                        <Typography variant="body2">{option.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {option.value}
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}

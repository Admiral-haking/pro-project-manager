'use client';

import { alpha, createTheme } from '@mui/material/styles';
import { Oxygen, Vazirmatn } from 'next/font/google';

const rubik = Oxygen({
  weight: ['400', '300', '700'],
  display: 'swap',
  preload: true,
  subsets: ['latin'],
});

const vazirmatn = Vazirmatn({
  weight: ['400', '600', '800'],
  display: 'swap',
  preload: true,
  subsets: ['arabic'],
});

const LINK_COLOR = 'hsla(210, 90%, 70%, 1.00)';

const theme = createTheme({
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: `${rubik.style.fontFamily}, ${vazirmatn.style.fontFamily}`,
  },

  palette: {
    background: { default: '#000000', paper: '#010101' },
    text: { primary: '#ffffffff', secondary: 'rgba(177, 177, 177, 0.96)' },
    primary: { main: '#0ffb9e', contrastText: '#000000' },
    secondary: { main: '#c3e652', contrastText: '#000000' },
    info: { main: '#0f89fb', contrastText: '#FFFFFF' },
    success: { main: '#1fe471', contrastText: '#000000' },
    warning: { main: '#FFB74D', contrastText: '#000000' },
    error: { main: '#f77270', contrastText: '#000000' },
    divider: 'rgba(255, 255, 255, 0.27)',
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiButton: {
      defaultProps: {
        color: 'primary',
        sx: {
          textTransform: 'none'
        }
      }
    },
    MuiIconButton: {
      defaultProps: {
        color: 'inherit',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: 'none'
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: () => ({
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        a: {
          color: LINK_COLOR,
          textDecoration: 'none',
        },
      }),
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: LINK_COLOR,
          textDecoration: 'none',
        },
      },
    },
  },
});

export default theme;

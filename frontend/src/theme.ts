import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Cyan-indigo palette — slightly purple-shifted for richness
const brand: MantineColorsTuple = [
  '#dfe5f8', // lightest
  '#c5cff2', // light
  '#b3c1f2', // select bg / table row bg
  '#7d92e4', // button hover
  '#5570db', // primary buttons
  '#3a57d4', // filled buttons
  '#2f4ac2', // strong accent
  '#3057e3', // dark accent
  '#2a4ecc', // darker
  '#2344b5', // darkest
];

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand,
    dark: [
      '#C1C2C5', // text
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#464950', // borders
      '#36393f', // card bg
      '#2c2f35', // body bg — lighter than default #25262b
      '#272a30', // slightly deeper
      '#222529',
      '#1c1e22',
    ],
  },
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
        overlayProps: { backgroundOpacity: 0.35, blur: 4 },
      },
      styles: {
        header: {
          paddingBottom: 0,
        },
        title: {
          fontWeight: 600,
          fontSize: '1.1rem',
        },
        body: {
          paddingTop: 16,
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: true,
      },
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
        transitionProps: { transition: 'fade', duration: 150 },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

import { alpha, createTheme } from "@mui/material/styles";

// Brand colors used everywhere in the app.
const GREEN = "#085726";
const AMBER = "#dea037";
const INK = "#16301f"; // main text color, a very dark green

// Glass surfaces: translucent white + blur over the colorful page background.
// `glass` is for main surfaces (navbar, cards, menus); `glassSoft` is for
// panels that sit inside a glass surface (card body, inputs).
export const glass = {
  backgroundColor: "rgba(255, 255, 255, 0.42)",
  backdropFilter: "blur(18px) saturate(160%)",
  WebkitBackdropFilter: "blur(18px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.65)",
  boxShadow: `0 8px 32px ${alpha(GREEN, 0.14)}, inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
} as const;

// More opaque, for floating surfaces that hold text over other content
// (menus, drawer, search suggestions).
export const glassStrong = {
  ...glass,
  backgroundColor: "rgba(255, 255, 255, 0.72)",
} as const;

export const glassSoft = {
  backgroundColor: "rgba(255, 255, 255, 0.55)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
} as const;

const RADIUS = 20;

const theme = createTheme({
  palette: {
    primary: { main: GREEN },
    secondary: { main: AMBER },
    text: { primary: INK, secondary: alpha(INK, 0.68) },
    background: { default: "#e6f2e4" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          backgroundColor: "#e6f2e4",
          // Soft color blobs give the glass something to blur.
          backgroundImage: [
            `radial-gradient(circle at 12% 18%, ${alpha("#5fbf7f", 0.55)} 0, transparent 38%)`,
            `radial-gradient(circle at 88% 12%, ${alpha(AMBER, 0.45)} 0, transparent 34%)`,
            `radial-gradient(circle at 78% 82%, ${alpha("#2e8b57", 0.4)} 0, transparent 40%)`,
            `radial-gradient(circle at 20% 90%, ${alpha("#f3d9a4", 0.7)} 0, transparent 36%)`,
            "linear-gradient(160deg, #eaf5e6 0%, #f6f1e4 100%)",
          ].join(", "),
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "transparent" },
      styleOverrides: {
        root: {
          ...glass,
          color: INK,
          borderRadius: RADIUS,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { ...glass, borderRadius: RADIUS },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...glassStrong,
          borderRadius: `0 ${RADIUS}px ${RADIUS}px 0`,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { ...glassStrong, borderRadius: 14 },
      },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 999, paddingInline: 16 } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "&.Mui-selected": { backgroundColor: alpha(GREEN, 0.12) },
          "&.Mui-selected:hover": { backgroundColor: alpha(GREEN, 0.18) },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          ...glassSoft,
          "&.Mui-selected": { backgroundColor: GREEN, color: "#fff", borderColor: GREEN },
          "&.Mui-selected:hover": { backgroundColor: GREEN },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { ...glass, borderRadius: 14, color: INK },
      },
    },
    MuiCircularProgress: {
      defaultProps: { color: "primary" },
    },
  },
});

export default theme;

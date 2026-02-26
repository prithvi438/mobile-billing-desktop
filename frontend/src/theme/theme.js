import { colors } from "./colors";
import { typography } from "./typography";

export const theme = {
  colors,
  typography,

  layout: {
    borderRadius: "8px",
    cardRadius: "10px",
    padding: "0px"
  },

  button: {
    primary: {
      background: colors.accentOrange,
      color: colors.white,
      padding: "14px 20px",
      fontSize: "16px",
      fontWeight: 600
    }
  }
};

import type { ThemeConfig } from "antd";

const customAntTheme: ThemeConfig = {
  token: {
    colorPrimary: "#722ED1",
    borderRadius: 8,
    colorTextLightSolid: "#ffffff",
    controlHeight: 32,
    boxShadowSecondary: "0px 2px 0px rgba(0, 0, 0, 0.043)",
  },
  components: {
    Button: {
      colorPrimary: "#722ED1",
      colorPrimaryHover: "#925FF0",
      colorPrimaryActive: "#5D19B4",
      boxShadow: "0px 2px 0px rgba(0, 0, 0, 0.043)",
      borderRadius: 8,
      paddingInline: 15,
      paddingBlock: 4,
      controlHeight: 32,
    },
    Table: {
      borderColor: "#F5F5F5",
    },
    Form: {
      verticalLabelPadding: 0,
    },
    Input: {
      lineHeight: 3,
    },
  },
};

export default customAntTheme;

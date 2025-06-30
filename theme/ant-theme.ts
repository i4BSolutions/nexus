import type { ThemeConfig } from "antd";

const customAntTheme: ThemeConfig = {
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
      colorBgContainerDisabled: "#F5F5F5",
    },
    Table: {
      borderColor: "#F5F5F5",
    },
    Form: {
      verticalLabelPadding: 0,
    },
    Menu: {
      itemSelectedBg: "#F9F0FF",
      itemSelectedColor: "#722ED1",
      subMenuItemSelectedColor: "#722ED1",
      itemHoverBg: "#F9F0FF",
      itemBorderRadius: 0,
      itemMarginInline: 0,
    },
  },
};

export default customAntTheme;

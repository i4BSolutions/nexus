import { ProductCurrencyInterface } from "@/types/product/product.type";

const getCurrencyCode = (currencyId: number | string, currenciesData: any) => {
  return (
    currenciesData?.find((c: ProductCurrencyInterface) => c.id === currencyId)
      ?.currency_code || ""
  );
};

export default getCurrencyCode;

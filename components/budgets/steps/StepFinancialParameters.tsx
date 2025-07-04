"use client";

import { BudgetFormInput } from "@/schemas/budgets/budgets.schema";
import { ProductCurrencyInterface } from "@/types/product/product.type";
import { useQuery } from "@tanstack/react-query";
import { Form, InputNumber, Select, Row, Col, Typography } from "antd";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

const { Option } = Select;
const { Text } = Typography;

interface StepFinancialParametersProps {
  onNext: (values: BudgetFormInput) => void;
  onBack: () => void;
  formData?: BudgetFormInput;
}

export interface StepFinancialParametersRef {
  submitForm: () => void;
}

const fetchCurrencies = async () => {
  const res = await fetch("/api/products/get-product-currencies");
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const json = await res.json();
  return json.data;
};

const StepFinancialParameters = forwardRef<
  StepFinancialParametersRef,
  StepFinancialParametersProps
>(({ onNext, onBack, formData }, ref) => {
  const [form] = Form.useForm();

  const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const [plannedAmount, setPlannedAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  const usdEquivalent = exchangeRate > 0 ? plannedAmount / exchangeRate : 0;

  useEffect(() => {
    if (formData) {
      form.setFieldsValue(formData);
      setPlannedAmount(formData.planned_amount || 0);
      setExchangeRate(formData.exchange_rate_usd || 1);
    }
  }, [formData, form]);

  const handleNext = () => {
    form.validateFields().then((values) => {
      onNext({
        ...values,
        planned_amount_usd: usdEquivalent,
      });
    });
  };

  useImperativeHandle(ref, () => ({
    submitForm: handleNext,
  }));

  return (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        {/* Planned Budget */}
        <Col xs={24} md={12}>
          <Form.Item label="Planned Budget" name="planned_amount" required>
            <InputNumber
              addonBefore={
                <Form.Item
                  name="currency_code"
                  noStyle
                  rules={[{ required: true, message: "Currency is required" }]}
                >
                  <Select
                    loading={currenciesLoading}
                    placeholder="Currency"
                    style={{ width: 80 }}
                  >
                    {currenciesData?.map(
                      (currency: ProductCurrencyInterface) => (
                        <Option
                          key={currency.currency_code}
                          value={currency.currency_code}
                        >
                          {currency.currency_code}
                        </Option>
                      )
                    )}
                  </Select>
                </Form.Item>
              }
              style={{ width: "100%" }}
              min={0}
              placeholder="Enter planned budget"
              value={plannedAmount === 0 ? undefined : plannedAmount}
              onChange={(val) => setPlannedAmount(val ?? 0)}
              formatter={(value) =>
                value
                  ? `${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : ""
              }
              parser={(value) => parseFloat(value?.replace(/,/g, "") ?? "0")}
            />
          </Form.Item>
        </Col>

        {/* Exchange Rate */}
        <Col xs={24} md={12}>
          <Form.Item
            label="Exchange Rate (to USD)"
            name="exchange_rate_usd"
            required
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: "100%" }}
              value={exchangeRate}
              onChange={(val) => setExchangeRate(val ?? 1)}
              placeholder="Enter exchange rate(USD)"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* USD Equivalent */}
      <Text strong>Planned Budget (USD Equivalent)</Text>
      <div style={{ fontSize: 20, marginTop: 8 }}>
        ${" "}
        {usdEquivalent.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    </Form>
  );
});

StepFinancialParameters.displayName = "StepFinancialParameters";

export default StepFinancialParameters;

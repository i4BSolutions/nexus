"use client";

import { BudgetFormInput } from "@/schemas/budgets/budgets.schema";
import { ProductCurrencyInterface } from "@/types/product/product.type";
import { useQuery } from "@tanstack/react-query";
import { Form, Input, Select, Row, Col, Typography } from "antd";
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

  const [plannedAmount, setPlannedAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");

  const plannedAmountValue = parseFloat(plannedAmount) || 0;
  const exchangeRateValue = parseFloat(exchangeRate) || 1;

  const usdEquivalent =
    exchangeRateValue > 0 ? plannedAmountValue / exchangeRateValue : 0;

  useEffect(() => {
    if (formData) {
      form.setFieldsValue(formData);
      setPlannedAmount(formData.planned_amount?.toString() || "");
      setExchangeRate(formData.exchange_rate_usd?.toString() || "");
    }
  }, [formData, form]);

  const handleNext = () => {
    form.validateFields().then((values) => {
      onNext({
        ...values,
        planned_amount: parseFloat(plannedAmount),
        exchange_rate_usd: parseFloat(exchangeRate),
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
          <Form.Item
            label="Planned Budget"
            name="planned_amount"
            rules={[
              { required: true, message: "Planned budget is required" },
              {
                validator: (_, value) => {
                  const num = parseFloat(value);
                  if (isNaN(num) || num <= 0) {
                    return Promise.reject(
                      new Error("Must be a positive number greater than 0")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
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
              placeholder="Enter planned budget"
              value={plannedAmount}
              onChange={(e) =>
                setPlannedAmount(e.target.value.replace(/[^\d.]/g, ""))
              }
            />
          </Form.Item>
        </Col>

        {/* Exchange Rate */}
        <Col xs={24} md={12}>
          <Form.Item
            label="Exchange Rate (to USD)"
            name="exchange_rate_usd"
            rules={[
              { required: true, message: "Exchange rate is required" },
              {
                validator: (_, value) => {
                  const num = parseFloat(value);
                  if (isNaN(num) || num <= 0) {
                    return Promise.reject(
                      new Error("Must be a positive number greater than 0")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="Enter exchange rate (USD)"
              value={exchangeRate}
              onChange={(e) =>
                setExchangeRate(e.target.value.replace(/[^\d.]/g, ""))
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Text strong>Planned Budget (USD Equivalent)</Text>
      <div style={{ fontSize: 20, marginTop: 8 }}>
        {" "}
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

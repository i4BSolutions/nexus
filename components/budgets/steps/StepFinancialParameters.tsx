"use client";

import {
  BudgetFormInput,
  BudgetSchema,
} from "@/schemas/budgets/budgets.schema";
import { ProductCurrencyInterface } from "@/types/product/product.type";
import { useQuery } from "@tanstack/react-query";
import { Form, InputNumber, Select, Row, Col, Typography, message } from "antd";
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
      onNext(values);
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
            required
            rules={[
              { required: true, message: "Planned budget is required" },
              {
                pattern: /^[1-9]\d*$/,
                message: "Unit price cannot be 0",
              },
              {
                validator: (_, value) => {
                  if (value && parseFloat(value) <= 0) {
                    return Promise.reject(
                      new Error("Planned budget must be greater than 0")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
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
              min={0}
              style={{ width: "100%" }}
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
              parser={(value) =>
                parseFloat(value?.replace(/[^\d.]/g, "") || "0")
              }
            />
          </Form.Item>
        </Col>

        {/* Exchange Rate */}
        <Col xs={24} md={12}>
          <Form.Item
            label="Exchange Rate (to USD)"
            name="exchange_rate_usd"
            required
            rules={[
              { required: true, message: "Exchange rate is required" },
              {
                pattern: /^\d+(\.\d{1,4})?$/,
                message:
                  "Exchange rate must be a positive number with up to 4 decimal places",
              },
              {
                validator: (_, value) => {
                  if (value && parseFloat(value) <= 0) {
                    return Promise.reject(
                      new Error("Exchange rate must be greater than 0")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: "100%" }}
              value={exchangeRate}
              onChange={(val) => setExchangeRate(val ?? 1)}
              placeholder="Enter exchange rate(USD)"
              parser={(value) => {
                const parsed = value?.replace(/[^\d.]/g, "") ?? "";
                return parsed ? parseFloat(parsed) : NaN;
              }}
              formatter={(value) =>
                value
                  ? `${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : ""
              }
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

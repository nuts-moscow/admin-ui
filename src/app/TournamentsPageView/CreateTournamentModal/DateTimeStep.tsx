"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Form } from "@/components/Form/Form";
import { FormModel } from "@/components/Form/FormModel";
import { DateTime } from "luxon";

export const DateTimeStep: FC = () => {
  return (
    <Box flex={{ align: "center", gap: 8, width: "100%" }}>
      <Form.Control name="date">
        {({
          value,
          onChange,
        }: {
          value: string;
          onChange: (value: string) => void;
        }) => (
          <Box flex={{ col: true, gap: 2, width: "100%" }}>
            <label
              style={{
                fontSize: "var(--font-size-small)",
                fontFamily: "var(--primary-font-family)",
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              Дата
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color-grey)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: "inherit",
                fontFamily: "inherit",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </Box>
        )}
      </Form.Control>

      <Form.Control name="time">
        {({ value, onChange }) => (
          <Box flex={{ col: true, gap: 2, width: "100%" }}>
            <label
              style={{
                fontSize: "var(--font-size-small)",
                fontFamily: "var(--primary-font-family)",
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              Время
            </label>
            <input
              type="time"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color-grey)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: "inherit",
                fontFamily: "inherit",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </Box>
        )}
      </Form.Control>
    </Box>
  );
};

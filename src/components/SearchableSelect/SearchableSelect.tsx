"use client";

import * as Popover from "@radix-ui/react-popover";
import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";

export interface SearchableSelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SearchableSelectProps {
  readonly options: SearchableSelectOption[];
  readonly value?: string;
  readonly placeholder?: string;
  readonly noOptionsMessage?: string;
  readonly disabled?: boolean;
  readonly onChange: (value?: string) => void;
}

export const SearchableSelect: FC<SearchableSelectProps> = ({
  options,
  value,
  placeholder = "Выберите значение",
  noOptionsMessage = "Ничего не найдено",
  disabled = false,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hoveredOptionValue, setHoveredOptionValue] = useState<
    string | undefined
  >(undefined);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={true}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          style={{
            width: "100%",
            minHeight: 56,
            borderRadius: 12,
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--background-primary)",
            color: "var(--text-primary)",
            textAlign: "left",
            padding: "0 14px",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <Typography.Text type={selectedOption ? "primary" : "secondary"}>
            {selectedOption?.label ?? placeholder}
          </Typography.Text>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-modal-allow-interact-outside="true"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          style={{
            width: "var(--radix-popover-trigger-width)",
            maxHeight: "var(--radix-popover-content-available-height)",
            minWidth: 320,
            zIndex: 10010,
            borderRadius: 12,
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--background-primary)",
            boxShadow: "0 18px 36px rgba(0, 0, 0, 0.18)",
            padding: 8,
          }}
        >
          <Box flex={{ col: true, gap: 2 }} style={{ width: "100%" }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск..."
              autoFocus
              style={{
                width: "100%",
                minHeight: 40,
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                padding: "0 10px",
                backgroundColor: "var(--background-primary)",
                color: "var(--text-primary)",
              }}
            />
            <Box
              flex={{ col: true }}
              style={{ width: "100%", maxHeight: 260, overflowY: "auto", gap: 4 }}
            >
              {filteredOptions.length === 0 ? (
                <Typography.Text
                  type="secondary"
                  size="small"
                  style={{ display: "block", width: "100%" }}
                >
                  {noOptionsMessage}
                </Typography.Text>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    onMouseEnter={() => setHoveredOptionValue(option.value)}
                    onMouseLeave={() => setHoveredOptionValue(undefined)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      borderRadius: 10,
                      border:
                        value === option.value
                          ? "1px solid var(--text-accent)"
                          : "1px solid transparent",
                      backgroundColor:
                        value === option.value
                          ? "rgba(255, 196, 2, 0.16)"
                          : hoveredOptionValue === option.value
                            ? "rgba(255, 196, 2, 0.08)"
                          : "transparent",
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <Typography.Text
                      style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                    >
                      {option.label}
                    </Typography.Text>
                  </button>
                ))
              )}
            </Box>
          </Box>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

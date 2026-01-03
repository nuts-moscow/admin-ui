"use client";

import { FC } from "react";
import { Input } from "@/components/Input/Input";
import { Search, X } from "lucide-react";
import { Control } from "../Form/FormControlView";

export type SearchInputProps = Control<string>;

export const SearchInput: FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={"Поиск"}
        leftAdornment={
          value ? (
            <X size={20} onClick={() => onChange?.("")} />
          ) : (
            <Search size={20} />
          )
        }
        rounded
      />
    </>
  );
};

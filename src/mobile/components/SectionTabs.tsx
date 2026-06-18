"use client";

import { clsx } from "clsx";
import { sectionTabsCls, sectionTabCls, sectionTabActiveCls } from "../mobile.css";

export interface SectionTab {
  readonly key: string;
  readonly title: string;
}

export interface SectionTabsProps {
  readonly tabs: readonly SectionTab[];
  readonly active: string;
  readonly onChange: (key: string) => void;
}

/** Горизонтально-скроллируемые чипы для переключения разделов. */
export function SectionTabs({ tabs, active, onChange }: SectionTabsProps) {
  return (
    <div className={sectionTabsCls} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          className={clsx(
            sectionTabCls,
            tab.key === active && sectionTabActiveCls,
          )}
          onClick={() => onChange(tab.key)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
}

import * as React from "react";

interface TabItem {
  label: string;
  content: React.ReactNode;
}

export function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div className="w-full">
      <div className="flex border-b border-border mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveIndex(idx)}
            className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
              idx === activeIndex
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-md bg-muted/50">{tabs[activeIndex].content}</div>
    </div>
  );
}

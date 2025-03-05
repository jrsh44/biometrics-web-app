import { useState } from "react";

type TTab = {
  tabId: string;
  label: string;
  content: React.ReactNode;
};

interface ITabsProps {
  initialTab?: string;
  tabs: TTab[];
}

export const Tabs = (props: ITabsProps) => {
  const [activeTab, setActiveTab] = useState(props.initialTab || props.tabs[0].tabId);

  return (
    <div>
      <div className="flex w-full">
        {props.tabs.map((tab) => (
          <button
            key={tab.tabId}
            className={`
                w-full border-b-4 p-4 cursor-pointer font-semibold
                ${tab.tabId === activeTab ? "border-b-slate-200 text-slate-200" : "border-b-slate-600 text-slate-600"} 
                hover:border-b-slate-400 hover:text-slate-400 hover:bg-neutral-800
                `}
            onClick={() => setActiveTab(tab.tabId)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {props.tabs.find((tab) => tab.tabId === activeTab)?.content}
    </div>
  );
};

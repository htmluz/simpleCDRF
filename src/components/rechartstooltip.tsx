import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export const CustomGraphTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    label = new Date(label / 1000000).toLocaleString();
    return (
      <div className="rounded-lg bg-neutral-50 dark:bg-black p-2">
        <p className="font-mono text-sm">{label}</p>
        <div>
          {payload.map((pld) => (
            <div key={pld.name} className="flex space-x-1 font-mono text-sm">
              <p style={{ color: pld.color }}>{pld.value}</p>
              <p style={{ color: "gray" }}>{pld.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

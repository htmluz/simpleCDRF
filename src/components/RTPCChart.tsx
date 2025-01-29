import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RTCPDataPoint } from "@/hooks/useRTCPData";

interface RTCPChartProps {
  data: RTCPDataPoint[];
  title: string;
  description: string;
  dataKeys: string[];
  dataNames: string[];
  yAxisDomain?: [number, number];
}

export function RTCPChart({
  data,
  title,
  description,
  dataKeys,
  dataNames,
  yAxisDomain,
}: RTCPChartProps) {
  const flowCount = Math.max(...data.map((d) => d.flowIndex)) + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={Object.fromEntries(
            dataKeys.map((key, index) => [
              key,
              {
                label: dataNames[index],
                color: `hsl(${(index * 360) / dataKeys.length}, 70%, 50%)`,
              },
            ])
          )}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) =>
                  new Date(tick / 1000000).toLocaleTimeString()
                }
                fontSize={10}
              />
              <YAxis domain={yAxisDomain} fontSize={10} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      typeof value === "number" ? value.toFixed(2) : value,
                      name,
                    ]}
                  />
                }
              />
              <Legend />
              {Array.from({ length: flowCount }).map((_, flowIndex) =>
                dataKeys.map((dataKey, keyIndex) => (
                  <Line
                    key={`${flowIndex}-${dataKey}`}
                    type="monotone"
                    // dataKey={(dataPoint: RTCPDataPoint) =>
                    //   dataPoint.flowIndex === flowIndex
                    //     ? dataPoint.data[dataKey]
                    //     : null
                    // }
                    name={`${dataNames[keyIndex]} (Flow ${flowIndex})`}
                    stroke={`var(--color-${dataKey})`}
                    connectNulls
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

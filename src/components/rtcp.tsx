"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HomerRTCPFlows } from "@/models/bilhetes";

interface RTCPVisualizerProps {
  flows: HomerRTCPFlows[];
}

export function RTCPVisualizer({ flows }: RTCPVisualizerProps) {
  const chartData = useMemo(() => {
    const data: Array<{
      timestamp: number;
      fractionLost: number;
      jitter: number;
      roundTripDelay?: number;
    }> = [];

    flows.forEach((flow) => {
      flow.messages.forEach((message) => {
        const timestamp = new Date(message.create_date).getTime();
        const reportBlock = message.raw.report_blocks[0];
        const xr = message.raw.report_blocks_xr;

        data.push({
          timestamp,
          fractionLost: reportBlock?.fraction_lost || 0,
          jitter: reportBlock?.ia_jitter || 0,
          roundTripDelay: xr?.round_trip_delay,
        });
      });
    });
    console.log(data);

    return data.sort((a, b) => a.timestamp - b.timestamp);
  }, [flows]);

  return (
    <div className="">
      <h1 className="font-mono font-bold mb-2">Métricas RTCP</h1>
      <div className="flex font-mono text-sm rounded-lg border mb-4 p-2 space-x-4">
        {flows.map((flow) => (
          <div key={flow.src_ip}>
            <p>
              <b>Src IP:</b> {flow.src_ip}
            </p>
            <p>
              <b>Dst IP: </b>
              {flow.dst_ip}
            </p>
          </div>
        ))}
      </div>
      <div className="flex-col columns-2">
        <Card>
          <CardHeader className="p-2">
            <CardTitle>Métricas RTCP</CardTitle>
            <CardDescription>
              Showing packet loss and jitter metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) =>
                      new Date(timestamp).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(timestamp) =>
                      new Date(timestamp).toLocaleString()
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="fractionLost"
                    stroke="#8884d8"
                    name="Packet Loss"
                  />
                  <Line
                    type="monotone"
                    dataKey="jitter"
                    stroke="#82ca9d"
                    name="Jitter"
                  />
                  <Line
                    type="monotone"
                    dataKey="roundTripDelay"
                    stroke="#ffc658"
                    name="Round Trip Delay"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

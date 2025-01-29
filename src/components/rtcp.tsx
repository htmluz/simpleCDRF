import type React from "react";
import type { HomerRTCPFlows } from "@/models/bilhetes";
import { useRTCPData } from "@/hooks/useRTCPData";
import { RTCPChart } from "@/components/RTPCChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RTCPChartsProps {
  flows: HomerRTCPFlows[];
}

export const RTCPCharts: React.FC<RTCPChartsProps> = ({ flows }) => {
  const parsedData = useRTCPData(flows);

  return (
    <div className="space-y-6 cursor-default overflow-y-auto max-h-[100vh] py-4">
      <Card>
        <CardHeader>
          <CardTitle>Flow Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-x-4 justify-evenly">
            {flows.map((flow, index) => (
              <div key={index}>
                <p>
                  <b>Flow {index + 1}:</b>
                </p>
                <p>
                  <b>Src: </b> {flow.src_ip} <br />
                  <b>Dst: </b> {flow.dst_ip}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <RTCPChart
        data={parsedData}
        title="Mean Opinion Score (MOS)"
        description="Quality of the call based on various factors"
        dataKeys={["mos"]}
        dataNames={["MOS"]}
        yAxisDomain={[1, 5]}
      />

      <RTCPChart
        data={parsedData}
        title="Latency and Synchronization"
        description="DLSR measures the time elapsed since the last RTCP report was received"
        dataKeys={["data.report_blocks[0].dlsr"]}
        dataNames={["DLSR"]}
      />

      <RTCPChart
        data={parsedData}
        title="Sending Performance"
        description="Packets and octets sent during the call"
        dataKeys={[
          "data.sender_information.packets",
          "data.sender_information.octets",
        ]}
        dataNames={["Packets", "Octets"]}
      />

      <RTCPChart
        data={parsedData}
        title="RTP Stability"
        description="Gap and Burst durations during the call"
        dataKeys={[
          "data.report_blocks_xr.gap_duration",
          "data.report_blocks_xr.burst_duration",
        ]}
        dataNames={["Gap Duration", "Burst Duration"]}
      />

      <RTCPChart
        data={parsedData}
        title="Connection Quality"
        description="Packet loss, jitter, and round-trip time"
        dataKeys={[
          "data.report_blocks[0].fraction_lost",
          "data.report_blocks[0].ia_jitter",
          "data.report_blocks_xr.round_trip_delay",
        ]}
        dataNames={["Packet Loss", "Jitter", "RTT"]}
      />
    </div>
  );
};

export default RTCPCharts;

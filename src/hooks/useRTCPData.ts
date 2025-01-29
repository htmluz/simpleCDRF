import { useState, useEffect } from "react";
import type { HomerRTCPFlows, HomerRTCPMessages } from "@/models/bilhetes";

export interface RTCPDataPoint {
  timestamp: number;
  data: HomerRTCPMessages["raw"];
  flowIndex: number;
  mos: number | null;
}

export function useRTCPData(flows: HomerRTCPFlows[]) {
  const [parsedData, setParsedData] = useState<RTCPDataPoint[]>([]);

  useEffect(() => {
    const parseData = (flows: HomerRTCPFlows[]): RTCPDataPoint[] => {
      return flows
        .flatMap((flow, flowIndex) =>
          flow.messages.map((message) => ({
            timestamp: new Date(message.create_date).getTime() * 1000000,
            data: message.raw,
            flowIndex,
            mos: calculateMOS(message.raw),
          }))
        )
        .sort((a, b) => a.timestamp - b.timestamp);
    };

    setParsedData(parseData(flows));
  }, [flows]);

  return parsedData;
}

function calculateMOS(data: HomerRTCPMessages["raw"]): number | null {
  if (
    !data.report_blocks ||
    data.report_blocks.length === 0 ||
    !data.report_blocks_xr
  ) {
    console.warn("Dados insuficientes para calcular MOS", data);
    return null;
  }

  const delay = data.report_blocks_xr.round_trip_delay || 0;
  const packetLoss = (data.report_blocks[0].fraction_lost || 0) * 100; // to %
  const jitter = data.report_blocks[0].ia_jitter || 0;

  const Rq = 93.2;
  const Id =
    0.024 * delay + 0.11 * (delay - 177.3) * Math.max(0, delay - 177.3);
  const Ie = 30 * Math.log(1 + 15 * packetLoss);
  const BurstR = (data.report_blocks_xr.burst_density || 0) / 100; // burst_density em % ja

  const Ieff =
    packetLoss + BurstR === 0
      ? Ie
      : Ie + ((95 - Ie) * packetLoss) / (packetLoss + BurstR);

  let R = Rq - Id - Ieff + 0.1 * (Rq - Id - Ieff) * (15 - Ieff);
  R = Math.max(0, Math.min(100, R));

  if (R < 0) return 1;
  if (R > 100) return 4.5;
  return 1 + 0.035 * R + R * (R - 60) * (100 - R) * 7e-6;
}

interface ReportBlock {
  source_ssrc: number;
  fraction_lost: number;
  packets_lost: number;
  highest_seq_no: number;
  ia_jitter: number;
  lsr: number;
  dlsr: number;
}

interface ReportBlockXR {
  type: number;
  id: number;
  fraction_lost: number;
  fraction_discard: number;
  burst_density: number;
  gap_density: number;
  burst_duration: number;
  gap_duration: number;
  round_trip_delay: number;
  end_system_delay: number;
}

interface SenderInformation {
  ntp_timestamp_sec: number;
  ntp_timestamp_usec: number;
  octets: number;
  packets: number;
  rtp_timestamp: number;
}

interface ParsedRTCPData {
  cid: string;
  report_blocks: ReportBlock[];
  report_blocks_xr: ReportBlockXR;
  report_count: number;
  sdes_ssrc: number;
  sender_information: SenderInformation;
  ssrc: number;
  type: number;
}

interface RTCPDataPoint {
  timestamp: number;
  data: ParsedRTCPData;
}

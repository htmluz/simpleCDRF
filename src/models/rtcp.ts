interface ReportBlock {
  dlsr: number;
  fraction_lost: number;
  highest_seq_no: number;
  ia_jitter: number;
  lsr: number;
  packets_lost: number;
  source_ssrc: number;
}

interface ReportBlockXR {
  burst_density: number;
  burst_duration: number;
  end_system_delay: number;
  fraction_discard: number;
  fraction_lost: number;
  gap_density: number;
  gap_duration: number;
  id: number;
  round_trip_delay: number;
  type: number;
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

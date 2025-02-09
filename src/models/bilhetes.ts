export interface CallRecord {
  "Acct-Session-Id": string;
  "Acct-Session-Time": string;
  "Acct-Session-Type": string;
  "Called-Station-Id": string;
  "Calling-Station-Id": string;
  "Cisco-NAS-Port": string;
  Codec: string;
  "Local-RTP-IP": string;
  "Local-RTP-Port": string;
  "Local-SIP-IP": string;
  "Local-SIP-Port": string;
  "MOS-Egress": string;
  "MOS-Ingress": string;
  "NAS-IP-Address": string;
  "NAS-Identifier": string;
  Protocol: string;
  "Remote-RTP-IP": string;
  "Remote-RTP-Port": string;
  "Remote-SIP-IP": string;
  "Remote-SIP-Port": string;
  "Ring-Start": string;
  "User-Name": string; //NapA
  "call-id": string;
  "h323-call-origin": string;
  "h323-call-type": string;
  "h323-connect-time": string;
  "h323-disconnect-cause": string;
  "h323-disconnect-time": string;
  "h323-setup-time": string;
  "release-source": string;
  "Gw-Name": string;
}

export interface HomerCallMessages {
  //deprecated
  stream: HomerStream;
  values: string[][];
}

export interface HomerStream {
  //deprecated
  dst_ip: string;
  dst_port: string;
  hostname: string;
  call_id: string;
  from: string;
  to: string;
  job: string;
  method: string;
  node: string;
  protocol: string;
  response: string;
  src_ip: string;
  src_port: string;
  type: string;
}

export interface HomerCallInfo {
  ruri_user: string;
  ruri_domain: string;
  from_user: string;
  from_tag: string;
  to_user: string;
  callid: string;
  cseq: string;
  method: string;
  user_agent: string;
}

export interface HomerCall {
  sid: string;
  brief_call_info: HomerCallInfo;
  start_time: string;
  end_time: string;
}

export interface HomerPcapData {
  call_id: string;
  messages: (HomerSIPMessages | HomerRTCPFlows | HomerRTPFlows)[];
}

export interface HomerSIPMessages {
  create_date: string;
  protocol_header: HomerProtocolHeader;
  data_header: HomerCallInfo;
  raw: string;
  type: "sip";
}

export interface HomerRTCPFlows {
  type: "rtcp_flow";
  src_ip: string;
  dst_ip: string;
  messages: HomerRTCPMessages[];
}

export interface HomerRTCPMessages {
  create_date: string;
  protocol_header: HomerProtocolHeader;
  data_header: HomerRTCPDataHeader;
  raw: HomerRTCPRaw;
  type: "rtcp";
}

export interface HomerRTPFlows {
  type: "rtp_flow";
  src_ip: string;
  dst_ip: string;
  messages: HomerRTPMessages[];
}

export interface HomerRTPMessages {
  create_date: string;
  protocol_header: HomerProtocolHeader;
  data_header: HomerRTPDataHeader;
  raw: number[];
  type: "rtp";
}

export interface HomerProtocolHeader {
  protocolFamily: number;
  protocol: number;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  timeSeconds: number;
  timeUseconds: number;
  payloadType: number;
  captureId: string;
  correlation_id: string;
}

export interface HomerRTCPDataHeader {
  node: string;
  proto: string;
}

export interface HomerRTPDataHeader {
  CC: string;
  Ssrc: string;
  node: string;
  Marker: string;
  Padding: string;
  Version: string;
  Extension: string;
  Timestamp: string;
  PayloadType: string;
  SequenceNumber: string;
}

export interface HomerRTCPRaw {
  sender_information: SenderInformation;
  ssrc: number;
  type: number;
  report_count: number;
  report_blocks: ReportBlock[];
  report_blocks_xr: ReportBlockXR;
  sdes_ssrc: number;
}

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

export interface CallRecordFull {
  Bid: string;
  LegA: CallRecord;
  LegB: CallRecord;
}

export interface HomerCallMessages {
  stream: HomerStream;
  values: string[][];
}

export interface HomerStream {
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

export interface HomerCall {
  call_id: string;
  end_time: string;
  start_time: string;
  to_number: string;
  from_number: string;
  messages: HomerCallMessages[];
}

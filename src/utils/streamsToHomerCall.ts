import { HomerCall, HomerCallMessages } from "@/models/bilhetes";

export const streamsToHomerCalls = (
  streams: HomerCallMessages[]
): HomerCall => {
  const firstStream = streams[0].stream;
  const homerCall: HomerCall = {
    call_id: firstStream.call_id,
    end_time: "",
    start_time: "",
    to_number: "",
    from_number: "",
    messages: streams,
  };

  return homerCall;
};

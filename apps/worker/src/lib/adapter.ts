import type { NormalizedFeedStaging, NormalizedSecurityStaging } from "@devradar/types";

export interface FeedSourceAdapter {
  key: string;
  fetch(): Promise<NormalizedFeedStaging[]>;
}

export interface SecuritySourceAdapter {
  key: string;
  fetch(): Promise<NormalizedSecurityStaging[]>;
}

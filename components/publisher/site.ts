export interface Site {
  id: number;
  name: string;
  url: string;
  host: string;
  status: string;
  verification_token: string;
  verified_at: string | null;
  review_reason: string | null;
  ad_units_count?: number;
  active_ad_units_count?: number;
  impressions_count?: number;
  clicks_count?: number;
  last_seen_at?: string | null;
}
/** Ads run only on an approved site whose ownership is verified. */
export function isLive(site: Site) {
  return site.status === "approved" && !!site.verified_at;
}

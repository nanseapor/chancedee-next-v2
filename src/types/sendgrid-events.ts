export interface SendGridEvent {
  email: string;
  timestamp: number;
  event:
    | "processed"
    | "dropped"
    | "delivered"
    | "deferred"
    | "bounce"
    | "open"
    | "click"
    | "spam report"
    | "unsubscribe"
    | "group unsubscribe"
    | "group resubscribe";
  "smtp-id": string;
  useragent?: string;
  ip?: string;
  sg_event_id: string;
  sg_message_id: string;
  reason?: string;
  status?: string;
  response?: string;
  tls?: boolean;
  url?: string;
  url_offset?: {
    [key: string]: number;
  };
  attempt?: number;
  category?: string | string[];
  type?:
    | "bounce"
    | "blocked"
    | "compliance_suspend"
    | "compliance_deactivate"
    | "compliance_ban"
    | "reactivate";
  sg_machine_open?: boolean;
  bounce_classification?: string;
}

export interface AccountStatusChangeEvent extends SendGridEvent {
  type:
    | "compliance_suspend"
    | "compliance_deactivate"
    | "compliance_ban"
    | "reactivate";
}

export interface BounceEvent extends SendGridEvent {
  type: "bounce" | "blocked";
}

export type SendGridWebhookData = SendGridEvent[];

export interface NodeTemplate {
  id: string;
  label: string;
  title: string;
  color: string;
  rows: Array<{
    id: string;
    c_metric: string;
    c_tool: string;
    c_past: string;
    c_curr: string;
  }>;
}

export const NODE_TEMPLATES: Record<string, NodeTemplate> = {
  organic_search: {
    id: 'organic_search',
    label: 'Organic Search',
    title: 'Organic Search',
    color: 'bg-emerald-600',
    rows: [
      { id: 'r1', c_metric: 'Avg. Position', c_tool: 'Search Console', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'CTR', c_tool: 'Search Console', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'Clicks', c_tool: 'Search Console', c_past: '', c_curr: '' },
      { id: 'r4', c_metric: 'Impressions', c_tool: 'Search Console', c_past: '', c_curr: '' },
    ]
  },
  paid_search: {
    id: 'paid_search',
    label: 'Paid Search Ads',
    title: 'Paid Search Ads',
    color: 'bg-amber-600',
    rows: [
      { id: 'r1', c_metric: 'Spend', c_tool: 'Google Ads', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'Impressions', c_tool: 'Google Ads', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'Clicks', c_tool: 'Google Ads', c_past: '', c_curr: '' },
      { id: 'r4', c_metric: 'CPC', c_tool: 'Google Ads', c_past: '', c_curr: '' },
      { id: 'r5', c_metric: 'Conversions', c_tool: 'Google Ads', c_past: '', c_curr: '' },
    ]
  },
  paid_social: {
    id: 'paid_social',
    label: 'Paid Social Ads',
    title: 'Paid Social Ad',
    color: 'bg-purple-600',
    rows: [
      { id: 'r1', c_metric: 'Spend', c_tool: 'Facebook Ads', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'Impressions', c_tool: 'Facebook Ads', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'CPC', c_tool: 'Facebook Ads', c_past: '', c_curr: '' },
      { id: 'r4', c_metric: 'Conversions', c_tool: 'Facebook Ads', c_past: '', c_curr: '' },
    ]
  },
  landing_page: {
    id: 'landing_page',
    label: 'Landing Page',
    title: 'Landing Page',
    color: 'bg-blue-600',
    rows: [
      { id: 'r1', c_metric: 'Bounce Rate', c_tool: 'Google Analytics', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'CTA Clicks', c_tool: 'Google Analytics', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'Avg. Scroll Depth', c_tool: 'Google Analytics', c_past: '', c_curr: '' },
    ]
  },
  gated_content: {
    id: 'gated_content',
    label: 'Gated Content LP',
    title: 'Gated Content LP',
    color: 'bg-slate-800',
    rows: [
      { id: 'r1', c_metric: 'Views', c_tool: 'Google Analytics', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'Signups', c_tool: 'HubSpot', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'Conversion Rate', c_tool: 'HubSpot', c_past: '', c_curr: '' },
      { id: 'r4', c_metric: 'MQLs', c_tool: 'HubSpot', c_past: '', c_curr: '' },
    ]
  },
  product_page: {
    id: 'product_page',
    label: 'Product Page',
    title: 'Product Page',
    color: 'bg-blue-800',
    rows: [
      { id: 'r1', c_metric: 'Page Views', c_tool: 'Google Analytics', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'Add to Cart', c_tool: 'Shopify', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'Buy Now Clicks', c_tool: 'Shopify', c_past: '', c_curr: '' },
      { id: 'r4', c_metric: 'Bounce Rate', c_tool: 'Google Analytics', c_past: '', c_curr: '' },
    ]
  },
  email_campaign: {
    id: 'email_campaign',
    label: 'Email Campaign',
    title: 'Email Campaign',
    color: 'bg-indigo-600',
    rows: [
      { id: 'r1', c_metric: 'Open Rate', c_tool: 'Klaviyo', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'Click Rate', c_tool: 'Klaviyo', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'Unsubscribes', c_tool: 'Klaviyo', c_past: '', c_curr: '' },
      { id: 'r4', c_metric: 'Conversions', c_tool: 'Klaviyo', c_past: '', c_curr: '' },
    ]
  },
  ecommerce_checkout: {
    id: 'ecommerce_checkout',
    label: 'Checkout',
    title: 'Checkout',
    color: 'bg-rose-600',
    rows: [
      { id: 'r1', c_metric: 'Add to Cart', c_tool: 'Shopify', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: 'Abandonment Rate', c_tool: 'Shopify', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: 'Purchases', c_tool: 'Shopify', c_past: '', c_curr: '' },
      { id: 'r4', c_metric: 'Revenue', c_tool: 'Shopify', c_past: '', c_curr: '' },
    ]
  },
};

// AWS region data matching terraform-databricks-sra/aws/tf/variables.tf

export const AWS_REGIONS: { value: string; label: string }[] = [
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo) - ap-northeast-1' },
  { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul) - ap-northeast-2' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai) - ap-south-1' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore) - ap-southeast-1' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney) - ap-southeast-2' },
  { value: 'ap-southeast-3', label: 'Asia Pacific (Jakarta) - ap-southeast-3' },
  { value: 'ca-central-1', label: 'Canada (Central) - ca-central-1' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt) - eu-central-1' },
  { value: 'eu-west-1', label: 'Europe (Ireland) - eu-west-1' },
  { value: 'eu-west-2', label: 'Europe (London) - eu-west-2' },
  { value: 'eu-west-3', label: 'Europe (Paris) - eu-west-3' },
  { value: 'sa-east-1', label: 'South America (Sao Paulo) - sa-east-1' },
  { value: 'us-east-1', label: 'US East (N. Virginia) - us-east-1' },
  { value: 'us-east-2', label: 'US East (Ohio) - us-east-2' },
  { value: 'us-west-1', label: 'US West (N. California) - us-west-1' },
  { value: 'us-west-2', label: 'US West (Oregon) - us-west-2' },
  { value: 'us-gov-west-1', label: 'AWS GovCloud (US-West) - us-gov-west-1' },
];

export const AWS_GOV_REGIONS = ['us-gov-west-1'];

export function isGovCloudRegion(region: string): boolean {
  return AWS_GOV_REGIONS.includes(region);
}

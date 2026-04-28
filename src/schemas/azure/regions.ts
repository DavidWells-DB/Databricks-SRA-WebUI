// Azure region data - common Azure regions for SRA deployments

export const AZURE_REGIONS: { value: string; label: string }[] = [
  // US regions
  { value: 'eastus', label: 'East US - eastus' },
  { value: 'eastus2', label: 'East US 2 - eastus2' },
  { value: 'westus', label: 'West US - westus' },
  { value: 'westus2', label: 'West US 2 - westus2' },
  { value: 'westus3', label: 'West US 3 - westus3' },
  { value: 'centralus', label: 'Central US - centralus' },
  { value: 'northcentralus', label: 'North Central US - northcentralus' },
  { value: 'southcentralus', label: 'South Central US - southcentralus' },
  { value: 'westcentralus', label: 'West Central US - westcentralus' },

  // Canada
  { value: 'canadacentral', label: 'Canada Central - canadacentral' },
  { value: 'canadaeast', label: 'Canada East - canadaeast' },

  // Europe
  { value: 'northeurope', label: 'North Europe (Ireland) - northeurope' },
  { value: 'westeurope', label: 'West Europe (Netherlands) - westeurope' },
  { value: 'uksouth', label: 'UK South - uksouth' },
  { value: 'ukwest', label: 'UK West - ukwest' },
  { value: 'francecentral', label: 'France Central - francecentral' },
  { value: 'germanywestcentral', label: 'Germany West Central - germanywestcentral' },
  { value: 'switzerlandnorth', label: 'Switzerland North - switzerlandnorth' },
  { value: 'norwayeast', label: 'Norway East - norwayeast' },
  { value: 'swedencentral', label: 'Sweden Central - swedencentral' },

  // Asia Pacific
  { value: 'australiaeast', label: 'Australia East - australiaeast' },
  { value: 'australiasoutheast', label: 'Australia Southeast - australiasoutheast' },
  { value: 'japaneast', label: 'Japan East - japaneast' },
  { value: 'japanwest', label: 'Japan West - japanwest' },
  { value: 'southeastasia', label: 'Southeast Asia (Singapore) - southeastasia' },
  { value: 'eastasia', label: 'East Asia (Hong Kong) - eastasia' },
  { value: 'koreacentral', label: 'Korea Central - koreacentral' },

  // South America
  { value: 'brazilsouth', label: 'Brazil South - brazilsouth' },

  // Africa
  { value: 'southafricanorth', label: 'South Africa North - southafricanorth' },

  // Middle East
  { value: 'uaenorth', label: 'UAE North - uaenorth' },
];

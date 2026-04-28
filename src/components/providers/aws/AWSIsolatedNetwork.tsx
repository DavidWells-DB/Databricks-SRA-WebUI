import { useState, useEffect, useMemo } from 'react';
import { useConfig } from '../../../context/ConfigContext';
import { awsSchema } from '../../../schemas/aws/variables';
import { parseCidr, calculateAwsSubnetsWithMask } from '../../../lib/cidr/calculator';
import { isValidCidr } from '../../../lib/cidr/validator';
import CidrInput from '../../common/CidrInput';
import SubnetSizeSlider from '../../common/SubnetSizeSlider';
import SubnetAllocationCard from '../../common/SubnetAllocationCard';
import ListEditor from '../../common/ListEditor';
import SubnetVisualizer from '../../network/SubnetVisualizer';
import SecurityRulesDisplay from '../../network/SecurityRulesDisplay';

const DEFAULT_EGRESS_PORTS = [
  '443', '2443', '5432', '6666', '8443', '8444',
  '8445', '8446', '8447', '8448', '8449', '8450', '8451',
];

function getVariable(name: string) {
  return awsSchema.variables.find((v) => v.name === name);
}

export default function AWSIsolatedNetwork() {
  const { setField, getFieldValue } = useConfig();

  const vpcCidr = (getFieldValue('vpc_cidr_range') as string) || '10.0.0.0/18';
  const privateSubnets = (getFieldValue('private_subnets_cidr') as string[]) || [];
  const privatelinkSubnets = (getFieldValue('privatelink_subnets_cidr') as string[]) || [];
  const egressPorts = (getFieldValue('sg_egress_ports') as string[]) || DEFAULT_EGRESS_PORTS;

  const vpcPrefix = useMemo(() => {
    if (isValidCidr(vpcCidr)) return parseCidr(vpcCidr).prefixLength;
    return 18;
  }, [vpcCidr]);

  const [privatePrefix, setPrivatePrefix] = useState(vpcPrefix + 4);
  const [plPrefix, setPlPrefix] = useState(vpcPrefix + 8);

  // Set defaults on mount
  useEffect(() => {
    if (!getFieldValue('vpc_cidr_range')) {
      setField('vpc_cidr_range', '10.0.0.0/18');
    }
    if (!getFieldValue('sg_egress_ports')) {
      setField('sg_egress_ports', DEFAULT_EGRESS_PORTS);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track whether subnets fit in VPC
  const [subnetsFit, setSubnetsFit] = useState(true);

  // Recalculate helper
  const recalculate = (cidr: string, privPfx: number, plPfx: number) => {
    if (!isValidCidr(cidr)) return;
    const result = calculateAwsSubnetsWithMask(cidr, privPfx, plPfx);
    setSubnetsFit(result.fits);
    setField('private_subnets_cidr', result.privateSubnets);
    setField('privatelink_subnets_cidr', result.privatelinkSubnets);
  };

  // When VPC CIDR changes: reset masks to defaults and recalculate
  useEffect(() => {
    if (isValidCidr(vpcCidr)) {
      const newVpcPrefix = parseCidr(vpcCidr).prefixLength;
      const newPrivatePrefix = Math.min(newVpcPrefix + 4, 28);
      const newPlPrefix = Math.min(newVpcPrefix + 8, 28);
      setPrivatePrefix(newPrivatePrefix);
      setPlPrefix(newPlPrefix);
      recalculate(vpcCidr, newPrivatePrefix, newPlPrefix);
    }
  }, [vpcCidr]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrivatePrefixChange = (newPrefix: number) => {
    setPrivatePrefix(newPrefix);
    recalculate(vpcCidr, newPrefix, plPrefix);
  };

  const handlePlPrefixChange = (newPrefix: number) => {
    setPlPrefix(newPrefix);
    recalculate(vpcCidr, privatePrefix, newPrefix);
  };

  const vpcVar = getVariable('vpc_cidr_range');

  // Visualizer
  const visualizerSubnets = [
    ...privateSubnets.map((cidr, i) => ({
      label: `Workspace ${i + 1}`,
      cidr,
      color: '#3b82f6',
    })),
    ...privatelinkSubnets.map((cidr, i) => ({
      label: `PL Endpoint ${i + 1}`,
      cidr,
      color: '#8b5cf6',
    })),
  ];

  return (
    <div className="space-y-6">
      {/* VPC CIDR */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-1">
        <label className="block text-sm font-semibold text-[var(--color-text)]">
          {vpcVar?.ui.label ?? 'VPC CIDR Range'}
          <span className="ml-0.5 text-[var(--color-error)]">*</span>
        </label>
        {vpcVar?.ui.helpText && (
          <p className="text-xs text-[var(--color-text-secondary)] mb-2">
            {vpcVar.ui.helpText}
          </p>
        )}
        <CidrInput
          value={vpcCidr}
          onChange={(val) => setField('vpc_cidr_range', val)}
          placeholder="10.0.0.0/18"
        />
      </div>

      {/* Security Group Rules */}
      <SecurityRulesDisplay provider="aws" />

      {/* Workspace Subnets (private) */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Workspace Subnets
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-medium">Compute Plane</span>
        </div>

        <SubnetSizeSlider
          value={privatePrefix}
          onChange={handlePrivatePrefixChange}
          minPrefix={vpcPrefix + 1}
          maxPrefix={28}
          label="Subnet Size"
        />

        {/* Calculated Subnet Allocation */}
        <div>
          <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            Calculated Subnet Allocation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {privateSubnets.map((cidr, i) => (
              <SubnetAllocationCard
                key={i}
                name={`workspace-subnet-${i + 1}`}
                cidr={cidr}
                type="WORKSPACE"
                color="#3b82f6"
              />
            ))}
          </div>
        </div>
      </div>

      {/* PrivateLink Endpoint Subnets */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            PrivateLink Endpoint Subnets
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium">Control Plane</span>
        </div>

        <SubnetSizeSlider
          value={plPrefix}
          onChange={handlePlPrefixChange}
          minPrefix={vpcPrefix + 1}
          maxPrefix={28}
          label="Subnet Size"
        />

        <div>
          <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            Calculated Subnet Allocation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {privatelinkSubnets.map((cidr, i) => (
              <SubnetAllocationCard
                key={i}
                name={`privatelink-endpoint-${i + 1}`}
                cidr={cidr}
                type="ENDPOINT"
                color="#8b5cf6"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Overlap warning */}
      {!subnetsFit && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--color-error)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[var(--color-error)]">Subnets exceed VPC capacity</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              The combined size of {3} workspace subnets (/{privatePrefix}) and {3} PrivateLink endpoint subnets (/{plPrefix}) exceeds the VPC /{vpcPrefix} address space.
              Increase the VPC CIDR prefix or use smaller subnets.
            </p>
          </div>
        </div>
      )}

      {/* Subnet Visualizer */}
      {subnetsFit && isValidCidr(vpcCidr) && visualizerSubnets.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h4 className="mb-3 text-sm font-medium text-[var(--color-text)]">
            Subnet Layout
          </h4>
          <SubnetVisualizer vpcCidr={vpcCidr} subnets={visualizerSubnets} />
        </div>
      )}

      {/* Configurable TCP Egress Ports */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-text)]">
          TCP Egress Ports to VPC CIDR
        </h3>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          TCP ports for Databricks control plane services: REST API (443), Secure Cluster Connectivity (2443/6666),
          Lakebase PostgreSQL (5432), internal calls (8443), UC logging &amp; lineage (8444), future use (8445–8451).
          Port 6666 is automatically excluded in GovCloud deployments.
        </p>
        <ListEditor
          value={egressPorts}
          onChange={(val) => setField('sg_egress_ports', val)}
          placeholder="Enter TCP port number"
        />
      </div>
    </div>
  );
}

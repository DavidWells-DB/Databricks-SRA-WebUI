import { useConfig } from '../../context/useConfig';
import WizardNavigation from './WizardNavigation';
import AWSIsolatedNetwork from '../providers/aws/AWSIsolatedNetwork';
import AWSCustomNetwork from '../providers/aws/AWSCustomNetwork';
import AzureFullSRANetwork from '../providers/azure/AzureFullSRANetwork';
import AzureBYOHubNetwork from '../providers/azure/AzureBYOHubNetwork';
import AzureBYOSpokeNetwork from '../providers/azure/AzureBYOSpokeNetwork';
import GCPNewVpcNetwork from '../providers/gcp/GCPNewVpcNetwork';
import GCPExistingVpcNetwork from '../providers/gcp/GCPExistingVpcNetwork';

export default function Step3_Network() {
  const { state, completeStep } = useConfig();
  const { provider, deploymentMode } = state;

  // Determine which network sub-component to show
  let content: React.ReactNode;

  if (provider === 'aws' && deploymentMode === 'isolated') {
    content = (
      <div className="space-y-6">
        <div className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text)]">Isolated Network:</span>{' '}
            The SRA creates a fully isolated VPC with zero outbound internet access. All
            connectivity uses back-end PrivateLink to the Databricks control plane and VPC
            endpoints (S3, STS, Kinesis) with restrictive policies. A Network Connectivity
            Configuration (NCC) and restrictive network policy are applied for serverless
            compute.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-[var(--color-warning)] mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Need outbound internet access?
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Isolated mode is zero-egress by design — workloads cannot reach the public
              internet, including third-party package mirrors, external APIs, and SaaS
              endpoints. To enable controlled egress, go back to{' '}
              <span className="font-semibold text-[var(--color-text)]">
                Step 1 → Deployment Mode
              </span>{' '}
              and choose{' '}
              <span className="font-semibold text-[var(--color-text)]">
                Custom Network (BYO VPC)
              </span>
              , then provide a pre-configured VPC with NAT/egress rules.
            </p>
          </div>
        </div>
        <AWSIsolatedNetwork />
      </div>
    );
  } else if (provider === 'aws' && deploymentMode === 'custom') {
    content = (
      <div className="space-y-6">
        <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text)]">Custom Network (BYO VPC):</span>{' '}
            Provide your existing VPC, subnets, security group, and PrivateLink endpoint IDs.
            Recommended when networking assets are created in different pipelines or pre-assigned
            by a centralized infrastructure team.
          </p>
        </div>
        <AWSCustomNetwork />
      </div>
    );
  } else if (provider === 'azure' && deploymentMode === 'full-sra') {
    content = <AzureFullSRANetwork />;
  } else if (provider === 'azure' && deploymentMode === 'byo-hub') {
    content = <AzureBYOHubNetwork />;
  } else if (provider === 'azure' && deploymentMode === 'byo-spoke') {
    content = <AzureBYOSpokeNetwork />;
  } else if (provider === 'gcp' && deploymentMode === 'new-vpc') {
    content = <GCPNewVpcNetwork />;
  } else if (provider === 'gcp' && deploymentMode === 'existing-vpc') {
    content = <GCPExistingVpcNetwork />;
  } else {
    content = (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-6 text-center text-[var(--color-text-secondary)]">
        Please select a provider and deployment mode first.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
        Network
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Configure the network topology for your Databricks workspace.
      </p>

      {content}

      <WizardNavigation
        backPath="/configure/account"
        continuePath="/configure/security"
        onContinue={() => completeStep('network')}
      />
    </div>
  );
}

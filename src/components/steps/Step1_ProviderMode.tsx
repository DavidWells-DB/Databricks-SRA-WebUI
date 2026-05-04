import { useConfig } from '../../context/useConfig';
import { awsSchema } from '../../schemas/aws/variables';
import { azureSchema } from '../../schemas/azure/variables';
import { gcpSchema } from '../../schemas/gcp/variables';
import type { Provider, DeploymentMode } from '../../schemas/types';
import WizardNavigation from './WizardNavigation';

const PROVIDERS = [
  {
    id: 'aws' as const,
    name: 'Amazon Web Services',
    shortName: 'AWS',
    color: '#FF9900',
    features: [
      'Isolated VPC with PrivateLink',
      '3 KMS keys (workspace, services, UC)',
      'Restrictive VPC endpoint policies',
      'GovCloud support',
    ],
  },
  {
    id: 'azure' as const,
    name: 'Microsoft Azure',
    shortName: 'Azure',
    color: '#0078D4',
    features: [
      'Hub-spoke VNets with Firewall',
      'Key Vault with CMK',
      'Zero-trust network egress',
      '3 deployment modes',
    ],
  },
  {
    id: 'gcp' as const,
    name: 'Google Cloud Platform',
    shortName: 'GCP',
    color: '#4285F4',
    features: [
      'VPC with Cloud NAT or PSC',
      'Cloud KMS (CMEK)',
      'Firewall network hardening',
      'Private Cloud DNS',
    ],
  },
];

function getModesForProvider(provider: Provider): DeploymentMode[] {
  if (provider === 'aws') return awsSchema.deploymentModes;
  if (provider === 'azure') return azureSchema.deploymentModes;
  if (provider === 'gcp') return gcpSchema.deploymentModes;
  return [];
}

export default function Step1_ProviderMode() {
  const { state, setProvider, setMode, completeStep } = useConfig();
  const { provider, deploymentMode } = state;

  const modes = provider ? getModesForProvider(provider) : [];
  const canContinue = provider !== null && deploymentMode !== null;

  const handleProviderChange = (p: Provider) => {
    setProvider(p);
    // Reset mode when provider changes
    if (p !== provider) {
      setMode('');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
        Provider &amp; Deployment Mode
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Choose your cloud provider and how you want to configure networking.
      </p>

      {/* Provider selection */}
      <fieldset className="mb-10">
        <legend className="text-sm font-semibold text-[var(--color-text)] mb-4">
          Cloud Provider
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PROVIDERS.map((p) => {
            const isSelected = provider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProviderChange(p.id)}
                className="provider-card relative text-left rounded-xl border bg-[var(--color-surface-secondary)] p-5 cursor-pointer"
                style={{
                  '--provider-color': p.color,
                  borderTop: `3px solid ${p.color}`,
                  borderColor: isSelected ? p.color : undefined,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${p.color}, 0 4px 12px rgba(0,0,0,0.1)`
                    : undefined,
                  ...(isSelected ? {} : { borderTopColor: p.color }),
                } as React.CSSProperties}
              >
                {/* Selected check indicator */}
                {isSelected && (
                  <span
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: p.color }}
                  >
                    {'\u2713'}
                  </span>
                )}

                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: p.color }}
                >
                  {p.shortName}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                  {p.name}
                </p>

                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                    >
                      <span
                        className="mt-0.5 shrink-0 text-xs"
                        style={{ color: p.color }}
                      >
                        {'\u2713'}
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Deployment mode selection */}
      {provider && modes.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--color-text)] mb-4">
            Deployment Mode
          </legend>
          <div className="grid grid-cols-1 gap-4">
            {modes.map((mode) => {
              const isSelected = deploymentMode === mode.id;
              const providerColor =
                PROVIDERS.find((p) => p.id === provider)?.color ??
                'var(--color-primary)';
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setMode(mode.id)}
                  className="relative text-left rounded-lg border bg-[var(--color-surface-secondary)] p-5 cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    borderColor: isSelected ? providerColor : undefined,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${providerColor}`
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom radio circle */}
                    <span
                      className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: isSelected
                          ? providerColor
                          : 'var(--color-border)',
                      }}
                    >
                      {isSelected && (
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: providerColor }}
                        />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {mode.label}
                    </span>
                    {mode.recommended && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="ml-8 mt-1 text-sm text-[var(--color-text-secondary)]">
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Show placeholder for providers with no modes */}
      {provider && modes.length === 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-6 text-center text-[var(--color-text-secondary)]">
          Support for this provider is coming soon.
        </div>
      )}

      <WizardNavigation
        continuePath="/configure/account"
        canContinue={canContinue}
        onContinue={() => completeStep('provider')}
      />
    </div>
  );
}

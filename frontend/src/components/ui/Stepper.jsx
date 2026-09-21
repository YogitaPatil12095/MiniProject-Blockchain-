import React from 'react';

/**
 * Presentational Stepper Component
 * Visual 3-step progress indicator for record creation flow.
 * @param {Object} props
 * @param {number} props.currentStep - Active step (1, 2, or 3)
 */
export function Stepper({ currentStep = 1, className = '' }) {
  const steps = [
    { number: 1, label: 'Upload to IPFS' },
    { number: 2, label: 'Confirm in wallet' },
    { number: 3, label: 'Recorded on-chain' },
  ];

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '24px',
    position: 'relative',
  };

  return (
    <div style={containerStyle} className={`stepper-container ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <React.Fragment key={step.number}>
            {/* Step Item */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isCompleted
                    ? 'var(--success)'
                    : isActive
                    ? 'var(--primary-600)'
                    : 'var(--border)',
                  color: isCompleted || isActive ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'var(--fw-semibold)',
                  fontSize: '14px',
                  transition: 'all var(--transition-normal)',
                }}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                style={{
                  fontSize: 'var(--fs-small)',
                  fontWeight: isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)',
                  color: isActive ? 'var(--primary-600)' : isCompleted ? 'var(--success)' : 'var(--text-muted)',
                  textAlign: 'center',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  height: '2px',
                  backgroundColor: step.number < currentStep ? 'var(--success)' : 'var(--border)',
                  flex: 1,
                  margin: '0 -16px 20px -16px',
                  zIndex: 1,
                  transition: 'background-color var(--transition-normal)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

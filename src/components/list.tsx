import React from 'react';
import styled from "styled-components";

// Option item – for attribute selections with images
export const OptionListItem = styled.li<{
  $selected?: boolean;
  $disabled?: boolean;
  $width?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  width: ${({ $width }) => $width || '200px'};
  border: 1px solid ${({ $selected }) => ($selected ? '#222' : '#ddd')};
  background-color: ${({ $selected }) => ($selected ? '#f3f3fa' : '#fff')};
  color: #000;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  gap: 16px;
  box-shadow: ${({ $selected }) => ($selected ? '0 0 0 2px black' : 'none')};
  transition: all 0.2s ease-in-out;
  outline: none;
  transform-style: preserve-3d;

  &:hover {
    ${({ $disabled }) => ($disabled ? 'transform: none; box-shadow: none; background-color: inherit;' : '')}
    background-color: #F2F2F3;
    border: 1px gray solid;
  }

  &:active {
    transform: translateY(0px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) and (orientation: portrait) {
    padding: 5px;
    margin: 0px;
    font-size: .75rem;
    flex-direction: row;
    justify-content: center;
    gap: 2px;
    width: auto;
  }
`;


export const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 36px;
  cursor: pointer;
  padding: 4px 12px;
  color: #333;
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: #000;
  }

  &:disabled {
    opacity: 0.2;
    cursor: default;
  }
`;


export const StepTitle = styled.h2`
  margin: 0 16px;
  text-align: center;
  flex-grow: 1;
  font-size: 18px;
  font-weight: 600;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;

  &::after {
    content: "";
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #000;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`; 

export const CartButton = styled.button`
  background-color: #000;
  color: #fff;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  transform-style: preserve-3d;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const RotateNotice = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  color: #000;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 20px;

  @media (max-width: 768px) and (orientation: portrait) {
    display: flex;
  }
`;

export const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;

  @supports (height: 100dvh) {
    min-height: 100dvh;
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  position: relative;
`;

export const Container = styled.div`
  height: 100%;
  overflow: auto;
  border-top: 6px solid black;
  padding: 24px;
  padding-top: calc(24px + var(--safe-top));
  padding-bottom: calc(24px + var(--safe-bottom));
  box-sizing: border-box;
  @media (max-width: 767px) {
    padding: 16px;
    padding-top: calc(16px + var(--safe-top));
    padding-bottom: calc(16px + var(--safe-bottom));
  }
`;


export const NotesWrapper = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: #F2F2F3;
  border: 1px gray solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  strong {
    display: block;
  }

  p {
    margin: 8px 0 0;
    color: #555;
  }

  @media (max-width: 767px) {
    margin-top: 0px;
    padding: 0px;
    height: 0;
    display:none;
  }
`;


export const CartBarContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 16px 16px 24px;
  border-top: 1px solid #ccc;
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);

  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }
`;

export const CartBarInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// Reusable CartBar component
export const CartBar: React.FC<{
  price: React.ReactNode;
  showButton: boolean;
  loading?: boolean;
  onAdd: () => void;
  renderSpinner?: React.ReactNode;
}> = ({ price: _price, showButton, loading, onAdd, renderSpinner }) => {
  if (!showButton) return null;
  return (
    <CartBarContainer>
      <CartBarInner>
        <CartButton onClick={onAdd} disabled={!!loading}>
          {loading ? (renderSpinner ?? <span>…</span>) : <span>Save and Order</span>}
        </CartButton>
      </CartBarInner>
    </CartBarContainer>
  );
};

export const ViewportSpacer = styled.div`
  flex: 0 0 auto;
  height: 72px;

  @supports (height: env(safe-area-inset-bottom)) {
    height: calc(72px + env(safe-area-inset-bottom));
  }
`;

export const NavContainer = styled.div`
  display: flex;
  alignItems: center;
  justifyContent: space-between;
  margin: 16px 0;
`;

export const StepNavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
`;

export const StepNavCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  span {
    font-size: 12px;
    color: #888;
    margin-top: 4px;
  }
`;

export const StepNav: React.FC<{
  title: React.ReactNode;
  stepIndex: number;         // zero-based
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
}> = ({ title, stepIndex, totalSteps, onPrev, onNext, disablePrev, disableNext }) => (
  <StepNavContainer>
    <NavButton onClick={onPrev} disabled={!!disablePrev} title="Back">←</NavButton>

    <StepNavCenter>
      <StepTitle>{title}</StepTitle>
      <span>Step {stepIndex + 1} of {totalSteps}</span>
    </StepNavCenter>

    <NavButton onClick={onNext} disabled={!!disableNext} title="Next">→</NavButton>
  </StepNavContainer>
);

// ===== Reusable UI blocks =====

// Options list layout
export const OptionsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`;

// Text inside an option card
export const OptionText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const OptionTitle = styled.span<{ $selected?: boolean }>`
  font-weight: 600;
  color: ${({ $selected }) => ($selected ? '#000' : 'inherit')};
`;

export const OptionDescription = styled.span`
  font-size: 13px;
  color: #666;
  margin-top: 4px;
`;

// Closure step sections
export const ClosureSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 8px;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 8px;
`;

export const SwatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 12px;
`;

export const SwatchButton = styled.button<{
  $selected?: boolean;
  $hex?: string;
  $isNone?: boolean;
  $disabled?: boolean;
}>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: ${({ $selected }) => ($selected ? '3px solid #000' : '1px solid #ccc')};
  background: ${({ $isNone, $hex }) => ($isNone ? 'transparent' : ($hex || 'transparent'))};
  cursor: ${({ $disabled }) => ($disabled ? 'wait' : 'pointer')};
  position: relative;
`;

export const SwatchNoneLabel = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #555;
`;

// Label step cards
export const LabelGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;
  margin-top: 16px;
`;

export const LabelCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
`;

export const LabelCardTitle = styled.h4`
  margin-top: 0;
`;

export const ActionsCenter = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: center;
`;

// Accessible live region for config warnings
export const VisuallyHiddenLive = styled.div`
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

export const ConfigWarning: React.FC = () => (
  <VisuallyHiddenLive id="config-warning" aria-live="polite" role="status" />
);

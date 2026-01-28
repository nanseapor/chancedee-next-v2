import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditableField } from '@/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/fields/EditableField';

describe('EditableField', () => {
  const defaultProps = {
    label: 'ชื่อตำแหน่ง',
    name: 'title',
    isChanged: false,
    error: undefined,
    children: <input data-testid="input" />,
  };

  describe('Rendering', () => {
    it('should display label', () => {
      render(<EditableField {...defaultProps} />);
      expect(screen.getByText('ชื่อตำแหน่ง')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(<EditableField {...defaultProps} />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });
  });

  describe('Change Indicator', () => {
    it('should show change indicator when field is changed', () => {
      render(<EditableField {...defaultProps} isChanged={true} />);
      expect(screen.getByTestId('change-indicator')).toBeInTheDocument();
    });

    it('should not show change indicator when unchanged', () => {
      render(<EditableField {...defaultProps} isChanged={false} />);
      expect(screen.queryByTestId('change-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      render(<EditableField {...defaultProps} error="กรุณาระบุชื่อตำแหน่ง" />);
      expect(screen.getByText('กรุณาระบุชื่อตำแหน่ง')).toBeInTheDocument();
    });

    it('should apply error styling to field', () => {
      render(<EditableField {...defaultProps} error="Error" />);
      expect(screen.getByTestId('field-container')).toHaveClass('border-red-500');
    });

    it('should not show helpText when error exists', () => {
      render(<EditableField {...defaultProps} error="Error" helpText="Help text" />);
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('should show required indicator when required prop is true', () => {
      render(<EditableField {...defaultProps} required={true} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not show required indicator when required is false', () => {
      render(<EditableField {...defaultProps} required={false} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    it('should display help text when provided and no error', () => {
      render(<EditableField {...defaultProps} helpText="นี่คือข้อความช่วยเหลือ" />);
      expect(screen.getByText('นี่คือข้อความช่วยเหลือ')).toBeInTheDocument();
    });
  });

  describe('Changed State Styling', () => {
    it('should apply orange border when changed and no error', () => {
      render(<EditableField {...defaultProps} isChanged={true} />);
      expect(screen.getByTestId('field-container')).toHaveClass('border-orange-300');
    });

    it('should prioritize error styling over changed styling', () => {
      render(<EditableField {...defaultProps} isChanged={true} error="Error" />);
      const container = screen.getByTestId('field-container');
      expect(container).toHaveClass('border-red-500');
      expect(container).not.toHaveClass('border-orange-300');
    });
  });
});

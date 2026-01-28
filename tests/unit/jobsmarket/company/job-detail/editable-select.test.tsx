import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableSelect } from '@/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/fields/EditableSelect';

describe('EditableSelect', () => {
  const options = [
    { value: 'full-time', label: 'เต็มเวลา' },
    { value: 'part-time', label: 'พาร์ทไทม์' },
    { value: 'contract', label: 'สัญญาจ้าง' },
    { value: 'internship', label: 'ฝึกงาน' },
  ];

  const defaultProps = {
    label: 'ประเภทการจ้างงาน',
    name: 'employment',
    value: 'full-time',
    options,
    onChange: vi.fn(),
    isChanged: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should display label', () => {
      render(<EditableSelect {...defaultProps} />);
      expect(screen.getByText('ประเภทการจ้างงาน')).toBeInTheDocument();
    });

    it('should display current selected value', () => {
      render(<EditableSelect {...defaultProps} value="full-time" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('เต็มเวลา');
    });

    it('should show placeholder when no value selected', () => {
      render(<EditableSelect {...defaultProps} value="" placeholder="เลือก..." />);
      expect(screen.getByRole('combobox')).toHaveTextContent('เลือก...');
    });
  });

  describe('Selection', () => {
    it('should call onChange when option selected', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<EditableSelect {...defaultProps} onChange={onChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('พาร์ทไทม์'));

      expect(onChange).toHaveBeenCalledWith('part-time');
    });

    it('should display all options when opened', async () => {
      const user = userEvent.setup();
      render(<EditableSelect {...defaultProps} />);

      await user.click(screen.getByRole('combobox'));

      // Selected value appears twice (in trigger + in dropdown), so use getAllByText
      expect(screen.getAllByText('เต็มเวลา').length).toBeGreaterThan(0);
      expect(screen.getByText('พาร์ทไทม์')).toBeInTheDocument();
      expect(screen.getByText('สัญญาจ้าง')).toBeInTheDocument();
      expect(screen.getByText('ฝึกงาน')).toBeInTheDocument();
    });
  });

  describe('Change Indicator', () => {
    it('should show change indicator when isChanged is true', () => {
      render(<EditableSelect {...defaultProps} isChanged={true} />);
      expect(screen.getByTestId('change-indicator')).toBeInTheDocument();
    });

    it('should not show change indicator when isChanged is false', () => {
      render(<EditableSelect {...defaultProps} isChanged={false} />);
      expect(screen.queryByTestId('change-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop provided', () => {
      render(<EditableSelect {...defaultProps} error="กรุณาเลือกประเภทการจ้างงาน" />);
      expect(screen.getByText('กรุณาเลือกประเภทการจ้างงาน')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<EditableSelect {...defaultProps} disabled={true} />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });
});

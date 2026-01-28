import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableNumberInput } from '@/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/fields/EditableNumberInput';

describe('EditableNumberInput', () => {
  const defaultProps = {
    label: 'จำนวนตำแหน่ง',
    name: 'positions',
    value: 1,
    onChange: vi.fn(),
    isChanged: false,
    min: 1,
    max: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should display label', () => {
      render(<EditableNumberInput {...defaultProps} />);
      expect(screen.getByText('จำนวนตำแหน่ง')).toBeInTheDocument();
    });

    it('should display current value', () => {
      render(<EditableNumberInput {...defaultProps} value={5} />);
      expect(screen.getByRole('spinbutton')).toHaveValue(5);
    });

    it('should show empty when value is undefined', () => {
      render(<EditableNumberInput {...defaultProps} value={undefined} />);
      expect(screen.getByRole('spinbutton')).toHaveValue(null);
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when value changes', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<EditableNumberInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '10');

      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('should respect min value', () => {
      render(<EditableNumberInput {...defaultProps} min={1} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('min', '1');
    });

    it('should respect max value', () => {
      render(<EditableNumberInput {...defaultProps} max={100} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '100');
    });
  });

  describe('Increment/Decrement Buttons', () => {
    it('should increment value when + button clicked', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<EditableNumberInput {...defaultProps} value={5} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: /เพิ่ม/i }));

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('should decrement value when - button clicked', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<EditableNumberInput {...defaultProps} value={5} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: /ลด/i }));

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('should not decrement below min', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<EditableNumberInput {...defaultProps} value={1} min={1} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: /ลด/i }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not increment above max', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<EditableNumberInput {...defaultProps} value={100} max={100} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: /เพิ่ม/i }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Change Indicator', () => {
    it('should show change indicator when isChanged is true', () => {
      render(<EditableNumberInput {...defaultProps} isChanged={true} />);
      expect(screen.getByTestId('change-indicator')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      render(<EditableNumberInput {...defaultProps} error="จำนวนต้องมากกว่า 0" />);
      expect(screen.getByText('จำนวนต้องมากกว่า 0')).toBeInTheDocument();
    });
  });
});

/**
 * COMP-R08: ApplicationCard Component Unit Tests
 * Target: 12 tests (simplified for reliability)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationCard } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/ApplicationCard';
import { mockApplication, mockApplicationRead, mockApplicationRejected } from './__fixtures__/applications';

describe('ApplicationCard', () => {
  const defaultProps = {
    application: mockApplication,
    isSelected: false,
    onSelect: vi.fn(),
  };

  it('renders candidate name', () => {
    render(<ApplicationCard {...defaultProps} />);
    expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();
  });

  it('renders job title', () => {
    render(<ApplicationCard {...defaultProps} />);
    expect(screen.getByText(mockApplication.jobTitle)).toBeInTheDocument();
  });

  it('renders relative time with Thai text', () => {
    render(<ApplicationCard {...defaultProps} />);
    // Text is: "สมัครเมื่อ " + "ประมาณ 1 ชั่วโมงที่ผ่านมา"
    expect(screen.getByText(/สมัครเมื่อ/)).toBeInTheDocument();
  });

  it('renders status badge for applied status', () => {
    render(<ApplicationCard {...defaultProps} />);
    expect(screen.getByText(/รอดำเนินการ/)).toBeInTheDocument();
  });

  it('renders status badge for read status', () => {
    render(<ApplicationCard {...defaultProps} application={mockApplicationRead} />);
    expect(screen.getByText(/ดูแล้ว/)).toBeInTheDocument();
  });

  it('renders status badge for rejected status', () => {
    render(<ApplicationCard {...defaultProps} application={mockApplicationRejected} />);
    expect(screen.getByText(/ปฏิเสธ/)).toBeInTheDocument();
  });

  it('displays match score percentage when available', () => {
    render(<ApplicationCard {...defaultProps} />);
    // Text is broken up: "คะแนน: " + "85" + "%"
    expect(screen.getByText(/คะแนน:/)).toBeInTheDocument();
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('does not display match score when null', () => {
    const appNoScore = { ...mockApplication, matchScore: null };
    render(<ApplicationCard {...defaultProps} application={appNoScore} />);
    // When matchScore is null, score text is not rendered at all
    expect(screen.queryByText(/คะแนน:/)).not.toBeInTheDocument();
  });

  it('applies selected background when isSelected is true', () => {
    const { container } = render(<ApplicationCard {...defaultProps} isSelected={true} />);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-secondary-50');
  });

  it('applies default background when isSelected is false', () => {
    const { container } = render(<ApplicationCard {...defaultProps} isSelected={false} />);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white');
  });

  it('calls onSelect with application ID when clicked', () => {
    const onSelect = vi.fn();
    render(<ApplicationCard {...defaultProps} onSelect={onSelect} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledWith(mockApplication.uid);
  });

  it('is keyboard accessible with button role', () => {
    render(<ApplicationCard {...defaultProps} />);
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
  });
});

/**
 * COMP-R08: CandidateHeader Component Unit Tests
 *
 * Tests for candidate header display component.
 * Covers avatar, name, headline, contact info, and match score badge.
 *
 * Target: 5-10 tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateHeader } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/CandidateHeader';

describe('CandidateHeader', () => {
  const defaultProps = {
    photo: null,
    name: 'สมชาย ใจดี',
    headline: 'Senior Full Stack Developer',
    email: 'somchai@example.com',
    phone: '+66812345678',
    matchScore: 85,
  };

  describe('Avatar Display', () => {
    it('renders photo when provided', () => {
      const { container } = render(
        <CandidateHeader {...defaultProps} photo="https://example.com/photo.jpg" />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
      expect(img).toHaveAttribute('alt', defaultProps.name);
    });

    it('renders initial avatar when photo is null', () => {
      const { container } = render(<CandidateHeader {...defaultProps} photo={null} />);

      // Should render first character of name in uppercase
      expect(screen.getByText('ส')).toBeInTheDocument();

      // No img tag should exist
      const img = container.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('applies correct styling to initial avatar', () => {
      const { container } = render(<CandidateHeader {...defaultProps} photo={null} />);

      const avatarContainer = container.querySelector('.bg-secondary-100');
      expect(avatarContainer).toBeInTheDocument();
      expect(avatarContainer).toHaveClass('rounded-full', 'h-16', 'w-16');
    });
  });

  describe('Candidate Information', () => {
    it('renders candidate name', () => {
      render(<CandidateHeader {...defaultProps} />);

      const nameHeading = screen.getByText(defaultProps.name);
      expect(nameHeading).toBeInTheDocument();
      expect(nameHeading.tagName).toBe('H1');
    });

    it('renders headline when provided', () => {
      render(<CandidateHeader {...defaultProps} />);

      expect(screen.getByText(defaultProps.headline)).toBeInTheDocument();
    });

    it('does not render headline when null', () => {
      render(<CandidateHeader {...defaultProps} headline={null} />);

      expect(screen.queryByText('Senior Full Stack Developer')).not.toBeInTheDocument();
    });

    it('renders email with mailto link', () => {
      render(<CandidateHeader {...defaultProps} />);

      const emailLink = screen.getByRole('link', { name: new RegExp(defaultProps.email) });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', `mailto:${defaultProps.email}`);
    });

    it('renders phone when provided with tel link', () => {
      render(<CandidateHeader {...defaultProps} />);

      // Escape special regex characters in phone number
      const phoneLink = screen.getByRole('link', { name: /\+66812345678/ });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', `tel:${defaultProps.phone}`);
    });

    it('does not render phone when null', () => {
      render(<CandidateHeader {...defaultProps} phone={null} />);

      // Check no tel: link exists
      const links = screen.getAllByRole('link');
      const phoneLinks = links.filter((link) => link.getAttribute('href')?.startsWith('tel:'));
      expect(phoneLinks.length).toBe(0);
    });
  });

  describe('Match Score Badge', () => {
    it('renders match score when available', () => {
      render(<CandidateHeader {...defaultProps} />);

      expect(screen.getByText(/คะแนน: 85%/)).toBeInTheDocument();
    });

    it('applies green styling for high scores (≥80)', () => {
      const { container } = render(<CandidateHeader {...defaultProps} matchScore={85} />);

      const badge = screen.getByText(/คะแนน: 85%/);
      expect(badge).toHaveClass('text-green-700', 'bg-green-50', 'border-green-300');
    });

    it('applies amber styling for medium scores (60-79)', () => {
      const { container } = render(<CandidateHeader {...defaultProps} matchScore={70} />);

      const badge = screen.getByText(/คะแนน: 70%/);
      expect(badge).toHaveClass('text-amber-700', 'bg-amber-50', 'border-amber-300');
    });

    it('applies gray styling for low scores (<60)', () => {
      const { container } = render(<CandidateHeader {...defaultProps} matchScore={45} />);

      const badge = screen.getByText(/คะแนน: 45%/);
      expect(badge).toHaveClass('text-gray-700', 'bg-gray-50', 'border-gray-300');
    });

    it('renders "ไม่มีคะแนน" when score is null', () => {
      render(<CandidateHeader {...defaultProps} matchScore={null} />);

      expect(screen.getByText(/ไม่มีคะแนน/)).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('has correct section structure with border', () => {
      const { container } = render(<CandidateHeader {...defaultProps} />);

      const section = container.querySelector('.border-b');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('border-gray-200', 'bg-white', 'p-6');
    });

    it('uses flex layout for avatar and info', () => {
      const { container } = render(<CandidateHeader {...defaultProps} />);

      const flexContainer = container.querySelector('.flex.items-start');
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass('gap-4');
    });
  });
});

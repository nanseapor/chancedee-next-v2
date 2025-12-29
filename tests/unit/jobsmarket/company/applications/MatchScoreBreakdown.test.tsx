/**
 * COMP-R08: MatchScoreBreakdown Component Unit Tests
 *
 * Tests for match score breakdown visualization component.
 * Covers null state, total score, and progress bars.
 *
 * Target: 5-10 tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchScoreBreakdown } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/MatchScoreBreakdown';
import { mockMatchBreakdown } from './__fixtures__/applications';

describe('MatchScoreBreakdown', () => {
  describe('Null State', () => {
    it('renders N/A message when score is null', () => {
      render(<MatchScoreBreakdown score={null} />);

      expect(screen.getByText(/ไม่มีข้อมูลคะแนนความเหมาะสม/)).toBeInTheDocument();
    });

    it('still renders section header in N/A state', () => {
      render(<MatchScoreBreakdown score={null} />);

      const headers = screen.getAllByText(/คะแนนความเหมาะสม/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('applies correct styling to N/A container', () => {
      const { container } = render(<MatchScoreBreakdown score={null} />);

      const naContainer = container.querySelector('.bg-gray-50');
      expect(naContainer).toBeInTheDocument();
      expect(naContainer).toHaveClass('rounded-lg', 'border-gray-200');
    });
  });

  describe('Score Display', () => {
    it('renders total score prominently', () => {
      const { container } = render(<MatchScoreBreakdown score={mockMatchBreakdown} />);

      // Total score is displayed with text-2xl and text-secondary-700
      const totalScore = container.querySelector('.text-2xl.text-secondary-700');
      expect(totalScore).toBeInTheDocument();
      expect(totalScore?.textContent).toContain(`${mockMatchBreakdown.total}%`);
    });

    it('renders section header when score is available', () => {
      render(<MatchScoreBreakdown score={mockMatchBreakdown} />);

      const headers = screen.getAllByText(/คะแนนความเหมาะสม/);
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Breakdown Categories', () => {
    it('renders all 4 category labels in Thai', () => {
      render(<MatchScoreBreakdown score={mockMatchBreakdown} />);

      expect(screen.getByText(/ทักษะ/)).toBeInTheDocument();
      expect(screen.getByText(/ประสบการณ์/)).toBeInTheDocument();
      expect(screen.getByText(/การศึกษา/)).toBeInTheDocument();
      expect(screen.getByText(/เงินเดือน/)).toBeInTheDocument();
    });

    it('renders all 4 category scores', () => {
      render(<MatchScoreBreakdown score={mockMatchBreakdown} />);

      // Use getAllByText to handle duplicate percentages (e.g., total and experience both 85%)
      const skillScore = screen.getAllByText(/90%/);
      expect(skillScore.length).toBeGreaterThan(0);

      const experienceScore = screen.getAllByText(/85%/);
      expect(experienceScore.length).toBeGreaterThan(0);

      const educationScore = screen.getAllByText(/80%/);
      expect(educationScore.length).toBeGreaterThan(0);

      const salaryScore = screen.getAllByText(/75%/);
      expect(salaryScore.length).toBeGreaterThan(0);
    });

    it('renders progress bars for each category', () => {
      const { container } = render(<MatchScoreBreakdown score={mockMatchBreakdown} />);

      // Progress bars have .bg-gray-200 as background and colored fill
      const progressBars = container.querySelectorAll('.bg-gray-200.rounded-full');
      expect(progressBars.length).toBe(4); // 4 categories
    });
  });

  describe('Progress Bar Colors', () => {
    it('applies green color for high scores (≥80)', () => {
      const highScore = {
        total: 90,
        skillMatch: 85,
        experienceMatch: 80,
        educationMatch: 75,
        salaryMatch: 70,
      };

      const { container } = render(<MatchScoreBreakdown score={highScore} />);

      // Should have at least one green bar
      const greenBars = container.querySelectorAll('.bg-green-500');
      expect(greenBars.length).toBeGreaterThan(0);
    });

    it('applies amber color for medium scores (60-79)', () => {
      const mediumScore = {
        total: 70,
        skillMatch: 70,
        experienceMatch: 65,
        educationMatch: 60,
        salaryMatch: 55,
      };

      const { container } = render(<MatchScoreBreakdown score={mediumScore} />);

      // Should have at least one amber bar
      const amberBars = container.querySelectorAll('.bg-amber-500');
      expect(amberBars.length).toBeGreaterThan(0);
    });

    it('applies gray color for low scores (<60)', () => {
      const lowScore = {
        total: 50,
        skillMatch: 50,
        experienceMatch: 45,
        educationMatch: 40,
        salaryMatch: 35,
      };

      const { container } = render(<MatchScoreBreakdown score={lowScore} />);

      // Should have gray bars
      const grayBars = container.querySelectorAll('.bg-gray-400');
      expect(grayBars.length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Structure', () => {
    it('has correct section structure with border', () => {
      const { container } = render(<MatchScoreBreakdown score={mockMatchBreakdown} />);

      const section = container.querySelector('.border-b');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('border-gray-200', 'bg-white', 'p-6');
    });

    it('uses space-y for vertical spacing between bars', () => {
      const { container } = render(<MatchScoreBreakdown score={mockMatchBreakdown} />);

      const scoreContainer = container.querySelector('.space-y-4');
      expect(scoreContainer).toBeInTheDocument();
    });
  });
});

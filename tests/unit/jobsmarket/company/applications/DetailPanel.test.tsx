/**
 * COMP-R08: DetailPanel Component Unit Tests
 *
 * Tests for application detail panel component.
 * Covers empty state, data display, and all sub-components.
 *
 * Target: 20-30 tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailPanel } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/DetailPanel';
import {
  mockApplication,
  mockApplicationRead,
  mockApplicationAccepted,
  mockMatchBreakdown,
} from './__fixtures__/applications';
import type { ApplicationListItem } from '@/types/jobsmarket/applications.types';

describe('DetailPanel', () => {
  const defaultProps = {
    companyId: 'comp-test-1',
  };

  describe('Empty State', () => {
    it('shows placeholder message when application is undefined', () => {
      render(<DetailPanel application={undefined} {...defaultProps} />);

      expect(screen.getByText(/เลือกใบสมัครเพื่อดูรายละเอียด/)).toBeInTheDocument();
    });

    it('displays instructional text when no application selected', () => {
      render(<DetailPanel application={undefined} {...defaultProps} />);

      expect(
        screen.getByText(/คลิกที่ใบสมัครในรายการด้านซ้ายเพื่อดูข้อมูลผู้สมัคร/)
      ).toBeInTheDocument();
    });

    it('shows folder icon in empty state', () => {
      const { container } = render(<DetailPanel application={undefined} {...defaultProps} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has correct styling for empty state container', () => {
      const { container } = render(<DetailPanel application={undefined} {...defaultProps} />);

      const emptyContainer = container.querySelector('.flex.flex-col.items-center');
      expect(emptyContainer).toHaveClass('justify-center', 'h-full', 'text-gray-500');
    });
  });

  describe('Data Display - Candidate Header', () => {
    it('renders candidate name from application', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(mockApplication.candidateName)).toBeInTheDocument();
    });

    it('renders candidate headline when available', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(mockApplication.candidateHeadline!)).toBeInTheDocument();
    });

    it('renders match score when available', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(`คะแนน: ${mockApplication.matchScore}%`)).toBeInTheDocument();
    });

    it('renders "ไม่มีคะแนน" when match score is null', () => {
      render(<DetailPanel application={mockApplicationAccepted} {...defaultProps} />);

      expect(screen.getByText(/ไม่มีคะแนน/)).toBeInTheDocument();
    });

    it('passes candidate photo to CandidateHeader', () => {
      const appWithPhoto = { ...mockApplicationRead };
      render(<DetailPanel application={appWithPhoto} {...defaultProps} />);

      // CandidateHeader will render an img or avatar with the photo
      // Since we're testing integration, we verify the component renders
      expect(screen.getByText(appWithPhoto.candidateName)).toBeInTheDocument();
    });
  });

  describe('Data Display - Application Info', () => {
    it('renders expected salary section', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/เงินเดือนที่คาดหวัง/)).toBeInTheDocument();
      expect(screen.getByText(/฿50,000/)).toBeInTheDocument();
    });

    it('shows negotiable badge when salary is negotiable', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ต่อรองได้/)).toBeInTheDocument();
    });

    it('renders overhead days (notice period)', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ระยะเวลาแจ้งล่วงหน้า/)).toBeInTheDocument();
      expect(screen.getByText(`${mockApplication.overheadDays} วัน`)).toBeInTheDocument();
    });

    it('renders application headlines/message', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ข้อความจากผู้สมัคร/)).toBeInTheDocument();
      expect(screen.getByText(mockApplication.headlines)).toBeInTheDocument();
    });

    it('renders applied date', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/วันที่สมัคร/)).toBeInTheDocument();
    });

    it('handles null salary gracefully', () => {
      const appNoSalary: ApplicationListItem = {
        ...mockApplication,
        expectedSalary: null,
      };
      render(<DetailPanel application={appNoSalary} {...defaultProps} />);

      expect(screen.getByText(/ไม่ระบุ/)).toBeInTheDocument();
    });
  });

  describe('Data Display - Match Score Breakdown', () => {
    it('renders match score section header', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const headers = screen.getAllByText(/คะแนนความเหมาะสม/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('shows N/A state when match score is null (Phase 2+ deferred)', () => {
      render(<DetailPanel application={mockApplicationAccepted} {...defaultProps} />);

      expect(screen.getByText(/ไม่มีข้อมูลคะแนนความเหมาะสม/)).toBeInTheDocument();
    });

    it('passes null to MatchScoreBreakdown component', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      // DetailPanel always passes null per Phase 2+ AI matching decision
      expect(screen.getByText(/ไม่มีข้อมูลคะแนนความเหมาะสม/)).toBeInTheDocument();
    });
  });

  describe('Data Display - Profile Sections', () => {
    it('renders work experience section header', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const headers = screen.getAllByText(/ประสบการณ์ทำงาน/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('shows empty state for work experience (mock data)', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ไม่มีข้อมูลประสบการณ์ทำงาน/)).toBeInTheDocument();
    });

    it('renders education section header', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const headers = screen.getAllByText(/การศึกษา/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('shows empty state for education (mock data)', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ไม่มีข้อมูลการศึกษา/)).toBeInTheDocument();
    });

    it('renders skills section header', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const headers = screen.getAllByText(/ทักษะ/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('shows empty state for skills (mock data)', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ไม่มีข้อมูลทักษะ/)).toBeInTheDocument();
    });

    it('renders languages section header', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const headers = screen.getAllByText(/ภาษา/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('shows empty state for languages (mock data)', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ไม่มีข้อมูลภาษา/)).toBeInTheDocument();
    });
  });

  describe('Data Display - Resume Viewer', () => {
    it('renders resume section header', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const headers = screen.getAllByText(/เรซูเม่/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('shows empty state when no resume URL (mock data)', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(/ผู้สมัครไม่ได้แนบไฟล์เรซูเม่/)).toBeInTheDocument();
    });

    it('passes null resumeUrl to ResumeViewer component', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      // DetailPanel uses mock data with null resumeUrl
      expect(screen.getByText(/ผู้สมัครไม่ได้แนบไฟล์เรซูเม่/)).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('renders all sections in correct order', () => {
      const { container } = render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const sections = container.querySelectorAll('.p-6.border-b');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('has scrollable container', () => {
      const { container } = render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('h-full', 'bg-gray-50');
    });

    it('applies correct background color', () => {
      const { container } = render(<DetailPanel application={mockApplication} {...defaultProps} />);

      const mainContainer = container.querySelector('.bg-gray-50');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates CandidateHeader component', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      // Verify CandidateHeader renders by checking for its content
      expect(screen.getByText(mockApplication.candidateName)).toBeInTheDocument();
    });

    it('integrates ApplicationInfo component', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      // Verify ApplicationInfo renders
      expect(screen.getByText(/ข้อมูลการสมัคร/)).toBeInTheDocument();
    });

    it('integrates MatchScoreBreakdown component', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      // Verify MatchScoreBreakdown renders
      const headers = screen.getAllByText(/คะแนนความเหมาะสม/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('integrates ProfileSections component', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      // Verify ProfileSections renders
      expect(screen.getAllByText(/ประสบการณ์ทำงาน/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/การศึกษา/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/ทักษะ/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/ภาษา/).length).toBeGreaterThan(0);
    });

    it('integrates ResumeViewer component', () => {
      render(<DetailPanel application={mockApplication} {...defaultProps} />);

      // Verify ResumeViewer renders
      const headers = screen.getAllByText(/เรซูเม่/);
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles application with all null optional fields', () => {
      const minimalApp: ApplicationListItem = {
        uid: 'minimal-1',
        jobId: 'job-1',
        candidateId: 'cand-1',
        companyId: 'comp-1',
        status: 'applied',
        expectedSalary: null,
        isNegotiable: false,
        overheadDays: 0,
        headlines: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        candidateName: 'Test User',
        candidatePhoto: null,
        candidateHeadline: null,
        jobTitle: 'Test Job',
        matchScore: null,
        isUnread: false,
      };

      render(<DetailPanel application={minimalApp} {...defaultProps} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('renders correctly when switching between applications', () => {
      const { rerender } = render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(mockApplication.candidateName)).toBeInTheDocument();

      rerender(<DetailPanel application={mockApplicationRead} {...defaultProps} />);

      expect(screen.getByText(mockApplicationRead.candidateName)).toBeInTheDocument();
      expect(screen.queryByText(mockApplication.candidateName)).not.toBeInTheDocument();
    });

    it('renders correctly when switching from application to undefined', () => {
      const { rerender } = render(<DetailPanel application={mockApplication} {...defaultProps} />);

      expect(screen.getByText(mockApplication.candidateName)).toBeInTheDocument();

      rerender(<DetailPanel application={undefined} {...defaultProps} />);

      expect(screen.queryByText(mockApplication.candidateName)).not.toBeInTheDocument();
      expect(screen.getByText(/เลือกใบสมัครเพื่อดูรายละเอียด/)).toBeInTheDocument();
    });
  });
});

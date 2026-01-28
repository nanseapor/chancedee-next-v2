/**
 * COMP-R08: ProfileSections Component Unit Tests
 *
 * Tests for candidate profile sections component.
 * Covers work experience, education, skills, and languages display.
 *
 * Target: 5-10 tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileSections } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/ProfileSections';
import {
  mockWorkExperience,
  mockEducation,
  mockSkills,
  mockLanguages,
} from './__fixtures__/applications';

describe('ProfileSections', () => {
  const defaultProps = {
    experience: mockWorkExperience,
    education: mockEducation,
    skills: mockSkills,
    languages: mockLanguages,
  };

  describe('Work Experience Section', () => {
    it('renders section header with icon', () => {
      render(<ProfileSections {...defaultProps} />);

      const headers = screen.getAllByText(/ประสบการณ์ทำงาน/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('renders work experience items when available', () => {
      render(<ProfileSections {...defaultProps} />);

      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corporation')).toBeInTheDocument();
      expect(screen.getByText('Junior Developer')).toBeInTheDocument();
      expect(screen.getByText('Startup Co.')).toBeInTheDocument();
    });

    it('shows "ปัจจุบัน" for current positions', () => {
      render(<ProfileSections {...defaultProps} />);

      expect(screen.getByText(/ปัจจุบัน/)).toBeInTheDocument();
    });

    it('shows empty state when no experience', () => {
      render(<ProfileSections {...defaultProps} experience={[]} />);

      expect(screen.getByText(/ไม่มีข้อมูลประสบการณ์ทำงาน/)).toBeInTheDocument();
    });
  });

  describe('Education Section', () => {
    it('renders section header with icon', () => {
      render(<ProfileSections {...defaultProps} />);

      const headers = screen.getAllByText(/การศึกษา/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('renders education items when available', () => {
      render(<ProfileSections {...defaultProps} />);

      expect(screen.getByText(/จุฬาลงกรณ์มหาวิทยาลัย/)).toBeInTheDocument();
      expect(screen.getByText(/มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี/)).toBeInTheDocument();
      expect(screen.getByText(/วิทยาการคอมพิวเตอร์/)).toBeInTheDocument();
      expect(screen.getByText(/วิศวกรรมซอฟต์แวร์/)).toBeInTheDocument();
    });

    it('shows graduation year', () => {
      render(<ProfileSections {...defaultProps} />);

      expect(screen.getByText(/จบการศึกษา 2018/)).toBeInTheDocument();
      expect(screen.getByText(/จบการศึกษา 2020/)).toBeInTheDocument();
    });

    it('shows empty state when no education', () => {
      render(<ProfileSections {...defaultProps} education={[]} />);

      expect(screen.getByText(/ไม่มีข้อมูลการศึกษา/)).toBeInTheDocument();
    });
  });

  describe('Skills Section', () => {
    it('renders section header with icon', () => {
      render(<ProfileSections {...defaultProps} />);

      const headers = screen.getAllByText(/ทักษะ/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('renders all skills as badges', () => {
      render(<ProfileSections {...defaultProps} />);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
      expect(screen.getByText('Docker')).toBeInTheDocument();
      expect(screen.getByText('AWS')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
      expect(screen.getByText('GraphQL')).toBeInTheDocument();
    });

    it('shows empty state when no skills', () => {
      render(<ProfileSections {...defaultProps} skills={[]} />);

      expect(screen.getByText(/ไม่มีข้อมูลทักษะ/)).toBeInTheDocument();
    });
  });

  describe('Languages Section', () => {
    it('renders section header with icon', () => {
      render(<ProfileSections {...defaultProps} />);

      const headers = screen.getAllByText(/ภาษา/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('renders all languages with proficiency levels', () => {
      render(<ProfileSections {...defaultProps} />);

      expect(screen.getByText('ไทย')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();

      expect(screen.getByText(/เจ้าของภาษา/)).toBeInTheDocument();
      expect(screen.getByText(/คล่องแคล่ว/)).toBeInTheDocument();
      expect(screen.getByText(/สื่อสารได้/)).toBeInTheDocument();
      expect(screen.getByText(/พื้นฐาน/)).toBeInTheDocument();
    });

    it('shows empty state when no languages', () => {
      render(<ProfileSections {...defaultProps} languages={[]} />);

      expect(screen.getByText(/ไม่มีข้อมูลภาษา/)).toBeInTheDocument();
    });
  });

  describe('All Sections Empty State', () => {
    it('shows all empty states when all arrays are empty', () => {
      render(<ProfileSections experience={[]} education={[]} skills={[]} languages={[]} />);

      expect(screen.getByText(/ไม่มีข้อมูลประสบการณ์ทำงาน/)).toBeInTheDocument();
      expect(screen.getByText(/ไม่มีข้อมูลการศึกษา/)).toBeInTheDocument();
      expect(screen.getByText(/ไม่มีข้อมูลทักษะ/)).toBeInTheDocument();
      expect(screen.getByText(/ไม่มีข้อมูลภาษา/)).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('uses vertical spacing between sections', () => {
      const { container } = render(<ProfileSections {...defaultProps} />);

      const sectionsContainer = container.querySelector('.space-y-6');
      expect(sectionsContainer).toBeInTheDocument();
    });

    it('renders all 4 sections', () => {
      const { container } = render(<ProfileSections {...defaultProps} />);

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBe(4);
    });

    it('applies correct border styling to sections', () => {
      const { container } = render(<ProfileSections {...defaultProps} />);

      // First 3 sections have border-b, last one doesn't
      const borderedSections = container.querySelectorAll('.border-b');
      expect(borderedSections.length).toBe(3);
    });
  });
});

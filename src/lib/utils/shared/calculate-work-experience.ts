import type { workHistory } from "@/types/candidate.types";

export const calWorkHistory = (works?: workHistory[]) => {
  if (!works) {
    return { workMonths: 0, workYear: 0 };
  }
  const totalMonths = works
    ?.map((work) => {
      const endYear = work.endYear ? work.endYear : new Date().getFullYear();
      const endMonth = work.endMonth
        ? work.endMonth
        : new Date().getMonth() + 1;

      const workLength =
        (endYear - work.startYear) * 12 + (endMonth - work.startMonth);
      return workLength > 0 ? workLength : 0;
    })
    .reduce((sum, val) => {
      return sum + val;
    }, 0);

  const workYear = totalMonths ? Math.floor(totalMonths / 12) : 0;
  const workMonths = totalMonths % 12;
  return { workMonths, workYear };
};

export const calculateDuration = (experience: workHistory) => {
  const currentDate = new Date();
  const startYear = experience.startYear - 543;
  const startMonth = experience.startMonth;

  let totalYears = currentDate.getFullYear() - startYear;
  let totalMonths = currentDate.getMonth() + 1 - startMonth;

  if (totalMonths < 0) {
    totalYears -= 1;
    totalMonths += 12;
  }

  return `ระยะเวลารวม ${totalYears} ปี ${totalMonths} เดือน`;
};

export const calculateDurationStartEnd = (experience: workHistory) => {
  const endYear = experience.endYear
    ? experience.endYear - 543
    : new Date().getFullYear();
  const endMonth = experience.endMonth
    ? experience.endMonth
    : new Date().getMonth() + 1;
  const startYear = experience.startYear - 543;
  const startMonth = experience.startMonth;

  let totalYears = endYear - startYear;
  let totalMonths = endMonth - startMonth;

  if (totalMonths < 0) {
    totalYears -= 1;
    totalMonths += 12;
  }

  return `ระยะเวลารวม ${totalYears} ปี ${totalMonths} เดือน`;
};

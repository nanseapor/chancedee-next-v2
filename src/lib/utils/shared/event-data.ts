import type {
  interviewConsolidatedDataProps,
  interviewEventData,
} from "@/types/interview.types";

/**
 * Transform interview data from application data
 * This function works in both client and server components
 */
export function transformInterviewData(
  data: interviewConsolidatedDataProps,
): interviewEventData[] {
  const dataToDisplay: interviewEventData[] = [];

  if (data.application.interview) {
    const interviews = Object.values(data.application.interview);

    interviews.forEach((interview) => {
      const date = new Date(interview.appointment);
      const appointment = `${date.getDate()}/${date.getMonth() + 1}/${(date.getFullYear() + 543) % 100} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

      const fromTime = new Date(interview.from);
      const toTime = new Date(interview.to);

      const dataToReturn: interviewEventData = {
        uid: interview.uid,
        hr: interview.createdBy || interview.companyId || "",
        name: `${data.info.firstnameTH} ${data.info.lastnameTH}`,
        time: appointment,
        date,
        title: data.job.data.title,
        status: interview.status,
        from: `${fromTime.getHours().toString().padStart(2, "0")}:${fromTime.getMinutes().toString().padStart(2, "0")}`,
        to: `${toTime.getHours().toString().padStart(2, "0")}:${toTime.getMinutes().toString().padStart(2, "0")}`,
        location: interview.location,
        room: interview.room,
        note: interview.note,
        channel: interview.channel,
        address: interview.address,
        contact: interview.contact,
        data,
      };

      dataToDisplay.push(dataToReturn);
    });
  }

  return dataToDisplay;
}

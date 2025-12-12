import { getCMSNewsLetter, patchSentNewsletter } from "@/lib/newsletter";
import { sendNewsletter } from "@/lib/send-mail";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const cmsPayload = await getCMSNewsLetter();
    console.log(`Successfully Fetching directus newsletter`);

    if (cmsPayload.length > 0) {
      const cmsData = cmsPayload[0];
      if (!cmsData) {
        console.log("No newsletter data found");
        return NextResponse.json(
          { message: "No newsletter data found" },
          { status: 404, headers: { "Cache-Control": "no-store" } },
        );
      }
      console.log(`Sending newsletter id=${cmsData.id}`);
      if (
        !cmsData.sent_date ||
        !cmsData.title ||
        !cmsData.content ||
        !cmsData.id
      ) {
        console.log("Required data not found");
        return NextResponse.json(
          { message: "Required data not found" },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }

      const date_to_send = new Date(cmsData.sent_date);
      const date_now = new Date();
      date_now.setTime(date_now.getTime() + 7 * 60000);
      console.log("Date to sent", date_to_send);
      console.log("Date now", date_now);
      console.log(
        "Is time to send?",
        date_now.getTime() - date_to_send.getTime(),
      );

      await sendNewsletter(cmsData);
      await patchSentNewsletter(cmsData.id);
      console.log("Archive success!");

      return NextResponse.json(
        { message: "Send email success" },
        { headers: { "Cache-Control": "no-store" } },
      );
    } else {
      console.log("No newsletter to be sent");
      return NextResponse.json(
        { message: "No newsletter to be sent" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

import type {
  SendGridEvent,
  SendGridWebhookData,
} from "@/types/sendgrid-events";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let events: SendGridWebhookData;

  try {
    // Verify SendGrid signature (you should implement this)
    // const isValid = verifySendGridSignature(req);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Parse the request body safely
    try {
      events = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate the events array
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Expected events array" },
        { status: 400 },
      );
    }

    // Process each event
    for (const event of events) {
      try {
        await processEvent(event);
      } catch (processError) {
        console.error("Error processing event:", processError);
        // Continue processing other events
      }
    }

    return NextResponse.json(
      { message: "Webhook received successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing SendGrid webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function processEvent(event: SendGridEvent) {
  // Log the event for debugging
  console.log("Received SendGrid event:", event);

  // Example: Store the event in Firestore
  // await getFirebaseAdminFirestore()
  //   .collection("sendgrid_events")
  //   .add({
  //     ...event,
  //     processed_at: new Date(),
  //   });

  // Add more event processing logic here based on event.event type
  switch (event.event) {
    case "delivered":
      // Handle email delivered event
      break;
    case "open":
      // Handle email opened event
      break;
    case "click":
      // Handle email link clicked event
      break;
    // Add more cases as needed
  }
}

// TODO: Implement this function to verify SendGrid's signature
// function verifySendGridSignature(req: NextRequest): boolean {
//   // Implement signature verification logic
//   return true;
// }

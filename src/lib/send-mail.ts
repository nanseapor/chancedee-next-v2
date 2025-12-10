"use server";
import client, { type MailDataRequired } from "@sendgrid/mail";
import * as cheerio from "cheerio";
import { createCollectionItem } from "./directus";
import type { NewsletterProps } from "./newsletter";
import { getAllSubscribers } from "./subscription";

type emailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Sends an email message using SendGrid.
 * @param mailProps - The properties of the email message.
 * @returns A Promise that resolves when the email is sent successfully.
 */
export async function sendContactUsMessage(
  mailProps: emailPayload,
): Promise<number> {
  // Create the message payload
  const API_KEY = String(process.env.SENDGRID_API_KEY);
  client.setApiKey(API_KEY);
  const CONTACT_US_TEMPLATE_ID = String(process.env.CONTACT_US_TEMPLATE_ID);
  try {
    const mailData: MailDataRequired = {
      from: "admin@chancedee.com",
      subject: mailProps.subject,
      templateId: CONTACT_US_TEMPLATE_ID,
      personalizations: [
        {
          to: [
            { email: "info@chancedee.com" },
            { email: "test01@chancedee.com" },
          ],
          dynamicTemplateData: {
            name: mailProps.name,
            textToSend: mailProps.message,
            date: new Date().toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            response_email: mailProps.email,
            subject: mailProps.subject,
          },
        },
      ],
    };

    const sendResponse = await client.send(mailData);

    const result = sendResponse[0].statusCode;

    const body = JSON.stringify(sendResponse[0].body.toString());

    console.log(`Successfully sent message ID: ${result}: ${body}`);
    return result;
  } catch (error) {
    console.error("Error sending message:", error);
    return 500;
  }
}

export interface newsletterPayload {
  subject: string;
  to: { email: string }[];
  html: string;
}

export async function sendNewsletter(cmsData: NewsletterProps) {
  if (!cmsData.sent_date || !cmsData.title || !cmsData.content || !cmsData.id) {
    console.log("Required data not found");
    throw new Error("Required data not found");
  }

  const payload = await getAllSubscribers();
  console.log(`Successfully Fetching directus subscribed users`);
  const emailTo = payload.map((data: any) => ({ email: data.email }));
  const messageToSend = {
    subject: cmsData.title,
    to: emailTo,
    html: cmsData.content,
  };
  console.log(`Sending newsletter id=${cmsData.id} to ${emailTo.length} users`);

  const API_KEY = String(process.env.SENDGRID_API_KEY);
  client.setApiKey(API_KEY);
  const NEWSLETTER_TEMPLATE_ID = String(process.env.NEWSLETTER_TEMPLATE_ID);
  const htmlPayload = cheerio.load(messageToSend.html);
  // Make images responsive
  htmlPayload("img").each((index, element) => {
    htmlPayload(element).css({
      "max-width": "100%",
      height: "auto",
      display: "block",
      margin: "0 auto",
    });
  });
  const reworkImageHTML = htmlPayload.html();

  try {
    const emailResult = await Promise.all(
      messageToSend.to.map(async (target) => {
        const mailData: MailDataRequired = {
          from: "info@chancedee.com",
          subject: messageToSend.subject,
          templateId: NEWSLETTER_TEMPLATE_ID,
          personalizations: [
            {
              to: [{ email: target.email }],
              dynamicTemplateData: {
                name: target.email,
                htmlContent: reworkImageHTML,
                date: new Date().toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                htmlUnsubscribe: `<div align="center" valign="top" style="padding-top: 20px; font-size: 12px; color: #666666;">
                    <p style="margin: 0;">
                    If you no longer wish to receive these emails, you can 
                    <a href="https://www.chancedee.com/unsubscribe?email=${target.email}" style="color: #666666; text-decoration: underline;">unsubscribe here</a>.
                    </p>
                </div>`,
                subject: messageToSend.subject,
              },
            },
          ],
        };
        await client.send(mailData);
        const mailId = payload.find(
          (data) => data?.email === target?.email,
        )?.id;
        if (!mailId || !cmsData.id) {
          throw new Error("Error sending newsletter");
        }
        const dateNow = new Date();
        dateNow.setTime(dateNow.getTime() + 7 * 60000);
        const deliveredData = {
          email: mailId,
          status: "in_process",
          sent_time: dateNow.toISOString(),
        };
        console.log("Setting delivery data", deliveredData);
        const deliveredResult = await createCollectionItem(
          "Delivered_Emails",
          deliveredData,
        );
        console.log(
          "Successfully update delivered email to",
          target.email,
          deliveredResult,
        );
        return deliveredResult.id;
      }),
    );
    console.log("Successfully sent newsletter to", emailResult.length, "users");
    console.log("Delivered email ids", emailResult);
    if (!emailResult || emailResult.length === 0) {
      console.error("Error sending newsletter, no delivered emails ids");
      throw new Error("Error sending newsletter, no delivered emails ids");
    }
    console.log(
      `Updating newsletter id=${cmsData.id} contains delivered emails with ${emailResult.length} items`,
    );
    // const newsLetterResult = await updateCollectionItem(
    //   "Newsletter",
    //   cmsData.id,
    //   {
    //     delivered_emails: emailResult,
    //   }
    // );
    const newsLetterResult = await Promise.all(
      emailResult.map(async (emailId) => {
        const deliveredResult = await createCollectionItem(
          "Newsletter_Delivered_Emails",
          {
            Newsletter_id: cmsData.id,
            Delivered_Emails_id: emailId,
          },
        );
        console.log(
          "Successfully update delivered email status to delivered",
          deliveredResult,
        );
        return deliveredResult.id;
      }),
    );
    console.log("Successfully update newsletter", newsLetterResult);
  } catch (error) {
    console.error("Error sending newsletter:", error);
    throw new Error("Error sending newsletter");
  }
}

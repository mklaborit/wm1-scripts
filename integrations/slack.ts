import { IncomingWebhook } from "@slack/webhook";
import { checkEnvironmentVariable } from "../utils";

export async function sendSlackNotification(serviceName: string, data: any) {
  const slackWebhookURL = checkEnvironmentVariable("SLACK_WEBHOOK");

  const slackWebhook = new IncomingWebhook(slackWebhookURL, {
    username: "WM1 Slack Bot",
    icon_emoji: "🚨",
  });

  const message = `
    *Notification: ${serviceName}*

    *URLs que não atenderam os requisitos:*
    ${data
      .map((item: any) => `- ${item.percentage}% | ${item.url}: missing ${item.missing}`)
      .join("\n")}
  `;

  try {
    await slackWebhook.send({ text: message });
    console.log("slack notification sent successfully.");
  } catch (error) {
    console.error("error sending Slack notification:", error);
  }
}

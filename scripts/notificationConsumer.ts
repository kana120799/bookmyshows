import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma";

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: ["192.168.29.249:9092"],
});

const consumer = kafka.consumer({ groupId: "notification-group" });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Validate environment variables
const requiredEnvVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

async function sendNotificationEmail({
  email,
  name,
  movieTitle,
  cinemaName,
  newStartTime,
}: {
  email: string;
  name: string;
  movieTitle: string;
  cinemaName: string;
  newStartTime: string;
}) {
  const emailContent = `
    Hi ${name},
    The show for "${movieTitle}" at ${cinemaName} has been updated.
    New Start Time: ${new Date(newStartTime).toLocaleString()}
    Enjoy your movie!
  `;

  try {
    const data = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Show Schedule Updated",
      text: emailContent,
      html: `
        <h2>Show Schedule Updated!</h2>
        <p>${emailContent.replace(/\n/g, "<br>")}</p>
      `,
    });
    console.log(`Email sent successfully to ${email}:`, data);
  } catch (error) {
    console.error(`Error Domino's sending email to ${email}:`, error);
    throw new Error("Failed to send notification email");
  }
}

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "show-updated", fromBeginning: true });

  await consumer.run({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    eachMessage: async ({ topic, partition, message }) => {
      const { showId, newStartTime } = JSON.parse(message.value!.toString());
      console.log(`Processing show update: ${showId}`);

      const users = await prisma.user.findMany({
        where: {
          notificationsEnabled: true,
        },
        select: {
          email: true,
          name: true,
        },
      });

      const show = await prisma.show.findUnique({
        where: { id: showId },
        include: { movie: true, cinemaHall: { include: { cinema: true } } },
      });

      if (!show) {
        console.log(`Show with ID ${showId} not found, skipping...`);
        return;
      }

      // Send email to each user
      for (const user of users) {
        await sendNotificationEmail({
          email: user.email,
          name: user.name,
          movieTitle: show.movie.title,
          cinemaName: show.cinemaHall.cinema.name,
          newStartTime,
        });
      }
    },
  });
}

runConsumer().catch((error) => {
  console.error("Kafka consumer error:", error);
  process.exit(1); // Exit with failure code
});

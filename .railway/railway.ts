import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres", { region: "sfo" });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 500 });
  const sela = service("sela", {
    source: github("1selavolts-sudo/sela", { branch: "main", upstreamUrl: "https://github.com/1selavolts-sudo/sela" }),
    preDeploy: "npm run db:migrate",
    replicas: { "sfo": 1 },
    env: { ADMIN_EMAIL: preserve(), ADMIN_SESSION_SECRET: preserve(), CONTACT_EMAIL: preserve(), DATABASE_URL: Postgres.env.DATABASE_URL, SMTP_FROM: preserve(), SMTP_HOST: preserve(), SMTP_PASSWORD: preserve(), SMTP_PORT: preserve(), SMTP_SECURE: preserve(), SMTP_USER: preserve() },
  });

  return project("heroic-purpose", {
    resources: [Postgres, sela, postgresVolume],
  });
});

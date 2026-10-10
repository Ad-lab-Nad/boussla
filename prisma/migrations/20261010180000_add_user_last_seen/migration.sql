-- Last time the user opened the app, shown in the back office.
ALTER TABLE "users" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

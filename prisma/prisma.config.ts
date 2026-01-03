import { config } from '@prisma/client';

config({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

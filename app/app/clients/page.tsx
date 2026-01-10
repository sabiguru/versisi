import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ClientsPageClient } from "./page-client";

export default async function ClientsPage() {
  const user = await requireUser();

  const clientOrgs = await prisma.clientOrg.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          projects: true,
          clientUsers: true,
        },
      },
    },
  });

  return <ClientsPageClient clientOrgs={clientOrgs} />;
}

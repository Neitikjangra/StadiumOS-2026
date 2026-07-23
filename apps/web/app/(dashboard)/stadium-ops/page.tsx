import StadiumOpsClient from "@/components/stadium-ops/StadiumOpsClient";
import { prisma } from "@/lib/prisma";

export default async function StadiumOpsPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const venueId = id ?? "metlife";

  let venueName = "Stadium";
  try {
    const stadium = await prisma.stadium.findFirst({
      where: { id: venueId, isDeleted: false },
      select: { name: true },
    });
    if (stadium) venueName = stadium.name;
  } catch {}

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stadium Operations</h1>
          <p className="page-subtitle">Venue management and facility operations for {venueName}</p>
        </div>
      </div>
      <StadiumOpsClient
        venueId={venueId}
        venueName={venueName}
      />
    </div>
  );
}

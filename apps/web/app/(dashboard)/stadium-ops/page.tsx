import StadiumOpsClient from "@/components/stadium-ops/StadiumOpsClient";

export default async function StadiumOpsPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const venueId = id ?? "metlife";

  const venueNames: Record<string, string> = {
    metlife: "MetLife Stadium",
    att: "AT&T Stadium",
    hardrock: "Hard Rock Stadium",
    sofi: "SoFi Stadium",
  };

  return (
    <StadiumOpsClient
      venueId={venueId}
      venueName={venueNames[venueId] ?? "Stadium"}
    />
  );
}

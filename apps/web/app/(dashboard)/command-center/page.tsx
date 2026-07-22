import { getCommandCenterData } from "@/lib/command-center/actions";
import CommandCenterClient from "@/components/command-center/CommandCenterClient";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function CommandCenterPage() {
  const initialData = await getCommandCenterData();
  return <CommandCenterClient initialData={initialData} />;
}

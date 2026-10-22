import { leader, coordinators } from "@/data/members";
import MemberProfileView from "@/components/MemberProfileView";

export function generateStaticParams() {
  return [leader, ...coordinators].map((m) => ({ id: m.id }));
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MemberProfileView id={id} />;
}

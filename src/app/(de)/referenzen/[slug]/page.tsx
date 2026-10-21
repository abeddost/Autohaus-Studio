import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/config/projects";
import { pageMetadata } from "@/lib/metadata";
import { ProjectDetailPage } from "@/views/WorkPages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return pageMetadata({
    locale: "de",
    route: "work",
    subPath: project.slug,
    title: project.name,
    description: project.summary.de,
  });
}

/** Unknown slugs must answer with a real 404, so the params read may block. */
export const instant = false;

export default async function Page({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return <ProjectDetailPage project={project} locale="de" />;
}

import { getLegalBySlug } from "@/lib/legal";
import parse from "html-react-parser";

import AuthorCard from "@/components/content/author-card";
import Container from "@/components/layout/Container";
import CatergoryCrumb from "@/components/navigation/category-crumb";
import { CalendarDays } from "lucide-react";

interface LegalParams {
  params: Promise<{
    legalSlug: string;
  }>;
}

export default async function LegalPage({ params }: LegalParams) {
  const { legalSlug } = await params;
  // console.log("Get blog by params", params);
  const data = await getLegalBySlug(legalSlug);

  return (
    <>
      <section className="font-light">
        <Container className="prose max-w-4xl pt-10 lg:pt-28">
          <CatergoryCrumb props={data} size="md" />
          <header className="flex flex-col items-start text-start mx-auto mb-16 mt-4 ">
            <h1 className="text-[2.5rem] leading-normal text-start font-semibold mb-4">
              {data.title}
            </h1>
            <div className=" flex flex-row gap-6 text-slate-600 items-center justify-center">
              <AuthorCard props={data} />
              <div className="flex flex-row gap-1 items-center text-sm">
                <CalendarDays className="w-6 h-6 shrink-0" />{" "}
                {data.date_created &&
                  new Date(data.date_created).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
              </div>
            </div>
          </header>
          <div className="font-light">{parse(data.content_body || "")}</div>
        </Container>
      </section>
    </>
  );
}

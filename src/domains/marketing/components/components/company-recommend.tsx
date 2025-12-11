import Image from "next/image";
import Link from "next/link";

import { getCompanyDataPropsById } from "@/lib/database/repositories/web-company-data-props";
import { Home } from "@/lib/utils/server/home";
import getAssets from "@/lib/utils/shared/asset";

type featureCompanyType = {
  id: string;
  featured_url: string;
  featured_image: string;
};

async function getComp(ids: string[]) {
  const data = await Promise.all(ids.map(async (id) => {
    const companyData = await getCompanyDataPropsById(id);
    return companyData;
  }))
  return data.filter((item) => item !== null);
}

const CompanyRecommend = async ({ homeData }: { homeData: Home }) => {
  const featuredCompanies = await fetch("https://content.chancedee.com/items/Featured_Company");
  const cmsData = await featuredCompanies.json();
  const ids = cmsData.data?.map((item: featureCompanyType) =>
    item.featured_url.split("/").pop()
  );
  console.log("ids", ids);

  const featuredCompaniesData = await getComp(ids);
  console.log("featuredCompaniesData", featuredCompaniesData?.length);

  return (
    <>
      <div className="flex flex-row justify-between">
        <h1 className="mb-4 text-start text-2xl font-normal">
          บริษัทแนะนำ
        </h1>
        <Link href="/companies" className="cursor-pointer text-primary underline" >View all</Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {
          featuredCompaniesData?.slice(0, 4).map((data, index) => {
            const company = cmsData.data?.find((item: featureCompanyType) => item.id === data?.uid);
            return (
              <Link href={`/companies/${data?.uid}`} key={index} className="aspect-square">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-card p-2 shadow-sm transition-all hover:shadow-lg">
                  <div className="mb-1 h-44 w-44 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={company?.featured_image ? getAssets(company?.featured_image) : data?.profilePhoto || "/images/office-image.jpg"}
                      alt="Company logo"
                      className="h-full w-full object-cover"
                      width={176}
                      height={176}
                    />
                  </div>
                  <p className="text-center text-sm font-medium leading-tight">
                    {data?.companyName}
                  </p>
                </div>
              </Link>
            )
          })
        }
      </div>
    </>
  )
}

export default CompanyRecommend
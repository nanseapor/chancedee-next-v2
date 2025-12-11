import Image from "next/image";
import Link from "next/link";

const ListCardSection = ({
  props,
}: {
  props: {
    headline: string;
    cards: Array<{
      _uid: string;
      href: {
        cached_url: string;
        linktype: string;
        url: string;
      };
      icon: {
        alt: string;
        filename: string;
        id: number;
        name: string;
        title: string;
      };
    }>;
  };
}) => {
  return (
    <section>
      <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-8 sm:py-16 lg:px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900 dark:text-white">
          {props.headline}
        </h2>
        <div className="space-y-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
          {props.cards.map((data) => {
            return (
              <div key={data._uid} className="flex content-center rounded">
                <Link href={data.href.cached_url} key={data._uid}>
                  <Image
                    src={data.icon.filename}
                    alt="job position picture"
                    width="296"
                    height="267"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ListCardSection;

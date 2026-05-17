import { prisma } from "@/lib/prisma";
import Link from "next/link";

type HomeProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function Home({ searchParams }: HomeProps) {
  const query = getQueryParam((await searchParams).q).trim();

  const menuItems = await prisma.menuItem.findMany({
    where: query
      ? {
          name: {
            contains: query,
          },
        }
      : undefined,
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-zinc-950 sm:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-5 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Food Order Management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
              Menu
            </h1>
            <p className="mt-2 max-w-2xl text-base text-zinc-600">
              Search the menu by food name and quickly scan prices for new
              orders.
            </p>
          </div>

          <form action="/" className="flex w-full gap-2 sm:max-w-md">
            <label className="sr-only" htmlFor="menu-search">
              Search food by name
            </label>
            <input
              id="menu-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search food by name"
              className="h-11 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
            <button
              type="submit"
              className="h-11 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between text-sm text-zinc-600">
          <p>
            {menuItems.length} item{menuItems.length === 1 ? "" : "s"}
            {query ? ` matching "${query}"` : ""}
          </p>
          {query ? (
            <Link
              className="font-medium text-emerald-700 hover:text-emerald-900"
              href="/"
            >
              Clear search
            </Link>
          ) : null}
        </div>

        {menuItems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-emerald-50 text-5xl font-semibold text-emerald-800">
                  {item.name.charAt(0)}
                </div>
                <div className="flex min-h-44 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-zinc-950">
                      {item.name}
                    </h2>
                    <p className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-sm font-semibold text-zinc-900">
                      ₹{item.price}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-zinc-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            className="rounded-md border border-dashed border-zinc-300 bg-white p-8 text-center"
            role="status"
          >
            <h2 className="text-lg font-semibold text-zinc-950">
              No food items found
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Try another name or clear the search to view the full menu.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

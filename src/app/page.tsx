import { prisma } from "@/lib/prisma";
import { MenuList } from "@/components/menu/menu-list";

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
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: {
      name: "asc",
    },
  });

  return <MenuList initialItems={menuItems} initialQuery={query} />;
}

// import { Users } from "lucide";

import { Blocks, BriefcaseMedical, Cuboid, Users } from "lucide-react";
export const NavLinks = [
  {
    name: "Members",
    href: "/members",
    description: "View and manage members",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Repository",
    href: "/repository",
    description: "Manage repository",
    icon: <Blocks className="w-5 h-5" />,
    type: "dropdown",
    options: [
      {
        name: "Category",
        href: "/category",
        description: "Manage categories",
        icon: <Cuboid className="w-5 h-5" />,
      },
      {
        name: "Membership",
        href: "/membership",
        description: "Manage membership",
        icon: <BriefcaseMedical className="w-5 h-5" />,
      },
    ],
  },
];

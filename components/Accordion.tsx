import { ChevronDown } from "lucide-react";
import Link from "next/link";
import React from "react";

interface SubItem {
  name: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  subItems: SubItem[];
  description: string;
  parentLink: string;
}

const Accordion: React.FC<AccordionProps> = ({
  icon,
  title,
  subItems,
  description,
  parentLink,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        className="flex justify-between items-center w-full text-left rounded-xl"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="flex flex-col">
            <span className="">{title}</span>
            <span className="text-xs text-gray-500">{description}</span>
          </div>
        </div>
        <ChevronDown
          className={`transform stroke-1 transition-all  ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className="flex flex-col mt-2">
        {open &&
          subItems.map((item, index) => (
            <>
              <Link
                key={index}
                className="hover:bg-zinc-100/50 py-2 flex gap-2 items-center px-3 rounded-lg "
                href={`/${parentLink}/${item.href}`}
              >
                {item.icon}
                <div>
                  <h1>{item.name}</h1>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </Link>

              {index !== subItems.length - 1 && <hr className="my-0.5" />}
            </>
          ))}
      </div>
    </div>
  );
};

export default Accordion;

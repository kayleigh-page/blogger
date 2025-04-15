"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import { TbMenu2 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/login");
  };

  const NavLink = ({ href, title, children }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`text-4xl uppercase py-3 px-4 ${
          isActive
            ? "bg-pink-500 text-white"
            : "text-gray-700 hover:bg-pink-500 hover:text-white"
        } ${title ? "mr-0 mt-[-4px]" : "mr-0"}`}
        onClick={() => setMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      {loggedIn && (
        <nav className="bg-white flex items-center justify-start">
          {/* Mobile nav button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-6xl p-2 fixed left-0 top-0"
          >
            <TbMenu2
              className={`${
                menuOpen ? "text-pink-500" : "text-pink-500 hover:text-pink-700"
              }`}
            />
          </button>

          {/* Desktop nav */}
          <div className="hidden flex-grow sm:flex items-center justify-start">
            <div className="flex gap-0">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/sites">Sites</NavLink>
              <button
                onClick={handleLogout}
                className="text-red-500 text-4xl uppercase cursor-pointer hover:bg-red-200 p-3"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-white shadow-md z-50">
              <div className="flex flex-col mt-28 p-2 space-y-1 items-center">
                <Link
                  href="#!"
                  className="text-7xl fixed left-1 top-2 text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  <IoClose />
                </Link>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/sites">Sites</NavLink>
                <button
                  onClick={handleLogout}
                  className="text-red-500 text-4xl uppercase cursor-pointer p-3"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      )}
    </>
  );
}

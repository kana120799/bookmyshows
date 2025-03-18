"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
// import { Menu, X, Search } from "lucide-react";
import { Search } from "lucide-react";
// import { ModeToggle } from "./ModeToggle";
import Image from "next/image";
import logo from "../public/image/logo.png";
import { Button } from "./ui/button";
import { RootState } from "@/GlobalState/store";
import { useDispatch, useSelector } from "react-redux";
import { setCityToggle } from "@/GlobalState/slices/citySlice";
import Login from "./Panel/Login";
import Register from "./Panel/Register";
import { handleSignOut } from "@/action/SignOut";
import { Input } from "./ui/input";
import { setMovieSearch } from "@/GlobalState/slices/searchMovieSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  // ("/customer/home/[city]")
  const isExactCityPath = /^\/customer\/home\/[^/]+$/.test(pathname);
  const { data: session, status } = useSession();
  console.log("j8df", session, status);
  const { selectedCity } = useSelector((state: RootState) => state.city);

  // const [isOpen, setIsOpen] = useState(false);
  const [toggleCredential, setToggleCredential] = useState(true);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [movieSearch, setMovieSearchLocal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(movieSearch, 500);

  useEffect(() => {
    dispatch(setMovieSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target as Node)
      ) {
        setIsLoginVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {/* Login/Register Overlay */}
      {isLoginVisible && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[500]" />
          <div className="fixed inset-0 flex items-center justify-center z-[700] min-h-[50rem]">
            <div ref={loginRef}>
              {toggleCredential ? (
                <Login
                  toggleCredential={toggleCredential}
                  setToggleCredential={setToggleCredential}
                  setIsLoginVisible={setIsLoginVisible}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                />
              ) : (
                <Register
                  toggleCredential={toggleCredential}
                  setToggleCredential={setToggleCredential}
                  setIsLoginVisible={setIsLoginVisible}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section: Logo + Search */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src={logo}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>

              {/* Search Bar */}
              {isExactCityPath && (
                <form
                  onSubmit={handleSearch}
                  className="hidden md:flex items-center gap-2"
                >
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={movieSearch}
                      onChange={(e) => setMovieSearchLocal(e.target.value)}
                      style={{ fontSize: "1.3rem" }}
                      className="pl-10 w-[30rem] lg:w-[40rem] h-[3rem] rounded-full "
                    />

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </form>
              )}
            </div>

            {/* Right Section: Navigation Items */}
            <div className=" flex items-center gap-6">
              <button
                onClick={() => {
                  if (isExactCityPath) dispatch(setCityToggle());
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors text-lg"
              >
                <span className="flex justify-center gap-3 font-bold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {selectedCity?.charAt(0).toUpperCase() +
                    selectedCity?.slice(1)}
                </span>
              </button>

              {!session?.user?.role && status !== "authenticated" ? (
                <Button
                  className="bg-[#F84464] hover:bg-[#F84464]/90 text-lg"
                  onClick={() => setIsLoginVisible(true)}
                >
                  Sign in
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user?.image || "/default-avatar.png"}
                        />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-lg  text-gray-800 dark:text-white font-bold">
                        {session.user?.name}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 mt-2">
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xl"
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Button */}
            {/* <button className="md:hidden" onClick={() => setIsOpen(true)}>
              <Menu size={28} className="text-gray-600" />
            </button> */}
          </div>
        </div>

        {/* Mobile Menu */}
        {/* <div
          className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden z-50`}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button onClick={() => setIsOpen(false)}>
                <X size={28} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {isExactCityPath && (
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            )}

            <button
              onClick={() => {
                dispatch(setCityToggle());
                setIsOpen(false);
              }}
              className="w-full text-left py-2 text-gray-600 hover:text-gray-900"
            >
              {selectedCity}
            </button>

            <Link
              href="/about"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              Sign out
            </Button>

            <Button
              className="w-full bg-[#F84464] hover:bg-[#F84464]/90"
              onClick={() => {
                setIsLoginVisible(true);
                setIsOpen(false);
              }}
            >
              Sign in
            </Button>
          </div>
        </div> */}
      </nav>
    </>
  );
}

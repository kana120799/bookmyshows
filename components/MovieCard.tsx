// import { MovieType } from "@/types/movieType";
// // import Image from "next/image";
// import React from "react";
// // import { cn } from "@/lib/utils";
// // import { Film, } from "lucide-react";
// import { Star } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";

// // import { Button } from "./ui/button";

// interface MovieCardProps {
//   data: MovieType;
//   selectedCity: string;
// }

// // MovieCard component
// const MovieCard = ({ data, selectedCity }: MovieCardProps) => {
//   const { data: session } = useSession();
//   const router = useRouter();
//   return (
//     <>
//       <div
//         key={data.id}
//         className="group bg-white max-w-[28rem] min-h-[43rem] max-h-[43rem] dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
//         onClick={() => {
//           if (session?.user.email) {
//             router.push(
//               `/customer/${selectedCity?.toLowerCase()}/movie/${data.id}`
//             );
//           } else {
//             toast.warning("Please sign in to continue.");
//           }
//         }}
//       >
//         {/* Image Container */}
//         <div className="relative min-h-[84%] overflow-hidden">
//           <div
//             className="absolute inset-0 bg-cover bg-center"
//             style={{
//               backgroundImage: data.Poster
//                 ? `url(${data.Poster})`
//                 : "linear-gradient(135deg, #9b87f5 0%, #6E59A5 100%)",
//             }}
//           />
//           <div className="absolute top-2 right-2 flex items-center bg-black/70 text-white px-2 py-1 rounded-md text-sm">
//             <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1 mb-1" />
//             <span className="text-lg">{data.rating?.toFixed(1)}</span>
//           </div>
//           {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//             <Button className="m-4 bg-pink-600 hover:bg-pink-700 w-full text-xl">
//               Book Tickets
//             </Button>
//           </div> */}
//         </div>

//         {/* Content Below */}
//         <div className="p-4">
//           <h3 className="font-bold text-gray-900 text-xl dark:text-white line-clamp-1">
//             {data.title}
//           </h3>
//           <div className="flex flex-wrap gap-1 mt-2">
//             {data.genre?.map((g, idx) => (
//               <span
//                 key={idx}
//                 className="text-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded"
//               >
//                 {g}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MovieCard;

import { MovieType } from "@/types/movieType";
import Image from "next/image";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MovieCardProps {
  data: MovieType;
  selectedCity: string;
}

const MovieCard = ({ data, selectedCity }: MovieCardProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  // Optimize Cloudinary URL with transformations (auto format, quality, and size)
  const optimizedImageUrl = data.Poster
    ? `${data.Poster}?_cld_=f_auto,q_auto,w_400`
    : "https://via.placeholder.com/400x600?text=No+Image";

  return (
    <div
      key={data.id}
      className="group bg-white max-w-[28rem] min-h-[43rem] max-h-[43rem] dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={() => {
        if (session?.user.email) {
          router.push(
            `/customer/${selectedCity?.toLowerCase()}/movie/${data.id}`
          );
        } else {
          toast.warning("Please sign in to continue.");
        }
      }}
    >
      {/* Image Container */}
      <div className="relative min-h-[84%] overflow-hidden">
        <Image
          src={optimizedImageUrl}
          alt={`${data.title} poster`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
          quality={75}
        />
        <div className="absolute top-2 right-2 flex items-center bg-black/70 text-white px-2 py-1 rounded-md text-sm">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1 mb-1" />
          <span className="text-lg">{data.rating?.toFixed(1)}</span>
        </div>
      </div>

      {/* Content Below */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-xl dark:text-white line-clamp-1">
          {data.title}
        </h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {data.genre?.map((g, idx) => (
            <span
              key={idx}
              className="text-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

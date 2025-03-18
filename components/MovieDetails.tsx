// import Image from "next/image";
// import { redirect } from "next/navigation";
// import React from "react";

// interface MovieCardProps {
//   id: string;
//   title: string;
//   rating: number;
//   voteCount: number;
//   duration: string;
//   genres: string[];
//   releaseDate: string;
//   language: string;
//   ageRating: string;
//   Poster?: string;
//   selectedCity: string;
// }

// const MovieDetails: React.FC<MovieCardProps> = ({
//   id = "jjsisd-338fjkdfjfsf",
//   title = "Chhaava",
//   rating = 9.3,
//   voteCount = 180000,
//   duration = "2h 41m",
//   genres = ["Action", "Drama", "Historical"],
//   releaseDate = "14 Feb, 2025",
//   language = "Hindi",
//   ageRating = "UA16+",
//   Poster = "/image/logo.png",
//   selectedCity,
// }) => {
//   return (
//     <div className="flex flex-col md:flex-row bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg w-full max-w-4xl mx-auto">
//       {/* Poster Section */}
//       <div className="w-full md:w-1/3">
//         <Image
//           src={Poster}
//           alt={`${title} poster`}
//           className="w-full h-full object-cover"
//           width={100}
//           height={80}
//         />
//       </div>

//       {/* Details Section */}
//       <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
//         <div>
//           <h2 className="text-2xl font-bold mb-2">{title}</h2>
//           <div className="flex items-center gap-2 mb-2">
//             <span className="text-yellow-400">★ {rating}/10</span>
//             <span className="text-gray-400">
//               ({voteCount.toLocaleString()} votes)
//             </span>
//             <button className="ml-4 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
//               Rate now
//             </button>
//           </div>
//           <div className="text-gray-300 mb-2">
//             <span>{language} • </span>
//             <span>2D, ICE, 4DX, IMAX 2D • </span>
//             <span>{duration}</span>
//           </div>
//           <div className="text-gray-400">
//             {genres.join(", ")} • {ageRating} • {releaseDate}
//           </div>
//         </div>
//         <button
//           className="mt-4 px-6 py-2 bg-pink-600 rounded text-white hover:bg-pink-700 w-full md:w-auto"
//           onClick={() => {
//             redirect(
//               `/customer/buyticket/${selectedCity.toLowerCase()}/movie/${id}?view=slot`
//             );
//           }}
//         >
//           Book tickets
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MovieDetails;

// import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Star } from "lucide-react";
import { useSession } from "next-auth/react";

interface MovieCardProps {
  id: string;
  title: string;
  description: string;
  rating: number;
  voteCount: number;
  duration: string;
  genres: string[];
  releaseDate: string;
  language: string;
  ageRating: string;
  Poster?: string;
  selectedCity: string;
}

function MovieDetails({
  id = "jjsisd-338fjkdfjfsf",
  description,
  title = "Chhaava",
  rating = 9.3,
  voteCount = 180000,
  duration = "2h 41m",
  genres = ["Action", "Drama", "Historical"],
  language = "Hindi",
  ageRating = "UA16+",
  Poster = "/image/logo.png",
  selectedCity,
}: MovieCardProps) {
  const { data: session } = useSession();

  console.log("dfjku", session);
  return (
    <>
      <div className="relative rounded-lg overflow-hidden  max-h-[47rem] ">
        <div className="absolute inset-0 w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: Poster
                ? `url(${Poster})`
                : "linear-gradient(135deg, #9b87f5 0%, #6E59A5 100%)",
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row p-6 text-white min-h-[50rem] max-h-[50rem]">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-full max-w-[240px] aspect-[2/3] rounded-lg overflow-hidden shadow-xl mb-4">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: Poster
                    ? `url(${Poster})`
                    : "linear-gradient(135deg, #9b87f5 0%, #6E59A5 100%)",
                }}
              />
            </div>

            {/*  trailer button */}
            {/* <Button
              variant="outline"
              className="w-full max-w-[240px] mt-4 bg-black/30 backdrop-blur-sm border-white/20 hover:bg-white/20"
            >
              <div className="mr-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-14 border-l-white"></div>
              Watch Trailer
            </Button> */}
          </div>

          <div className="w-full md:w-2/3 md:pl-8 mt-24">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6 mt-5">
              <Star className="w-6 h-6 text-pink-500 fill-pink-500" />
              <span className="text-xl font-bold">{rating.toFixed(1)}/10</span>
              {voteCount > 0 && (
                <span className="text-gray-400 text-lg h-8">
                  ({voteCount.toLocaleString()} Votes)
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md text-lg">
                {language}
              </span>
              {ageRating && (
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md text-lg">
                  {ageRating}
                </span>
              )}
              {genres.map((g, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md text-lg h-8"
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="text-gray-300 mb-8">{duration}</div>

            <div className="flex gap-4 mt-auto">
              <Button
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 text-xl h-12"
                onClick={() => {
                  if (!session) {
                    alert("Please! Login");
                  } else {
                    redirect(
                      `/customer/buyticket/${selectedCity.toLowerCase()}/movie/${id}?view=slot`
                    );
                  }
                }}
              >
                Book tickets
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-black/30 backdrop-blur-sm hover:bg-white/20 text-xl h-12"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
      <section className=" text-black mt-20 pl-24 ">
        <div className="text-4xl font-bold ">About the movie</div>

        <p className="mt-4 text-2xl">{description}</p>
      </section>
    </>
  );
}

export default MovieDetails;

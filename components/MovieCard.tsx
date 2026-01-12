import { MovieType } from "@/types/movieType";
import Image from "next/image";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MovieCardProps {
  data: MovieType;
  selectedCity: string | null;
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
      className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full h-full border border-gray-100 dark:border-gray-800 cursor-pointer flex flex-col"
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
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={optimizedImageUrl}
          alt={`${data.title} poster`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
          loading="lazy"
          quality={80}
        />
        <div className="absolute top-3 right-3 flex items-center bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-sm font-medium border border-white/10">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-1.5" />
          <span>{data.rating?.toFixed(1) || "N/A"}</span>
        </div>

        {/* Overlay on hover (Optional premium touch) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Below */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight line-clamp-1 mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-500 transition-colors">
          {data.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {data.genre?.slice(0, 3).map((g, idx) => (
            <span
              key={idx}
              className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md"
            >
              {g}
            </span>
          ))}
          {data.genre && data.genre.length > 3 && (
            <span className="text-xs font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-500 px-1.5 py-1 rounded-md">
              +{data.genre.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

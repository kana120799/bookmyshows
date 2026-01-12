import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const MovieSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="relative aspect-[2/3] w-full">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export const MovieGridSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <MovieSkeleton key={i} />
            ))}
        </div>
    );
};

export default MovieGridSkeleton;

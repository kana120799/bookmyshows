/**
 * @jest-environment node
 */
import '@testing-library/jest-dom'
import { getMoviesWithRegionShows } from '@/controllers/movieController';
import { NextResponse } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        movie: {
            findMany: jest.fn(),
        },
    },
}));

import { prisma } from '@/lib/prisma';

describe('Movie Controller - Integration', () => {
    it('fetches movies for a specific region successfully', async () => {
        const mockMovies = [
            { id: '1', title: 'Test Movie', releaseDate: new Date() }
        ];

        // Mock DB response
        (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

        // Call controller directly (Integration of Controller + Mocked DB)
        const response = await getMoviesWithRegionShows('mumbai');

        expect(response.status).toBe(200);

        const json = await response.json();
        expect(json.data).toHaveLength(1);
        expect(json.data[0].title).toBe('Test Movie');

        // Verify Prisma was called with correct filter structure
        expect(prisma.movie.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                shows: expect.objectContaining({
                    some: expect.anything()
                })
            })
        }));
    });

    it('throws error when no movies found', async () => {
        (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

        await expect(getMoviesWithRegionShows('unknown-city'))
            .rejects
            .toThrow('No movies with shows found in unknown-city');
    });
});

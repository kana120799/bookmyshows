type SeatLayout = {
  seats: unknown[]; // You could define a more specific type for seats if known
  totalSeats: number;
};

export type hallType = {
  name: string;
  seats: SeatLayout; // Changed from layout to seats to match your input
};

export type addressType = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

// types/cinema.ts
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CinemaHall {
  id: string;
  name: string;
  layout: JSON; // You might want to define a more specific type for layout
  totalSeats: number;
}

export interface Cinema {
  id: string;
  name: string;
  addressId: string | null;
  address: Address;
  halls: CinemaHall[];
}

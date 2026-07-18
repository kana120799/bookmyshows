type SeatLayout = {
  seats: unknown[];
  totalSeats: number;
};

export type hallType = {
  name: string;
  seats: SeatLayout;
};

export type addressType = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

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
  layout: JSON;
  totalSeats: number;
}

export interface Cinema {
  id: string;
  name: string;
  addressId: string | null;
  address: Address;
  halls: CinemaHall[];
}

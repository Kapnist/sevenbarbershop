export interface SalonLocation {
  name: string;
  city: string;
  region: string;
  bookingUrl?: string;
  detailsPath?: string;
  streetAddress?: string;
  postalCode?: string;
  /** Horaires au format schema.org, par exemple "Mo-Sa 09:00-19:00". */
  openingHours?: string[];
  image?: string;
}

export const salonLocations: SalonLocation[] = [
  {
    name: "Anatole France",
    city: "Saint-Étienne",
    region: "Loire",
    bookingUrl: "https://www.planity.com/seven-barbershop-42100-saint-etienne",
    detailsPath: "/salons/anatole-france",
    streetAddress: "12 Rue du 11 Novembre",
    postalCode: "42100",
    openingHours: ["Mo-Sa 09:00-19:00"],
    image: "/images/anatole-france/devanture.png",
  },
  {
    name: "Jean Jaurès",
    city: "Saint-Étienne",
    region: "Loire",
    bookingUrl: "https://www.planity.com/seven-barbershop-42000-saint-etienne",
    detailsPath: "/salons/jean-jaures",
    streetAddress: "1 Place Jean Jaurès",
    postalCode: "42000",
    openingHours: ["Tu-Sa 10:00-20:00"],
    image: "/images/jean-jaures/photo-1.webp",
  },
  {
    name: "Place Chavanelle",
    city: "Saint-Étienne",
    region: "Loire",
    bookingUrl: "https://www.planity.com/seven-barber-shop-42000-saint-etienne",
    detailsPath: "/salons/chavanelle",
    streetAddress: "17 Place Chavanelle",
    postalCode: "42000",
    openingHours: ["Mo-Sa 09:00-19:00"],
    image: "/images/chavanelle/photo-1.webp",
  },
  {
    name: "Le Port",
    city: "Nice",
    region: "Alpes-Maritimes",
    bookingUrl: "https://www.planity.com/seven-barber-le-port-nice-06300",
    detailsPath: "/salons/le-port",
    streetAddress: "1 Boulevard Carnot",
    postalCode: "06300",
    openingHours: ["Tu-Sa 09:30-19:00"],
    image: "/images/le-port/photo-1.webp",
  },
  {
    name: "Rue Meyerbeer",
    city: "Nice",
    region: "Alpes-Maritimes",
    bookingUrl: "https://www.planity.com/seven-barbershop-06000-nice",
    detailsPath: "/salons/meyerbeer",
    streetAddress: "4 Rue Meyerbeer",
    postalCode: "06000",
    openingHours: ["Mo-Sa 09:30-19:00"],
    image: "/images/meyerbeer/photo-2.webp",
  },
];
